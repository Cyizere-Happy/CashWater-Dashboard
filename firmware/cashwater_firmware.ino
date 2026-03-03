/*
 * ============================================================
 *   CashWater — ESP8266 NodeMCU Firmware
 *   Water Flow Monitor + Solenoid Valve Controller
 * ============================================================
 *
 *  HARDWARE:
 *    - ESP8266 NodeMCU (ESP-12E)
 *    - YF-S201 Water Flow Sensor  → D2 (GPIO 4)  [with 10kΩ pull-up to 3.3V]
 *    - 1-Channel 5V Relay Module  → D1 (GPIO 5)  [Active-LOW, controls 12V solenoid]
 *    - Built-in LED               → D4 (GPIO 2)  [status indicator]
 *
 *  LIBRARIES REQUIRED (install via Arduino Library Manager):
 *    - PubSubClient by Nick O'Leary  (MQTT)
 *    - ArduinoJson by Benoit Blanchon
 *    - ESP8266WiFi (built-in with esp8266 boards package)
 *    - NTPClient by Fabrice Weinberg (for time-based night detection)
 *
 *  BOARD: NodeMCU 1.0 (ESP-12E Module)
 *  BAUD RATE: 115200
 * ============================================================
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUDP.h>

// ─── WiFi Credentials ────────────────────────────────────────
#define WIFI_SSID   "YOUR_WIFI_SSID"
#define WIFI_PASS   "YOUR_WIFI_PASSWORD"

// ─── MQTT Broker ─────────────────────────────────────────────
#define MQTT_HOST   "157.173.101.159"
#define MQTT_PORT   1883
#define MQTT_CLIENT_ID "cashwater_esp8266"

// ─── MQTT Topics ─────────────────────────────────────────────
#define TOPIC_FLOW      "sensors/flow_rate"
#define TOPIC_ANOMALY   "sensors/anomaly"
#define TOPIC_HEARTBEAT "sensors/heartbeat"
#define TOPIC_VALVE_STATE "sensors/valve_state"
#define TOPIC_VALVE_CMD   "control/valve"         // Subscribes to this

// ─── Hardware Pins ────────────────────────────────────────────
#define FLOW_SENSOR_PIN  4   // D2 on NodeMCU — interrupt-capable
#define RELAY_PIN        5   // D1 on NodeMCU — active LOW relay
#define LED_PIN          2   // D4 on NodeMCU — built-in LED (active LOW)

// ─── Flow Sensor Config (YF-S201) ────────────────────────────
// YF-S201 outputs ~7.5 pulses per litre/min of flow
#define PULSES_PER_LITRE  450.0   // pulses per litre (7.5 Hz * 60s = 450/L)

// ─── Leak Detection Config ────────────────────────────────────
#define ANOMALY_WINDOW_SIZE      60     // seconds of rolling history
#define NIGHT_HOUR_START         23     // 11 PM — night begins
#define NIGHT_HOUR_END           5      // 5 AM  — night ends
#define SUSTAINED_FLOW_THRESH    1.0    // L/min: sustained flow threshold for leak
#define SUSTAINED_FLOW_MIN_SECS  90     // seconds before sustained flow = anomaly
#define SPIKE_MULTIPLIER         3.0    // flow must be 3x baseline to be a spike
#define CLOSED_VALVE_FLOW_THRESH 0.3    // L/min: any flow above this when valve is closed = definite leak
#define ANOMALY_SCORE_THRESHOLD  40     // score >= this → leak_detected = true

// ─── Globals ──────────────────────────────────────────────────
volatile unsigned long pulseCount = 0;
float flowRate_lpm    = 0.0;
float totalVolume_L   = 0.0;
bool  valveOpen       = true;   // assume open at boot
int   anomalyScore    = 0;
bool  leakDetected    = false;

// Rolling flow window for statistical analysis
float flowWindow[ANOMALY_WINDOW_SIZE];
int   windowIdx        = 0;
bool  windowFull       = false;

// Sustained flow tracking
float sustainedFlowStart = 0;
bool  sustainedFlowing   = false;
unsigned long sustainedStartMs = 0;

// EMA baseline
float emaBaseline = 0.0;
bool  baselineInit = false;

// Timing
unsigned long lastFlowCalc   = 0;
unsigned long lastPublish     = 0;
unsigned long lastHeartbeat   = 0;
unsigned long lastAnomaly     = 0;
const unsigned long FLOW_INTERVAL_MS  = 1000;   // calc flow every 1s
const unsigned long PUBLISH_INTERVAL  = 2000;   // publish sensor data every 2s
const unsigned long HEARTBEAT_INTERVAL = 10000; // heartbeat every 10s
const unsigned long ANOMALY_INTERVAL  = 5000;   // anomaly calc every 5s

// NTP for night-time detection
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7200); // UTC+2 (CAT)

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ─── ISR: Count pulses from flow sensor ──────────────────────
ICACHE_RAM_ATTR void flowPulseISR() {
    pulseCount++;
}

// ─── Setup ───────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n[CashWater] Booting...");

    // Pins
    pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);

    // Relay: active LOW — HIGH = solenoid OPEN (valve open)
    setValve(true);

    // Flow sensor interrupt
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseISR, RISING);

    // Init anomaly window
    memset(flowWindow, 0, sizeof(flowWindow));

    connectWiFi();

    // NTP time
    timeClient.begin();
    timeClient.update();

    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setBufferSize(512);

    connectMQTT();

    Serial.println("[CashWater] Ready.");
}

// ─── Main Loop ───────────────────────────────────────────────
void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }
    if (!mqttClient.connected()) {
        connectMQTT();
    }
    mqttClient.loop();
    timeClient.update();

    unsigned long now = millis();

    // ── Calculate flow rate every 1s ──────────────────────────
    if (now - lastFlowCalc >= FLOW_INTERVAL_MS) {
        lastFlowCalc = now;

        noInterrupts();
        unsigned long pulses = pulseCount;
        pulseCount = 0;
        interrupts();

        // YF-S201: flow (L/min) = pulses / 7.5
        // Since we measure over 1 second: pulses_per_sec / 7.5 = L/min
        flowRate_lpm = (float)pulses / 7.5;

        // Accumulate volume: L/min * (1s/60s) = litres per interval
        totalVolume_L += flowRate_lpm / 60.0;

        // Update rolling window
        flowWindow[windowIdx] = flowRate_lpm;
        windowIdx = (windowIdx + 1) % ANOMALY_WINDOW_SIZE;
        if (windowIdx == 0) windowFull = true;

        // Update EMA baseline (exponential moving average, α=0.02 = very slow)
        if (!baselineInit && flowRate_lpm > 0.0) {
            emaBaseline = flowRate_lpm;
            baselineInit = true;
        } else if (baselineInit) {
            emaBaseline = 0.02f * flowRate_lpm + 0.98f * emaBaseline;
        }

        // Track sustained flow
        if (flowRate_lpm >= SUSTAINED_FLOW_THRESH) {
            if (!sustainedFlowing) {
                sustainedFlowing = true;
                sustainedStartMs = now;
            }
        } else {
            sustainedFlowing = false;
            sustainedStartMs = 0;
        }

        // Blink LED with flow rate intensity
        digitalWrite(LED_PIN, (flowRate_lpm > 0.1) ? LOW : HIGH); // LOW = ON for NodeMCU
    }

    // ── Anomaly detection every 5s ────────────────────────────
    if (now - lastAnomaly >= ANOMALY_INTERVAL) {
        lastAnomaly = now;
        anomalyScore = computeAnomalyScore(now);
        leakDetected = (anomalyScore >= ANOMALY_SCORE_THRESHOLD);

        Serial.printf("[ANOMALY] Score: %d | Leak: %s | Flow: %.2f L/min\n",
            anomalyScore, leakDetected ? "YES" : "NO", flowRate_lpm);

        publishAnomaly();
    }

    // ── Publish sensor data every 2s ──────────────────────────
    if (now - lastPublish >= PUBLISH_INTERVAL) {
        lastPublish = now;
        publishFlowData();
        publishValveState();
    }

    // ── Heartbeat every 10s ───────────────────────────────────
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
        lastHeartbeat = now;
        publishHeartbeat();
    }
}

// ════════════════════════════════════════════════════════════
//   LEAK DETECTION — Multi-Factor Algorithm
// ════════════════════════════════════════════════════════════
/*
 * Anomaly Score (0–100) is a weighted combination of four independent factors:
 *
 * Factor 1 — Valve-Closed Flow (weight: 60 pts) [HIGHEST CONFIDENCE]
 *   If the valve is commanded CLOSED but we still detect flow > threshold,
 *   water is escaping somewhere it shouldn't — almost certainly a pipe burst
 *   or bypass leak.
 *
 * Factor 2 — Statistical Z-Score Spike (weight: 0–25 pts)
 *   Compares current flow against the rolling standard deviation of the recent
 *   window. A z-score of 2+ = unusual, 3+ = very unusual.
 *   Catches sudden demand spikes or burst events mid-day.
 *
 * Factor 3 — Sustained Abnormal Flow (weight: 0–10 pts)
 *   If flow has been continuously above SUSTAINED_FLOW_THRESH for more than
 *   SUSTAINED_FLOW_MIN_SECS, it indicates something is running without stopping
 *   (running tap, open pipe joint, etc.).
 *
 * Factor 4 — Night-Time Flow Anomaly (weight: 5 pts)
 *   Between NIGHT_HOUR_START and NIGHT_HOUR_END, expected household consumption
 *   is ~0. Any non-trivial flow at night is suspicious.
 *   This is a classic forensic water audit technique.
 *
 * Total maximum = 100. Leak is declared when score >= ANOMALY_SCORE_THRESHOLD (40).
 */
