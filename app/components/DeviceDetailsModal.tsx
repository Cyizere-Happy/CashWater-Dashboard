"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Activity, Calendar, Droplets, Tag, Hash, ShieldCheck, Globe } from "lucide-react";

interface DeviceDetailsModalProps {
    device: any;
    onClose: () => void;
    onToggleSupply: (name: string, isOff: boolean) => void;
}

export default function DeviceDetailsModal({ device, onClose, onToggleSupply }: DeviceDetailsModalProps) {
    if (!device) return null;

    const isOff = (device.status || "").toLowerCase() === '.cutoff';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-[40px] overflow-hidden border border-[var(--border-color)] shadow-2xl flex flex-col"
            >
                {/* Header/Hero Section */}
                <div className="relative h-48 bg-gradient-to-br from-[var(--accent-orange)] to-[#f97316] p-8 flex flex-col justify-end">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-[10px] font-bold text-white uppercase tracking-wider">
                            {device.type}
                        </div>
                        <div className={`px-3 py-1 rounded-lg border border-white/30 text-[10px] font-bold text-white uppercase tracking-wider ${isOff ? 'bg-red-500/40' : 'bg-green-500/40'}`}>
                            {isOff ? 'SUPPLY CUTOFF' : 'SUPPLY ACTIVE'}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white">{device.name}</h2>
                    <p className="text-white/70 text-sm font-medium flex items-center gap-2 mt-1">
                        <Hash size={14} /> {device.id || 'N/A'}
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-8 grid grid-cols-2 gap-8 bg-[var(--bg-card)]">
                    {/* Left Column: Info */}
                    <div className="flex flex-col gap-6">
                        <div className="group">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Location Details</label>
                            <div className="flex items-start gap-3 p-4 bg-[var(--bg-page)] rounded-2xl border border-[var(--border-color)] group-hover:border-[var(--accent-orange)]/30 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent-orange)]/10 flex items-center justify-center text-[var(--accent-orange)]">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--text-main)] mb-1">{device.location}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                                        {device.coordinates ? `${device.coordinates[1].toFixed(6)}, ${device.coordinates[0].toFixed(6)}` : 'No GPS Data'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">System Metadata</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
                                        <Calendar size={12} />
                                        <span className="text-[9px] font-bold uppercase">Registered</span>
                                    </div>
                                    <p className="text-xs font-bold text-[var(--text-main)]">{device.date}</p>
                                </div>
                                <div className="p-3 bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
                                        <ShieldCheck size={12} />
                                        <span className="text-[9px] font-bold uppercase">Security</span>
                                    </div>
                                    <p className="text-xs font-bold text-[var(--text-main)]">QR Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Status & Controls */}
                    <div className="flex flex-col gap-6">
                        <div className="group">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Device Health</label>
                            <div className="p-4 bg-[var(--bg-page)] rounded-2xl border border-[var(--border-color)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold text-[var(--text-main)]">Online</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)]">RSSI: -64dBm</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "85%" }}
                                        className="h-full bg-[var(--accent-orange)]"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] font-bold text-[var(--text-muted)]">SIGNAL STRENGTH</span>
                                    <span className="text-[9px] font-bold text-[var(--accent-orange)]">85% EXCELLENT</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Supply Control</label>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onToggleSupply(device.name, !isOff)}
                                className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-3 ${isOff
                                        ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                                        : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
                                    }`}
                            >
                                <Droplets size={20} />
                                {isOff ? 'RESTORE WATER SUPPLY' : 'EMERGENCY CUTOFF'}
                            </motion.button>
                            <p className="text-[9px] text-[var(--text-muted)] text-center mt-3 italic font-medium">
                                * Remote control actions are logged by WASAC Central Authority.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
