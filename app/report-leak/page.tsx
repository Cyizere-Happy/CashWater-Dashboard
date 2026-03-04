"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  MapPin,
  Phone,
  User,
  Clock,
  ShieldCheck,
  ShieldOff,
  Waves,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Bell,
} from "lucide-react";
import Paho from "paho-mqtt";
import Navbar from "../components/Navbar";

/* ─── MQTT Config ─── */
const MQTT_HOST = "157.173.101.159";
const MQTT_WS_PORT = 9001;
const TOPIC_LEAK_REPORT = "alerts/leak_report";
const TOPIC_WATER_CONTROL = "control/water_block";

/* ─── Types ─── */
interface LeakReport {
  id: string;
  timestamp: string;
  reporter: { name: string; phone: string };
  location: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  waterSupplyBlocked: boolean;
  description: string;
  status: "NEW" | "BLOCKED" | "DISMISSED";
}

/* ─── Demo seed data ─── */
const SEED_REPORTS: LeakReport[] = [
  {
    id: "LK-0439",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    reporter: { name: "Jean Pierre Habimana", phone: "+250 788 321 456" },
    location: "KN 5 Rd, Kigali — Simba junction",
    severity: "HIGH",
    waterSupplyBlocked: false,
    description: "Large burst on main pipe, water flooding the road.",
    status: "NEW",
  },
  {
    id: "LK-0438",
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    reporter: { name: "Marie Claire Uwase", phone: "+250 722 654 789" },
    location: "KG 11 Ave, Remera",
    severity: "MEDIUM",
    waterSupplyBlocked: true,
    description: "Steady leak from cracked pipe in compound.",
    status: "NEW",
  },
  {
    id: "LK-0437",
    timestamp: new Date(Date.now() - 87 * 60000).toISOString(),
    reporter: { name: "Eric Mugisha", phone: "+250 730 111 222" },
    location: "Nyamirambo, Sector 3",
    severity: "LOW",
    waterSupplyBlocked: false,
    description: "Small drip from meter connection.",
    status: "NEW",
  },
  {
    id: "LK-0435",
    timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
    reporter: { name: "Alice Mukamana", phone: "+250 788 999 111" },
    location: "Kicukiro, KK 15 Rd",
    severity: "HIGH",
    waterSupplyBlocked: true,
    description: "Underground pipe burst near school.",
    status: "BLOCKED",
  },
  {
    id: "LK-0432",
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    reporter: { name: "Patrick Niyonzima", phone: "+250 722 333 444" },
    location: "Gasabo, Kimihurura",
    severity: "LOW",
    waterSupplyBlocked: false,
    description: "Minor seepage at valve joint.",
    status: "DISMISSED",
  },
  {
    id: "LK-0430",
    timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
    reporter: { name: "Grace Ingabire", phone: "+250 738 555 666" },
    location: "Muhanga, Main Street",
    severity: "MEDIUM",
    waterSupplyBlocked: false,
    description: "Leak at public standpipe.",
    status: "BLOCKED",
  },
];

