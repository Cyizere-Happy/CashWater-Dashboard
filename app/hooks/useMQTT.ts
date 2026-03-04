'use client';

import { useEffect, useState, useRef } from 'react';
import Paho from 'paho-mqtt';

const host = "157.173.101.159";
const wsPort = 9001;
const TOPIC_DATA = "sensors/dht_happy";
const TOPIC_LED_STATE = "control/led/status_happy";

export function useMQTT() {
    const [isConnected, setIsConnected] = useState(false);
    const [revenueTarget, setRevenueTarget] = useState<number | null>(78.5);
    const [households, setHouseholds] = useState<number | null>(0);
    const [unpaidBills, setUnpaidBills] = useState<number>(0);
    const [revenue, setRevenue] = useState<number | null>(45280);
    const [anomalies, setAnomalies] = useState<string>('0 SECURE');
    const [mqttMessage, setMqttMessage] = useState('Analytics Bridge Active');
    const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

    const clientRef = useRef<Paho.Client | null>(null);

    // Fetch real device data from API
    useEffect(() => {
        let isMounted = true;
        let failCount = 0;

        const fetchStats = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
            if (!token || !isMounted) return;

            // Stop spamming if backend is down
            if (failCount > 3 && Math.random() < 0.7) return;

            try {
                const response = await fetch("http://localhost:3005/devices", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    failCount = 0;
                    const data = await response.json();
                    if (Array.isArray(data) && isMounted) {
                        setHouseholds(data.length);
                        const blocked = data.filter((d: any) => d.isValveBlocked).length;
                        setUnpaidBills(blocked);
                    }
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
                if (failCount < 3) {
                    console.error("MQTT Hook: Backend offline or unreachable at port 3005.");
                }
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Update every 10s
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const clientID = "web_ui_" + Math.random().toString(16).slice(2, 10);
        const client = new Paho.Client(host, wsPort, clientID);
        clientRef.current = client;

        client.onConnectionLost = (responseObject) => {
            setIsConnected(false);
            setMqttMessage("Bridge Offline: " + responseObject.errorMessage);
        };

        client.onMessageArrived = (message) => {
            const topic = message.destinationName;
            const payload = message.payloadString;

            if (topic === TOPIC_DATA) {
                try {
                    const data = JSON.parse(payload);
                    // Map real-time sensor data to admin metrics for visual effect
                    if (typeof data.temperature === "number") {
                        // Simulate revenue target fluctuations based on "live" data
                        setRevenueTarget(prev => prev !== null ? Number((prev + (data.temperature / 1000)).toFixed(1)) : 78.5);
                    }
                    setLastHeartbeat("Last Sync: " + new Date().toLocaleTimeString());
                } catch (e) {
                    console.error("Data parse error", e);
                }
            } else if (topic === TOPIC_LED_STATE) {
                const s = payload.toUpperCase();
                setAnomalies(s === 'ON' ? '1 FLAG' : '0 SECURE');
            }
        };

        const connectOptions: Paho.ConnectionOptions = {
            useSSL: false,
            timeout: 10,
            onSuccess: () => {
                setIsConnected(true);
                setMqttMessage("Live Data Bridge Active");
                client.subscribe(TOPIC_DATA);
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
            if (client.isConnected()) {
                client.disconnect();
            }
        };
    }, []);

    const publishMessage = (topic: string, message: string) => {
        if (clientRef.current && isConnected) {
            const msg = new Paho.Message(message);
            msg.destinationName = topic;
            clientRef.current.send(msg);
        }
    };

    return {
        isConnected,
        revenueTarget,
        households,
        unpaidBills,
        revenue,
        anomalies,
        mqttMessage,
        lastHeartbeat,
        sendLedCommand: (state: string) => {
            publishMessage("control/led/status_happy", state);
            setAnomalies(state === 'ON' ? '1 FLAG' : '0 SECURE');
        },
        publishMessage,
    };
}
