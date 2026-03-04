"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

/* ─── Types ─── */
interface DeviceOwner {
  id: string;
  email: string;
  role: string;
}

interface ReportDevice {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  type: string;
  status: string;
  owner?: DeviceOwner;
}

interface LeakReport {
  id: string;
  deviceId: string;
  device?: ReportDevice;
  severity: "LOW" | "MEDIUM" | "HIGH";
  status: "NEW" | "BLOCKED" | "DISMISSED";
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  resolvedAt?: string;
}

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

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Detail Modal ─── */
function ReportDetailModal({
  report,
  onClose,
  onBlock,
  onDismiss,
}: {
  report: LeakReport;
  onClose: () => void;
  onBlock: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const sevColors: Record<string, { text: string; bg: string; border: string }> = {
    HIGH: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    MEDIUM: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    LOW: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  };
  const sc = sevColors[report.severity] ?? sevColors.LOW;

  const hasCoords = report.latitude && report.longitude;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${sc.bg} ${sc.border} border-b`}>
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} border ${sc.border} mb-2`}>
                {report.severity === "HIGH" && <ShieldAlert size={12} />}
                {report.severity === "MEDIUM" && <Waves size={12} />}
                {report.severity === "LOW" && <Droplets size={12} />}
                {report.severity} Severity
              </div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Leak Report Details
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Report #{report.id.slice(0, 8).toUpperCase()} · {timeAgo(report.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--border-color)] transition-colors"
            >
              <X size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Description
            </p>
            <p className="text-sm text-[var(--text-main)] bg-[var(--bg-page)] rounded-xl p-4 leading-relaxed border border-[var(--border-color)]">
              {report.description || "No description provided."}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Location
            </p>
            <div className="flex items-start gap-3 bg-[var(--bg-page)] rounded-xl p-4 border border-[var(--border-color)]">
              <MapPin size={16} className="text-[var(--accent-orange)] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-main)] break-words">
                  {report.location || report.device?.location || "Unknown location"}
                </p>
                {hasCoords && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {Number(report.latitude).toFixed(6)}, {Number(report.longitude).toFixed(6)}
                  </p>
                )}
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-orange)] hover:underline whitespace-nowrap"
                >
                  Open Map <ChevronRight size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Device Info */}
          {report.device && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Registered Device
              </p>
              <div className="bg-[var(--bg-page)] rounded-xl p-4 border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Device ID</span>
                  <span className="text-xs font-mono font-bold text-[var(--text-main)]">{report.device.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Name</span>
                  <span className="text-xs font-semibold text-[var(--text-main)]">{report.device.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Type</span>
                  <span className="text-xs text-[var(--text-main)]">{report.device.type || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Status</span>
                  <span className={`text-xs font-bold ${report.device.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {report.device.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Owner Info */}
          {report.device?.owner && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Account Holder
              </p>
              <div className="flex items-center gap-3 bg-[var(--bg-page)] rounded-xl p-4 border border-[var(--border-color)]">
                <div className="w-9 h-9 rounded-full bg-[var(--accent-orange)]/10 flex items-center justify-center">
                  <User size={16} className="text-[var(--accent-orange)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    {report.device.owner.email}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
                    {report.device.owner.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-page)] rounded-xl p-3 border border-[var(--border-color)]">
              <p className="text-[10px] text-[var(--text-muted)] mb-1 flex items-center gap-1">
                <Clock size={10} /> Reported
              </p>
              <p className="text-xs font-semibold text-[var(--text-main)]">{formatDate(report.createdAt)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{formatTime(report.createdAt)}</p>
            </div>
            {report.resolvedAt && (
              <div className="bg-[var(--bg-page)] rounded-xl p-3 border border-[var(--border-color)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-1 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Resolved
                </p>
                <p className="text-xs font-semibold text-[var(--text-main)]">{formatDate(report.resolvedAt)}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{formatTime(report.resolvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {report.status === "NEW" && (
          <div className="p-4 border-t border-[var(--border-color)] flex gap-3">
            <button
              onClick={() => { onBlock(report.id); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <ShieldOff size={14} /> Block Water Supply
            </button>
            <button
              onClick={() => { onDismiss(report.id); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-page)] text-[var(--text-muted)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} /> Dismiss
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function LeakReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "NEW" | "BLOCKED" | "DISMISSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<LeakReport | null>(null);

  useEffect(() => setMounted(true), []);

  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        const data: LeakReport[] = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    // Poll every 30 seconds for new reports
    const interval = setInterval(() => fetchReports(true), 30000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  const updateReportStatus = useCallback(async (id: string, status: "BLOCKED" | "DISMISSED") => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, resolvedAt: new Date().toISOString() } : r))
        );
      }
    } catch (e) {
      console.error("Failed to update report status:", e);
    }
  }, []);

  const blockWater = useCallback((id: string) => updateReportStatus(id, "BLOCKED"), [updateReportStatus]);
  const dismiss = useCallback((id: string) => updateReportStatus(id, "DISMISSED"), [updateReportStatus]);

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
        r.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.device?.owner?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (!mounted) return null;

  const stats = [
    { label: "Total Reports", value: totalReports, icon: Droplets },
    { label: "New / Pending", value: newCount, icon: AlertTriangle },
    { label: "Water Blocked", value: blockedCount, icon: ShieldOff },
    { label: "Dismissed", value: dismissedCount, icon: CheckCircle2 },
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Bell size={14} />
              Auto-refresh every 30s
            </div>
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--accent-orange)]/50 transition-all"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
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
          <div className="relative flex-1 max-w-sm w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by device ID, location, email…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-orange)] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "NEW", "BLOCKED", "DISMISSED"] as const).map((f) => {
              const count =
                f === "ALL" ? totalReports : f === "NEW" ? newCount : f === "BLOCKED" ? blockedCount : dismissedCount;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === f
                      ? "bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-md"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/50"
                    }`}
                >
                  {f === "ALL" ? "All" : f === "NEW" ? "Pending" : f === "BLOCKED" ? "Blocked" : "Dismissed"} · {count}
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-[var(--accent-orange)]" />
              <p className="text-sm text-[var(--text-muted)]">Loading reports…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Device / Reporter
                    </th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Location
                    </th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Severity
                    </th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      When
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
                        <td colSpan={6} className="text-center py-16 text-[var(--text-muted)] text-sm">
                          No leak reports found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((report) => {
                        const sevColors: Record<string, { text: string; bg: string }> = {
                          HIGH: { text: "text-red-600", bg: "bg-red-100" },
                          MEDIUM: { text: "text-amber-600", bg: "bg-amber-100" },
                          LOW: { text: "text-blue-600", bg: "bg-blue-100" },
                        };
                        const sc = sevColors[report.severity] ?? sevColors.LOW;
                        return (
                          <motion.tr
                            key={report.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -40 }}
                            className={`border-b border-[var(--border-color)] last:border-b-0 transition-colors hover:bg-[var(--bg-page)]/50 cursor-pointer ${report.status === "DISMISSED" ? "opacity-50" : ""
                              }`}
                            onClick={() => setSelectedReport(report)}
                          >
                            {/* Device / Reporter */}
                            <td className="px-6 py-4">
                              <p className="font-bold text-[var(--text-main)] font-mono text-xs">
                                {report.deviceId}
                              </p>
                              {report.device?.owner?.email && (
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                  {report.device.owner.email}
                                </p>
                              )}
                              {report.device?.name && (
                                <p className="text-[10px] text-[var(--text-muted)]">
                                  {report.device.name}
                                </p>
                              )}
                            </td>

                            {/* Location */}
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-1.5">
                                <MapPin size={12} className="text-[var(--accent-orange)] mt-0.5 shrink-0" />
                                <p
                                  className="text-[var(--text-main)] text-xs max-w-[180px] truncate"
                                  title={report.location || report.device?.location}
                                >
                                  {report.location || report.device?.location || "Unknown"}
                                </p>
                              </div>
                            </td>

                            {/* Severity */}
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}
                              >
                                {report.severity === "HIGH" && <ShieldAlert size={12} />}
                                {report.severity === "MEDIUM" && <Waves size={12} />}
                                {report.severity === "LOW" && <Droplets size={12} />}
                                {report.severity}
                              </span>
                            </td>

                            {/* When */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <p className="text-xs text-[var(--text-main)]">{timeAgo(report.createdAt)}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{formatDate(report.createdAt)}</p>
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
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 size={12} /> Blocked
                                </span>
                              )}
                              {report.status === "DISMISSED" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                  <XCircle size={12} /> Dismissed
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              {report.status === "NEW" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); blockWater(report.id); }}
                                    className="px-3 py-1.5 rounded-lg bg-[var(--accent-orange)] text-white text-[11px] font-bold hover:opacity-90 transition-all flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <ShieldOff size={11} /> Block
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); dismiss(report.id); }}
                                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-page)] text-[var(--text-muted)] text-[11px] font-bold border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 transition-all flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <ShieldCheck size={11} /> Dismiss
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-[var(--text-muted)] text-center block">—</span>
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
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)]">
            <p className="text-[10px] text-[var(--text-muted)]">
              Showing {filtered.length} of {totalReports} reports
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              WASAC Admin · Click any row to view full details
            </p>
          </div>
        </motion.div>
      </div>

      {/* ─── Detail Modal ─── */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onBlock={blockWater}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