int computeAnomalyScore(unsigned long nowMs) {
    int score = 0;
    int samplesUsed = windowFull ? ANOMALY_WINDOW_SIZE : windowIdx;
    if (samplesUsed == 0) return 0;

    // ── Compute rolling mean and standard deviation ──────────
    float mean = 0.0;
    for (int i = 0; i < samplesUsed; i++) mean += flowWindow[i];
    mean /= (float)samplesUsed;

    float variance = 0.0;
    for (int i = 0; i < samplesUsed; i++) {
        float diff = flowWindow[i] - mean;
        variance += diff * diff;
    }
    float stddev = sqrt(variance / (float)samplesUsed);

    // ── Factor 1: Flow when valve is CLOSED ──────────────────
    if (!valveOpen && flowRate_lpm > CLOSED_VALVE_FLOW_THRESH) {
        int f1 = (int)(min(flowRate_lpm / CLOSED_VALVE_FLOW_THRESH, 2.0f) * 30.0f);
        score += min(f1, 60);
        Serial.printf("[F1] Valve-closed flow detected: +%d pts\n", min(f1, 60));
    }

    // ── Factor 2: Z-Score spike detection ────────────────────
    if (stddev > 0.05f) {
        float zScore = fabs(flowRate_lpm - mean) / stddev;
        int f2 = (int)(zScore * 8.0f);  // z=1 → 8 pts, z=3 → 24 pts, capped at 25
        score += min(f2, 25);
        if (f2 > 5) Serial.printf("[F2] Z-score %.2f: +%d pts\n", zScore, min(f2, 25));
    }

    // ── Factor 3: Sustained flow over time ────────────────────
    if (sustainedFlowing) {
        unsigned long sustainedSecs = (nowMs - sustainedStartMs) / 1000UL;
        if (sustainedSecs >= SUSTAINED_FLOW_MIN_SECS) {
            int f3 = (int)min((float)sustainedSecs / 60.0f, 10.0f);
            score += f3;
            Serial.printf("[F3] Sustained %lu s: +%d pts\n", sustainedSecs, f3);
        }
    }

    // ── Factor 4: Night-time flow anomaly ─────────────────────
    int currentHour = timeClient.getHours();
    bool isNight = (currentHour >= NIGHT_HOUR_START || currentHour < NIGHT_HOUR_END);
    if (isNight && flowRate_lpm > 0.5f) {
        score += 5;
        Serial.printf("[F4] Night-time flow (hour %d): +5 pts\n", currentHour);
    }

    return min(score, 100);
}

