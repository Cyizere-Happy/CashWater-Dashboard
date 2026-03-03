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
  Cpu,
  ShieldAlert,
} from "lucide-react";
import Paho from "paho-mqtt";

const MQTT_HOST = "broker.emqx.io";
const MQTT_WS_PORT = 8083;
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
  source?: 'manual' | 'hardware';  // new field — hardware auto-reports vs manual
  anomalyScore?: number;
}

interface LeakAlertBannerProps {
  hardwareLeakDetected?: boolean;
  anomalyScore?: number;
  onBlockWater?: () => void;
}

export default function LeakAlertBanner({
  hardwareLeakDetected = false,
  anomalyScore = 0,
  onBlockWater,
}: LeakAlertBannerProps) {
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const clientRef = useRef<Paho.Client | null>(null);

  // ── Hardware-triggered auto-alert ───────────────────────────
  // When the firmware's anomaly score crosses the threshold, inject a system alert
  // into the banner automatically — no human report needed.
  const hwAlertKey = "hardware_auto";
  useEffect(() => {
    if (hardwareLeakDetected && anomalyScore >= 40) {
      const autoReport: LeakReport = {
        type: "hardware_detection",
        timestamp: hwAlertKey,   // stable key so it doesn't re-inject on re-render
        reporter: { name: "AI Anomaly System", phone: "— Automated —" },
        location: "Sensor Node (Hardware)",
        severity: anomalyScore >= 70 ? "HIGH" : "MEDIUM",
        waterSupplyBlocked: false,
        description: `Anomaly score ${anomalyScore}/100 — sustained abnormal flow detected by sensor.`,
        status: "open",
        message: `Hardware leak alert — score ${anomalyScore}`,
        source: "hardware",
        anomalyScore,
      };
      setReports((prev) => {
        const alreadyIn = prev.some((r) => r.timestamp === hwAlertKey);
        return alreadyIn ? prev.map(r => r.timestamp === hwAlertKey ? autoReport : r)
          : [autoReport, ...prev].slice(0, 10);
      });
    } else {
      // If hardware clears, remove the hardware alert
      setReports((prev) => prev.filter((r) => r.timestamp !== hwAlertKey));
    }
  }, [hardwareLeakDetected, anomalyScore]);

  // ── MQTT: manual leak reports from mobile app / field ───────
  useEffect(() => {
    const clientID = "admin_leak_listener_" + Math.random().toString(16).slice(2, 10);
    const client = new Paho.Client(MQTT_HOST, MQTT_WS_PORT, clientID);
    clientRef.current = client;

    client.onMessageArrived = (message) => {
      if (message.destinationName === TOPIC_LEAK_REPORT) {
        try {
          const data: LeakReport = JSON.parse(message.payloadString);
          data.source = 'manual';
          setReports((prev) => [data, ...prev].slice(0, 10));
        } catch (e) {
          console.error("Failed to parse leak report", e);
        }
      }
    };

    client.onConnectionLost = () => {
      setTimeout(() => {
        try {
          client.connect({
            useSSL: false, timeout: 10,
            onSuccess: () => client.subscribe(TOPIC_LEAK_REPORT),
            onFailure: () => { },
          });
        } catch { /* ignore */ }
      }, 5000);
    };

    try {
      client.connect({
        useSSL: false, timeout: 10,
        onSuccess: () => client.subscribe(TOPIC_LEAK_REPORT),
        onFailure: () => { },
      });
    } catch { /* ignore */ }

    return () => { if (client.isConnected()) client.disconnect(); };
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
            className={`pointer-events-auto bg-[var(--bg-card)] border-l-4 rounded-2xl p-5 shadow-2xl border border-[var(--border-color)] ${report.severity === "HIGH" ? "border-l-red-500" :
                report.severity === "MEDIUM" ? "border-l-orange-500" :
                  "border-l-yellow-500"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${report.severity === "HIGH" ? "bg-red-500/10 text-red-500" :
                    report.severity === "MEDIUM" ? "bg-orange-500/10 text-orange-500" :
                      "bg-yellow-500/10 text-yellow-500"
                  }`}>
                  {report.source === 'hardware' ? <Cpu size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">
                    {report.source === 'hardware' ? '🤖 Hardware Detection' : '🚨 Leak Report'} — {report.severity}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={10} />
                    {report.timestamp === hwAlertKey
                      ? new Date().toLocaleTimeString()
                      : new Date(report.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, report.timestamp]))}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                {report.source === 'hardware' ? <ShieldAlert size={12} /> : <User size={12} />}
                <span className="font-medium text-[var(--text-main)]">{report.reporter.name}</span>
              </div>
              {report.source !== 'hardware' && (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Phone size={12} />
                  <span>{report.reporter.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <MapPin size={12} />
                <span className="truncate">{report.location}</span>
              </div>
              {report.anomalyScore !== undefined && (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Cpu size={12} />
                  <span>Anomaly Score: <strong className="text-red-500">{report.anomalyScore}/100</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Droplets size={12} />
                <span>
                  Water Supply:{" "}
                  <strong className={report.waterSupplyBlocked ? "text-[var(--accent-teal)]" : "text-[var(--accent-pink)]"}>
                    {report.waterSupplyBlocked ? "Blocked" : "Still Active"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Action buttons for hardware alerts */}
            {report.source === 'hardware' && onBlockWater && !report.waterSupplyBlocked && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex gap-2">
                <button
                  onClick={() => {
                    onBlockWater();
                    setReports(prev => prev.map(r =>
                      r.timestamp === report.timestamp ? { ...r, waterSupplyBlocked: true } : r
                    ));
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 active:scale-95 transition-all"
                >
                  BLOCK WATER SUPPLY
                </button>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, report.timestamp]))}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-page)] text-[var(--text-muted)] text-[10px] font-bold border border-[var(--border-color)] hover:bg-[var(--bg-card)] active:scale-95 transition-all"
                >
                  MONITOR / IGNORE
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
