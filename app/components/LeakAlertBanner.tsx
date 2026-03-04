"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  MapPin,
  Phone,
  User,
  Droplets,
  Clock,
} from "lucide-react";
import Paho from "paho-mqtt";

const MQTT_HOST = "157.173.101.159";
const MQTT_WS_PORT = 9001;
const TOPIC_LEAK_REPORT = "alerts/leak_report";

interface LeakReport {
  type: string;
  timestamp: string;
  reporter: { name: string; phone: string };
  location: string;
  severity: string;
  waterSupplyBlocked: boolean;
  description: string;
  status: string;
  message: string;
}

export default function LeakAlertBanner() {
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const clientRef = useRef<Paho.Client | null>(null);

  useEffect(() => {
    const clientID =
      "admin_leak_listener_" + Math.random().toString(16).slice(2, 10);
    const client = new Paho.Client(MQTT_HOST, MQTT_WS_PORT, clientID);
    clientRef.current = client;

    client.onMessageArrived = (message) => {
      if (message.destinationName === TOPIC_LEAK_REPORT) {
        try {
          const data: LeakReport = JSON.parse(message.payloadString);
          setReports((prev) => [data, ...prev].slice(0, 10));
        } catch (e) {
          console.error("Failed to parse leak report", e);
        }
      }
    };

    client.onConnectionLost = () => {
      // silently reconnect after delay
      setTimeout(() => {
        try {
          client.connect({
            useSSL: false,
            timeout: 10,
            onSuccess: () => client.subscribe(TOPIC_LEAK_REPORT),
            onFailure: () => { },
          });
        } catch {
          /* ignore */
        }
      }, 5000);
    };

    try {
      client.connect({
        useSSL: false,
        timeout: 10,
        onSuccess: () => {
          client.subscribe(TOPIC_LEAK_REPORT);
        },
        onFailure: () => { },
      });
    } catch {
      /* ignore */
    }

    return () => {
      if (client.isConnected()) client.disconnect();
    };
  }, []);

  const visibleReports = reports.filter((r) => !dismissed.has(r.timestamp));

  if (visibleReports.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {visibleReports.slice(0, 3).map((report) => (
          <motion.div
            key={report.timestamp}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto bg-[var(--bg-card)] border-l-4 rounded-2xl p-5 shadow-2xl border border-[var(--border-color)] ${report.severity === "HIGH"
                ? "border-l-[var(--accent-orange)]"
                : report.severity === "MEDIUM"
                  ? "border-l-[var(--accent-teal)]"
                  : "border-l-[var(--text-muted)]"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${report.severity === "HIGH"
                      ? "bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]"
                      : report.severity === "MEDIUM"
                        ? "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]"
                        : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
                    }`}
                >
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">
                    🚨 Leak Report — {report.severity}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(report.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDismissed((prev) => new Set([...prev, report.timestamp]))
                }
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <User size={12} />
                <span className="font-medium text-[var(--text-main)]">
                  {report.reporter.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Phone size={12} />
                <span>{report.reporter.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <MapPin size={12} />
                <span className="truncate">{report.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Droplets size={12} />
                <span>
                  Water Supply:{" "}
                  <strong
                    className={
                      report.waterSupplyBlocked
                        ? "text-[var(--accent-teal)]"
                        : "text-[var(--accent-orange)]"
                    }
                  >
                    {report.waterSupplyBlocked ? "Blocked" : "Still Active"}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
