'use client';

import { useEffect, useState, useRef } from 'react';
import Paho from 'paho-mqtt';

const host = "157.173.101.159";
const wsPort = 9001;
const TOPIC_DATA = "sensors/dht_happy";
const TOPIC_LED_CMD = "control/led_happy";
const TOPIC_LED_STATE = "control/led/status_happy";

export function useMQTT() {
    const [isConnected, setIsConnected] = useState(false);
    const [temperature, setTemperature] = useState<number | null>(null);
    const [humidity, setHumidity] = useState<number | null>(null);
    const [ledState, setLedState] = useState<string>('UNKNOWN');
    const [mqttMessage, setMqttMessage] = useState('Attempting to reach broker...');
    const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

    const clientRef = useRef<Paho.Client | null>(null);

    useEffect(() => {
        const clientID = "web_ui_" + Math.random().toString(16).slice(2, 10);
        const client = new Paho.Client(host, wsPort, clientID);
        clientRef.current = client;

        client.onConnectionLost = (responseObject) => {
            setIsConnected(false);
            setMqttMessage("Disconnected: " + responseObject.errorMessage);
        };

        client.onMessageArrived = (message) => {
            const topic = message.destinationName;
            const payload = message.payloadString;

            if (topic === TOPIC_DATA) {
                try {
                    const data = JSON.parse(payload);
                    if (typeof data.temperature === "number") setTemperature(data.temperature);
                    if (typeof data.humidity === "number") setHumidity(data.humidity);
                    setLastHeartbeat("Last heartbeat: " + new Date().toLocaleTimeString());
                } catch (e) {
                    console.error("Data parse error", e);
                }
            } else if (topic === TOPIC_LED_STATE) {
                setLedState(payload.toUpperCase());
            }
        };

        const connectOptions: Paho.ConnectionOptions = {
            useSSL: false,
            timeout: 10,
            onSuccess: () => {
                setIsConnected(true);
                setMqttMessage("Live Subscription Active");
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

    const sendLedCommand = (state: 'ON' | 'OFF') => {
        if (clientRef.current && clientRef.current.isConnected()) {
            const message = new Paho.Message(state);
            message.destinationName = TOPIC_LED_CMD;
            clientRef.current.send(message);
        }
    };

    return {
        isConnected,
        temperature,
        humidity,
        ledState,
        mqttMessage,
        lastHeartbeat,
        sendLedCommand,
    };
}
