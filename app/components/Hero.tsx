'use client';

import { User, Droplets, Lock, Unlock } from 'lucide-react';
import WaterGauge from './TempGauge';

interface HeroProps {
    value: number | null;
    flowRate?: number | null;
    valveState?: 'OPEN' | 'CLOSED' | null;
    leakDetected?: boolean;
}

export default function Hero({ value, flowRate, valveState, leakDetected }: HeroProps) {
    const valveOpen = valveState === 'OPEN';
    const valveUnknown = valveState === null || valveState === undefined;

    // Dynamic right-side status panel
    const statusLabel =
        leakDetected ? 'Leak Risk' :
        valveUnknown ? 'Checking...' :
        valveOpen    ? 'Flowing' : 'Blocked';

    const statusColor =
        leakDetected ? 'text-red-300' :
        valveUnknown ? 'text-white/60' :
        valveOpen    ? 'text-emerald-300' : 'text-orange-300';

    const flowDisplay = flowRate !== null && flowRate !== undefined
        ? `${flowRate.toFixed(1)} L/min`
        : '--';

    return (
        <header className="bg-[var(--accent-orange)] dark:bg-[var(--bg-header)] px-16 pt-12 pb-24 flex justify-between items-center text-white rounded-b-[60px] relative mb-8 shadow-[0_10px_30px_rgba(98,169,227,0.2)]">
            {/* Left — welcome */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center border-2 border-white">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-sm opacity-90 font-light">Good Morning,</h2>
                    <h1 className="text-2xl font-bold">Cyizere</h1>
                </div>
            </div>

            {/* Centre — gauge */}
            <div className="absolute left-1/2 -bottom-16 -translate-x-1/2 z-10">
                <WaterGauge value={value} flowRate={flowRate} />
            </div>

            {/* Right — live water status */}
            <div className="text-right flex flex-col items-end gap-2">
                <p className="text-[10px] opacity-80 uppercase tracking-widest">Water Status</p>
                <h1 className={`text-4xl font-bold ${statusColor}`}>{statusLabel}</h1>

                <div className="flex items-center gap-2 mt-1 opacity-90">
                    {valveUnknown ? (
                        <span className="text-xs opacity-60">Awaiting Hardware</span>
                    ) : valveOpen ? (
                        <>
                            <Unlock size={14} />
                            <span className="text-xs font-semibold">Valve Open · {flowDisplay}</span>
                        </>
                    ) : (
                        <>
                            <Lock size={14} />
                            <span className="text-xs font-semibold">Valve Closed</span>
                        </>
                    )}
                </div>

                {leakDetected && (
                    <div className="flex items-center gap-1.5 mt-1 bg-red-500/20 border border-red-400/40 rounded-xl px-3 py-1.5">
                        <Droplets size={12} className="text-red-300" />
                        <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Leak Detected</span>
                    </div>
                )}
            </div>
        </header>
    );
}