// ════════════════════════════════════════════════════════════
//   MQTT PUBLISH FUNCTIONS
// ════════════════════════════════════════════════════════════
void publishFlowData() {
    StaticJsonDocument<200> doc;
    doc["flow_lpm"]     = round(flowRate_lpm * 100.0) / 100.0;
    doc["total_L"]      = round(totalVolume_L * 10.0) / 10.0;
    doc["valve"]        = valveOpen ? "OPEN" : "CLOSED";
    char buf[200];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_FLOW, buf, true);
}

void publishValveState() {
    StaticJsonDocument<64> doc;
    doc["state"] = valveOpen ? "OPEN" : "CLOSED";
    char buf[64];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_VALVE_STATE, buf, true);
}

void publishAnomaly() {
    StaticJsonDocument<200> doc;
    doc["score"]         = anomalyScore;
    doc["leak_detected"] = leakDetected;
    doc["flow_lpm"]      = round(flowRate_lpm * 100.0) / 100.0;
    doc["valve"]         = valveOpen ? "OPEN" : "CLOSED";
    doc["baseline_lpm"]  = round(emaBaseline * 100.0) / 100.0;
    char buf[200];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_ANOMALY, buf, true);
}

void publishHeartbeat() {
    StaticJsonDocument<128> doc;
    doc["uptime_s"]     = millis() / 1000;
    doc["rssi"]         = WiFi.RSSI();
    doc["flow_lpm"]     = round(flowRate_lpm * 100.0) / 100.0;
    doc["ip"]           = WiFi.localIP().toString();
    char buf[128];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_HEARTBEAT, buf);
    Serial.printf("[HB] Uptime: %lus | RSSI: %d dBm\n", millis() / 1000, WiFi.RSSI());
}