/* ─── Helpers ─── */
function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeakReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<LeakReport[]>(SEED_REPORTS);
  const [filter, setFilter] = useState<"ALL" | "NEW" | "BLOCKED" | "DISMISSED">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const mqttClientRef = useRef<Paho.Client | null>(null);

  useEffect(() => setMounted(true), []);

  /* ─── MQTT listener ─── */
  useEffect(() => {
    const clientID = "leak_admin_" + Math.random().toString(16).slice(2, 10);
    const client = new Paho.Client(MQTT_HOST, MQTT_WS_PORT, clientID);
    mqttClientRef.current = client;

    client.onMessageArrived = (message) => {
      if (message.destinationName === TOPIC_LEAK_REPORT) {
        try {
          const data = JSON.parse(message.payloadString);
          const newReport: LeakReport = {
            id: "LK-" + String(Date.now()).slice(-4),
            timestamp: data.timestamp || new Date().toISOString(),
            reporter: data.reporter || { name: "Unknown", phone: "—" },
            location: data.location || "Unknown location",
            severity: (
              data.severity || "MEDIUM"
            ).toUpperCase() as LeakReport["severity"],
            waterSupplyBlocked: data.waterSupplyBlocked ?? false,
            description: data.description || "",
            status: "NEW",
          };
          setReports((prev) => [newReport, ...prev]);
        } catch (e) {
          console.error("Failed to parse leak report", e);
        }
      }
    };

    client.onConnectionLost = () => { };

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

    return () => {
      if (client.isConnected()) client.disconnect();
    };
  }, []);

  /* ─── Actions ─── */
  const blockWater = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "BLOCKED" as const } : r)),
    );
    if (mqttClientRef.current?.isConnected()) {
      const msg = new Paho.Message(
        JSON.stringify({
          action: "BLOCK",
          reportId: id,
          timestamp: new Date().toISOString(),
        }),
      );
      msg.destinationName = TOPIC_WATER_CONTROL;
      mqttClientRef.current.send(msg);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "DISMISSED" as const } : r,
      ),
    );
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((r) => r.id)));
  };

  /* ─── Computed ─── */
  const totalReports = reports.length;
  const newCount = reports.filter((r) => r.status === "NEW").length;
  const blockedCount = reports.filter((r) => r.status === "BLOCKED").length;
  const dismissedCount = reports.filter((r) => r.status === "DISMISSED").length;

  const filtered = reports
    .filter((r) => filter === "ALL" || r.status === filter)
    .filter(
      (r) =>
        searchQuery === "" ||
        r.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  if (!mounted) return null;

  /* ─── Stat Cards Config ─── */
  const stats = [
    {
      label: "Total Reports",
      value: totalReports,
      icon: Droplets,
    },
    {
      label: "New / Pending",
      value: newCount,
      icon: AlertTriangle,
    },
    {
      label: "Water Blocked",
      value: blockedCount,
      icon: ShieldOff,
    },
    {
      label: "Dismissed",
      value: dismissedCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ─── Page Title ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-main)]">
              Leak Reports
            </h1>
            {newCount > 0 && (
              <span className="relative flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-orange)]" />
                </span>
                {newCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">
              Live MQTT listener active
            </span>
          </div>
        </motion.div>

        {/* ─── Stat Cards ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06 }}
                className="bg-[var(--accent-orange)] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg"
              >
                <div className="absolute top-3 right-3 opacity-20">
                  <Icon size={40} />
                </div>
                <p className="text-xs font-medium opacity-80 mb-1">{s.label}</p>
                <p className="text-3xl font-bold">{s.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── Search + Filter Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-orange)] transition-colors"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "NEW", "BLOCKED", "DISMISSED"] as const).map((f) => {
              const count =
                f === "ALL"
                  ? totalReports
                  : f === "NEW"
                    ? newCount
                    : f === "BLOCKED"
                      ? blockedCount
                      : dismissedCount;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === f
                      ? "bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-md"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/50"
                    }`}
                >
                  {f === "ALL"
                    ? "All"
                    : f === "NEW"
                      ? "Pending"
                      : f === "BLOCKED"
                        ? "Blocked"
                        : "Dismissed"}{" "}
                  · {count}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-card)] rounded-3xl shadow-[var(--card-shadow)] border border-[var(--border-color)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        selectedIds.size === filtered.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-[var(--accent-orange)] cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Report ID
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Reporter
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Location
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Severity
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Date
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="text-center px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-16 text-[var(--text-muted)] text-sm"
                      >
                        No leak reports found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((report) => {
                      const sevColors: Record<
                        string,
                        { text: string; bg: string }
                      > = {
                        HIGH: { text: "text-[var(--accent-orange)]", bg: "bg-[var(--accent-orange)]/20" },
                        MEDIUM: {
                          text: "text-[var(--accent-teal)]",
                          bg: "bg-[var(--accent-teal)]/20",
                        },
                        LOW: {
                          text: "text-[var(--text-muted)]",
                          bg: "bg-[var(--text-muted)]/10",
                        },
                      };
                      const sc = sevColors[report.severity];
                      return (
                        <motion.tr
                          key={report.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -40 }}
                          className={`border-b border-[var(--border-color)] last:border-b-0 transition-colors hover:bg-[var(--bg-page)]/50 ${report.status === "DISMISSED" ? "opacity-50" : ""}`}
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(report.id)}
                              onChange={() => toggleSelect(report.id)}
                              className="w-4 h-4 rounded accent-[var(--accent-orange)] cursor-pointer"
                            />
                          </td>

                          {/* Report ID */}
                          <td className="px-4 py-4">
                            <span className="font-mono font-bold text-[var(--text-main)]">
                              {report.id}
                            </span>
                          </td>

                          {/* Reporter */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-[var(--text-main)] whitespace-nowrap">
                                {report.reporter.name}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                <Phone size={10} /> {report.reporter.phone}
                              </p>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-4">
                            <p
                              className="text-[var(--text-main)] max-w-[200px] truncate"
                              title={report.location}
                            >
                              {report.location}
                            </p>
                          </td>

                          {/* Severity */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}
                            >
                              {report.severity === "HIGH" && (
                                <ShieldAlert size={12} />
                              )}
                              {report.severity === "MEDIUM" && (
                                <Waves size={12} />
                              )}
                              {report.severity === "LOW" && (
                                <Droplets size={12} />
                              )}
                              {report.severity}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <p className="text-[var(--text-main)]">
                              {formatDate(report.timestamp)}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {formatTime(report.timestamp)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {report.status === "NEW" && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)] opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent-orange)]" />
                                </span>
                                Pending
                              </span>
                            )}
                            {report.status === "BLOCKED" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]">
                                <CheckCircle2 size={12} /> Blocked
                              </span>
                            )}
                            {report.status === "DISMISSED" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[var(--text-muted)]/10 text-[var(--text-muted)]">
                                <XCircle size={12} /> Dismissed
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            {report.status === "NEW" ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => blockWater(report.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-orange)] text-white text-[11px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                                >
                                  <ShieldOff size={13} />
                                  Block Water
                                </button>
                                <button
                                  onClick={() => dismiss(report.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-page)] text-[var(--text-muted)] text-[11px] font-bold border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 transition-all flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  <ShieldCheck size={13} />
                                  Don&apos;t Block
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] text-center block">
                                —
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)]">
            <p className="text-[10px] text-[var(--text-muted)]">
              Showing {filtered.length} of {totalReports} reports
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              WASAC Admin • Live MQTT Feed
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
