'use client';

import { Droplets, Power, CircleSlash } from 'lucide-react';

interface MetricsSidebarProps {
    humidity: number | null;
    ledState: string;
    onLedToggle: (state: 'ON' | 'OFF') => void;
}

export default function MetricsSidebar({ humidity, ledState, onLedToggle }: MetricsSidebarProps) {
    return (
        <div className="flex flex-col gap-8 w-[280px]">
            <div className="bg-[var(--accent-teal)] text-white rounded-3xl p-8 shadow-lg flex flex-col gap-4">
                <div className="flex justify-between items-center opacity-80 text-sm font-medium">
                    <span>Humidity</span>
                    <Droplets size={18} />
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{humidity !== null ? humidity.toFixed(0) : '--'}</span>
                    <span className="text-xl opacity-70">%</span>
                </div>
                <p className="text-[10px] mt-2 opacity-90">Comfort Range</p>
            </div>

            <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                <h3 className="text-sm font-semibold mb-6">LED Control</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onLedToggle('ON')}
                        className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${ledState === 'ON'
                            ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-lg shadow-blue-500/30'
                            : 'bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)]'
                            }`}
                    >
                        <Power size={24} />
                        <span className="text-xs">ON</span>
                    </button>
                    <button
                        onClick={() => onLedToggle('OFF')}
                        className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${ledState === 'OFF'
                            ? 'bg-slate-500 text-white border-slate-500 shadow-lg'
                            : 'bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)]'
                            }`}
                    >
                        <CircleSlash size={24} />
                        <span className="text-xs">OFF</span>
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <span className="text-[10px] text-[var(--text-muted)]">Current State: </span>
                    <strong className="text-[10px] text-[var(--accent-orange)] uppercase">{ledState || 'UNKNOWN'}</strong>
                </div>
            </div>
        </div>
    );
}