// ════════════════════════════════════════════════════════════
//   MQTT CALLBACK — incoming commands
// ════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    char message[length + 1];
    memcpy(message, payload, length);
    message[length] = '\0';

    Serial.printf("[MQTT] Received on %s: %s\n", topic, message);

    if (strcmp(topic, TOPIC_VALVE_CMD) == 0) {
        // Accept both JSON {"cmd":"OPEN"} and plain "OPEN"/"CLOSED"
        StaticJsonDocument<64> doc;
        DeserializationError err = deserializeJson(doc, message);

        String cmd;
        if (!err && doc.containsKey("cmd")) {
            cmd = doc["cmd"].as<String>();
        } else {
            cmd = String(message);
        }
        cmd.toUpperCase();

        if (cmd == "OPEN") {
            setValve(true);
            Serial.println("[VALVE] Opened by dashboard command.");
        } else if (cmd == "CLOSED" || cmd == "CLOSE") {
            setValve(false);
            Serial.println("[VALVE] Closed by dashboard command.");
        }
        // Immediately publish the new state
        publishValveState();
        publishFlowData();
    }
}

// ════════════════════════════════════════════════════════════
//   VALVE CONTROL
// ════════════════════════════════════════════════════════════
void setValve(bool open) {
    valveOpen = open;
    // Relay is ACTIVE-LOW: LOW = relay ON = solenoid energised = valve OPEN
    // HIGH = relay OFF = solenoid de-energised = valve CLOSED (spring return)
    digitalWrite(RELAY_PIN, open ? LOW : HIGH);
    Serial.printf("[VALVE] Set to: %s\n", open ? "OPEN" : "CLOSED");
}

// ════════════════════════════════════════════════════════════
//   NETWORK HELPERS
// ════════════════════════════════════════════════════════════
void connectWiFi() {
    Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[WiFi] Failed to connect. Will retry in loop.");
    }
}

void connectMQTT() {
    int attempts = 0;
    while (!mqttClient.connected() && attempts < 5) {
        Serial.printf("[MQTT] Connecting to %s:%d...\n", MQTT_HOST, MQTT_PORT);
        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("[MQTT] Connected!");
            mqttClient.subscribe(TOPIC_VALVE_CMD);
            Serial.printf("[MQTT] Subscribed to %s\n", TOPIC_VALVE_CMD);
        } else {
            Serial.printf("[MQTT] Failed (state=%d). Retry in 3s...\n", mqttClient.state());
            delay(3000);
        }
        attempts++;
    }
}
