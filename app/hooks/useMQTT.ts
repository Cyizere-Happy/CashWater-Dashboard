'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Paho from 'paho-mqtt';

// ─── Broker Config ───────────────────────────────────────────
const MQTT_HOST = "broker.emqx.io";
const MQTT_WS_PORT = 8083;

// ─── Topics ──────────────────────────────────────────────────
const TOPIC_FLOW = "sensors/flow_rate";     // {flow_lpm, total_L, valve}
const TOPIC_ANOMALY = "sensors/anomaly";        // {score, leak_detected, flow_lpm, baseline_lpm}
const TOPIC_HEARTBEAT = "sensors/heartbeat";      // {uptime_s, rssi, flow_lpm, ip}
const TOPIC_VALVE_STATE = "sensors/valve_state";    // {state: "OPEN"|"CLOSED"}

// Legacy / revenue topics (kept — intentional for org analytics)
const TOPIC_LED_STATE = "control/led/status_happy";

// Commands outbound
const TOPIC_VALVE_CMD = "control/valve";          // publish "OPEN" or "CLOSED"
const TOPIC_ANOMALY_SCAN = "control/anomaly_scan";  // publish "TRIGGER" or "ACKNOWLEDGE"

// ─── Types ───────────────────────────────────────────────────
export interface MQTTState {
    // Connection
    isConnected: boolean;
    mqttMessage: string;

    // Water sensor (hardware)
    flowRate: number | null;     // L/min, live from YF-S201
    totalVolume: number | null;     // Litres accumulated
    valveState: 'OPEN' | 'CLOSED' | null;
    leakDetected: boolean;
    anomalyScore: number;            // 0–100
    anomalyBaseline: number | null;     // EMA baseline L/min from firmware
    lastHeartbeat: string | null;     // human-readable time string

    // Revenue / Org metrics (remain intentional — managed separately)
    revenueTarget: number | null;
    households: number | null;
    revenue: number | null;
    anomalies: string;            // legacy AI guard display string

    // Actions
    sendValveCommand: (cmd: 'OPEN' | 'CLOSED') => void;
    sendAnomalyScan: (action: 'TRIGGER' | 'ACKNOWLEDGE') => void;
    sendLedCommand: (state: 'ON' | 'OFF') => void;  // legacy
    publishMessage: (topic: string, message: string) => void;
}

