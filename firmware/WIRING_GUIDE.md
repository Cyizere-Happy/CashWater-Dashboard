# CashWater — Hardware Wiring Guide

## Component List

| Component | Qty |
|---|---|
| ESP8266 NodeMCU (ESP-12E / Wemos D1 Mini) | 1 |
| YF-S201 Water Flow Sensor | 1 |
| 12V Solenoid Valve | 1 |
| 1-Channel 5V Relay Module | 1 |
| 12V Power Supply | 1 |
| USB Cable (for NodeMCU programming) | 1 |
| Breadboard | 1 |
| Jumper Wires | ~15 |
| Water pipe / tubing (fits YF-S201 G1/2") | as needed |
| Water source (bucket/tank) | 1 |
| Output bucket/container | 1 |
| 10kΩ resistor (optional, flow sensor pull-up) | 1 |

---

## Pin Reference (NodeMCU Labels → GPIO)

| NodeMCU Label | GPIO | Used For |
|---|---|---|
| D1 | GPIO 5 | Relay IN signal |
| D2 | GPIO 4 | Flow sensor signal |
| D4 | GPIO 2 | Built-in LED (status) |
| 3V3 | — | Flow sensor VCC |
| 5V (VIN) | — | Relay VCC |
| GND | — | Common ground |

---

## Wiring Step-by-Step

### Step 1 — Common Ground
Connect a ground rail on your breadboard. Bridge:
- NodeMCU `GND` → breadboard GND rail
- Relay module `GND` → breadboard GND rail  
- Flow sensor `Black wire` → breadboard GND rail
- 12V power supply negative (−) → breadboard GND rail

> ⚠️ All grounds **must** share the same rail. Floating grounds cause erratic readings.

---

### Step 2 — Power the Flow Sensor
The YF-S201 operates at 5V (but the signal output is 3.3V-safe at LOW current).

| YF-S201 Wire | Connect To |
|---|---|
| Red (+5V) | NodeMCU `3V3` pin (or 5V from breadboard — both work; 3.3V = safer for NodeMCU signal) |
| Black (GND) | GND rail |
| Yellow (Signal) | NodeMCU `D2` (GPIO 4) |

> **Optional pull-up**: Place a 10kΩ resistor between the Yellow signal wire and 3.3V. NodeMCU's internal `INPUT_PULLUP` in the firmware already handles this.

---

### Step 3 — Power the Relay Module
| Relay Pin | Connect To |
|---|---|
| VCC | NodeMCU `VIN` (5V from USB) |
| GND | GND rail |
| IN | NodeMCU `D1` (GPIO 5) |

---

### Step 4 — Wire the 12V Solenoid Via Relay
The relay switches the 12V supply to the solenoid safely.

```
12V PSU (+) ──────────────── Relay COM (Common)
                              Relay NO  (Normally Open) ──── Solenoid (+)
12V PSU (−) ────────────────────────────────────────────── Solenoid (−)
```

> Use **NO (Normally Open)** so the solenoid only gets power when the relay is energised (valve open). On power loss, the valve closes automatically — this is a safe default.

> ⚠️ **Never connect 12V to NodeMCU pins.** The relay module provides complete electrical isolation via its built-in opto-coupler.

---

### Step 5 — Plumbing
```
[Water Tank/Bucket]
        │
        │  (hose/pipe)
        ▼
[YF-S201 Flow Sensor]  ← measure flow here
        │
        │  (hose/pipe)
        ▼
[12V Solenoid Valve]   ← open = water flows, closed = blocked
        │
        │  (hose/pipe)
        ▼
[Output Bucket]
```

Connect pipes/tubing to the **G1/2" threaded fittings** on the YF-S201 and solenoid using appropriate push-fit or barbed hose fittings + clamps. Ensure flow direction arrows on the sensor and valve are followed.

---

## Full Wiring Diagram (Text)

```
                         USB (to PC/programmer)
                              │
┌──────────────────────────── NodeMCU ─────────────────────────────────┐
│  3V3 ─────────────────────────────────────── Flow Sensor RED (+)     │
│  GND ────────────────── GND Rail ─────────── Flow Sensor BLACK (-)   │
│  D2  ─────────────────────────────────────── Flow Sensor YELLOW (Sig)│
│                                                                       │
│  VIN (5V) ─────────────── Relay VCC                                  │
│  GND ────────────────────── Relay GND                                │
│  D1  ─────────────────────────────────────── Relay IN                │
│                                                                       │
│  D4  ─── (Built-in LED for status)                                   │
└───────────────────────────────────────────────────────────────────────┘

Relay Module:
  COM ──── 12V PSU (+)
  NO  ──── Solenoid Valve (+)
           Solenoid Valve (-) ──── 12V PSU (-)
```

---

## Power Supply Notes

| Device | Voltage | Current |
|---|---|---|
| NodeMCU | 5V via USB | ~200mA |
| Relay Module | 5V from NodeMCU VIN | ~70mA |
| Flow Sensor | 3.3–5V | ~15mA |
| Solenoid Valve | **12V DC** | ~500mA–1A |

> Use a dedicated **12V 1A+ power supply** for the solenoid. Do NOT power the solenoid from the NodeMCU or USB — it will brown out or damage the board.

---

## Assembly Order (Recommended)

1. Set up breadboard with GND rail
2. Mount NodeMCU on breadboard
3. Wire relay module (before connecting 12V)
4. Wire flow sensor signal + power
5. Test NodeMCU + relay with firmware loaded (LED on D4 proves basic connectivity)
6. Connect 12V PSU → relay → solenoid **last**, only after verifying logic works
7. Prime plumbing connections (no leaks in fittings) before powering water through

---

## Serial Monitor Confirmation

When firmware starts correctly you should see:
```
[CashWater] Booting...
[WiFi] Connecting to YOUR_WIFI_SSID......
[WiFi] Connected! IP: 192.168.x.x
[MQTT] Connecting to 157.173.101.159:1883...
[MQTT] Connected!
[MQTT] Subscribed to control/valve
[VALVE] Set to: OPEN
[CashWater] Ready.
[HB] Uptime: 10s | RSSI: -58 dBm
```

Open a water tap connected to the sensor to verify pulses are counted and flow rate appears.