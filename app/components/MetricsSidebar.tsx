'use client';

import { Droplets, Power, CircleSlash, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricsSidebarProps {
    households: number | null;
    anomalies: string;
    anomalyScore: number;
    leakDetected: boolean;
    onScanAnomalies: () => void;
    onAcknowledgeSafe: () => void;
}

export default function MetricsSidebar({
    households,
    anomalies,
    anomalyScore,
    leakDetected,
    onScanAnomalies,
    onAcknowledgeSafe,
}: MetricsSidebarProps) {

    const isFlagged = leakDetected || anomalies.includes('FLAG');
    const isSecure  = !isFlagged;

    // Score colour band
    const scoreColor =
        anomalyScore >= 70 ? '#ef4444' :   // high risk — red
        anomalyScore >= 40 ? '#f97316' :   // medium risk — orange
        anomalyScore > 0   ? '#eab308' :   // low risk — yellow
                             '#22c55e';    // safe — green

    const scoreLabel =
        anomalyScore >= 70 ? 'HIGH RISK' :
        anomalyScore >= 40 ? 'POSSIBLE LEAK' :
        anomalyScore > 0   ? 'LOW RISK' :
                             'SECURE';

    return (
        <div className="flex flex-col gap-8 w-[280px]">
            {/* Registered Households */}
            <div className="bg-[var(--accent-teal)] text-white rounded-3xl p-8 shadow-lg flex flex-col gap-4">
                <div className="flex justify-between items-center opacity-80 text-sm font-medium">
                    <span>Registered Households</span>
                    <Droplets size={18} />
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                        {households !== null ? households.toLocaleString() : '--'}
                    </span>
                </div>
                <p className="text-[10px] mt-2 opacity-90">Urban Region A</p>
            </div>

            {/* AI Anomaly Guard */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">AI Anomaly Guard</h3>
                    {isFlagged && (
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                        >
                            <AlertTriangle size={14} className="text-red-500" />
                        </motion.div>
                    )}
                </div>

                {/* Anomaly score bar */}
                <div className="mb-5">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Risk Score</span>
                        <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-page)] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: scoreColor }}
                            animate={{ width: `${anomalyScore}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                    <div className="text-right mt-1">
                        <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{anomalyScore}/100</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/*
                     * SCAN button — triggers a manual anomaly rescan on the firmware.
                     * Active state (red) = leak anomaly currently detected.
                     * The admin presses SCAN to request a fresh diagnostic.
                     */}
                    <button
                        onClick={onScanAnomalies}
                        title="Request firmware to run anomaly diagnostic scan"
                        className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${isFlagged
                            ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                            : 'bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)] hover:border-red-400 hover:text-red-400'
                        }`}
                    >
                        <Power size={24} />
                        <span className="text-xs">SCAN</span>
                    </button>

                    {/*
                     * SECURE button — admin acknowledges alert & marks system as secure.
                     * Active state (green) = system confirmed safe.
                     * Sends ACKNOWLEDGE command to reset the anomaly state.
                     */}
                    <button
                        onClick={onAcknowledgeSafe}
                        title="Acknowledge alert — confirm system is secure"
                        className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${isSecure
                            ? 'bg-green-500 text-white border-green-500 shadow-lg'
                            : 'bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)] hover:border-green-400 hover:text-green-400'
                        }`}
                    >
                        <CircleSlash size={24} />
                        <span className="text-xs">SECURE</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <span className="text-[10px] text-[var(--text-muted)]">System State: </span>
                    <strong className={`text-[10px] uppercase ${isFlagged ? 'text-red-500' : 'text-green-500'}`}>
                        {anomalies}
                    </strong>
                </div>
            </div>
        </div>
    );
}