export function useMQTT(): MQTTState {
    // ── Connection ──────────────────────────────────────────
    const [isConnected, setIsConnected] = useState(false);
    const [mqttMessage, setMqttMessage] = useState('Connecting to broker...');

    // ── Hardware Data ────────────────────────────────────────
    const [flowRate, setFlowRate] = useState<number | null>(null);
    const [totalVolume, setTotalVolume] = useState<number | null>(null);
    const [valveState, setValveState] = useState<'OPEN' | 'CLOSED' | null>(null);
    const [leakDetected, setLeakDetected] = useState(false);
    const [anomalyScore, setAnomalyScore] = useState(0);
    const [anomalyBaseline, setAnomalyBaseline] = useState<number | null>(null);
    const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

    // ── Org / Revenue (intentional — kept) ──────────────────
    const [revenueTarget, setRevenueTarget] = useState<number | null>(78.5);
    const [households, setHouseholds] = useState<number | null>(12450);
    const [revenue, setRevenue] = useState<number | null>(45280);
    const [anomalies, setAnomalies] = useState<string>('0 SECURE');

    const clientRef = useRef<Paho.Client | null>(null);

    useEffect(() => {
        const clientID = "web_ui_" + Math.random().toString(16).slice(2, 10);
        const client = new Paho.Client(MQTT_HOST, MQTT_WS_PORT, clientID);
        clientRef.current = client;

        client.onConnectionLost = (responseObject) => {
            setIsConnected(false);
            setMqttMessage("Bridge Offline: " + responseObject.errorMessage);
        };

        client.onMessageArrived = (message) => {
            const topic = message.destinationName;
            const payload = message.payloadString;

            try {
                // ── Live water-sensor data ───────────────────
                if (topic === TOPIC_FLOW) {
                    const d = JSON.parse(payload);
                    if (typeof d.flow_lpm === 'number') setFlowRate(d.flow_lpm);
                    if (typeof d.total_L === 'number') setTotalVolume(d.total_L);
                    if (d.valve === 'OPEN' || d.valve === 'CLOSED') setValveState(d.valve);
                }

                // ── Anomaly / AI detection ───────────────────
                else if (topic === TOPIC_ANOMALY) {
                    const d = JSON.parse(payload);
                    if (typeof d.score === 'number') setAnomalyScore(d.score);
                    if (typeof d.leak_detected === 'boolean') setLeakDetected(d.leak_detected);
                    if (typeof d.baseline_lpm === 'number') setAnomalyBaseline(d.baseline_lpm);
                    // Sync legacy anomalies string for MetricsSidebar UI state
                    if (typeof d.leak_detected === 'boolean') {
                        setAnomalies(d.leak_detected ? '1 FLAG' : '0 SECURE');
                    }
                }

                // ── Valve state confirmation ──────────────────
                else if (topic === TOPIC_VALVE_STATE) {
                    const d = JSON.parse(payload);
                    if (d.state === 'OPEN' || d.state === 'CLOSED') setValveState(d.state);
                }

                // ── Device heartbeat ─────────────────────────
                else if (topic === TOPIC_HEARTBEAT) {
                    const d = JSON.parse(payload);
                    const rssi = typeof d.rssi === 'number' ? `${d.rssi} dBm` : '';
                    const uptime = typeof d.uptime_s === 'number'
                        ? `${Math.floor(d.uptime_s / 60)}m ${d.uptime_s % 60}s`
                        : '';
                    setLastHeartbeat(`Last sync: ${new Date().toLocaleTimeString()} · HW uptime ${uptime} · RSSI ${rssi}`);
                    setMqttMessage("Live Data Bridge Active");
                }

                // ── Legacy LED / anomaly command ─────────────
                else if (topic === TOPIC_LED_STATE) {
                    const s = payload.toUpperCase();
                    setAnomalies(s === 'ON' ? '1 FLAG' : '0 SECURE');
                }

            } catch (e) {
                console.error("[useMQTT] Parse error on", topic, e);
            }
        };

        const connectOptions: Paho.ConnectionOptions = {
            useSSL: false,
            timeout: 10,
            onSuccess: () => {
                setIsConnected(true);
                setMqttMessage("Live Data Bridge Active");
                client.subscribe(TOPIC_FLOW);
                client.subscribe(TOPIC_ANOMALY);
                client.subscribe(TOPIC_VALVE_STATE);
                client.subscribe(TOPIC_HEARTBEAT);
                client.subscribe(TOPIC_LED_STATE);
            },
            onFailure: (err) => {
                setIsConnected(false);
                setMqttMessage("Broker Error: " + err.errorMessage);
            }
        };

        try {
            client.connect(connectOptions);
        } catch (e) {
            setMqttMessage("Init Failed");
        }

        return () => {
            if (client.isConnected()) client.disconnect();
        };
    }, []);

    // ── Publish helper ───────────────────────────────────────
    const publishMessage = useCallback((topic: string, message: string) => {
        const client = clientRef.current;
        if (client && client.isConnected()) {
            const msg = new Paho.Message(message);
            msg.destinationName = topic;
            client.send(msg);
        }
    }, []);

    // ── Valve command (from dashboard CUT OFF / RESTORE) ─────
    const sendValveCommand = useCallback((cmd: 'OPEN' | 'CLOSED') => {
        publishMessage(TOPIC_VALVE_CMD, JSON.stringify({ cmd }));
        // Optimistic local update — confirmed by firmware echo on TOPIC_VALVE_STATE
        setValveState(cmd);
    }, [publishMessage]);

    // ── Anomaly scan actions ──────────────────────────────────
    const sendAnomalyScan = useCallback((action: 'TRIGGER' | 'ACKNOWLEDGE') => {
        publishMessage(TOPIC_ANOMALY_SCAN, action);
        if (action === 'ACKNOWLEDGE') {
            setAnomalies('0 SECURE');
            setLeakDetected(false);
            setAnomalyScore(0);
        }
    }, [publishMessage]);

    // ── Legacy LED command ────────────────────────────────────
    const sendLedCommand = useCallback((state: 'ON' | 'OFF') => {
        publishMessage(TOPIC_LED_STATE, state);
        setAnomalies(state === 'ON' ? '1 FLAG' : '0 SECURE');
    }, [publishMessage]);

    return {
        isConnected,
        mqttMessage,
        flowRate,
        totalVolume,
        valveState,
        leakDetected,
        anomalyScore,
        anomalyBaseline,
        lastHeartbeat,
        revenueTarget,
        households,
        revenue,
        anomalies,
        sendValveCommand,
        sendAnomalyScan,
        sendLedCommand,
        publishMessage,
    };
}
