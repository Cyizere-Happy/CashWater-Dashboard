'use client';

import { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';

interface WaterGaugeProps {
    value: number | null;       // revenueTarget (kept — intentional org metric)
    flowRate?: number | null;   // live L/min from hardware
}

export default function WaterGauge({ value, flowRate }: WaterGaugeProps) {
    const [offset, setOffset] = useState(565.48);
    const circumference = 2 * Math.PI * 90;

    // Gauge arc tracks the revenue target percentage (org metric, unchanged)
    useEffect(() => {
        if (value !== null && value !== undefined) {
            const percent = Math.min(Math.max(value, 0), 100);
            const newOffset = circumference - (percent / 100) * circumference;
            setOffset(newOffset);
        }
    }, [value, circumference]);

    // Flow rate badge colour
    const flowColor =
        flowRate === null || flowRate === undefined ? '#94a3b8' :
        flowRate > 20  ? '#ef4444' :   // very high = red
        flowRate > 10  ? '#f97316' :   // high = orange
        flowRate > 0   ? '#87c4c4' :   // normal = teal
                         '#64748b';    // zero = grey

    return (
        <div className="relative w-[240px] h-[240px] mx-auto bg-white dark:bg-[#1e293b] rounded-full flex flex-col items-center justify-center shadow-2xl border-8 border-white/50 dark:border-slate-800/50">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                    stroke="var(--bg-page)"
                    strokeWidth="12"
                    fill="transparent"
                    r="90" cx="100" cy="100"
                />
                <circle
                    stroke="var(--accent-orange)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    r="90" cx="100" cy="100"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-out',
                    }}
                />
            </svg>

            {/* Revenue target percentage — centre */}
            <div className="text-[var(--accent-orange)] font-bold text-5xl leading-none">
                {value !== null && value !== undefined ? value.toFixed(1) : '--'}%
            </div>
            <div className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-semibold">
                Revenue Target
            </div>

            {/* Live flow rate badge — overlaid bottom */}
            <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-white text-[10px] font-bold shadow-lg transition-colors duration-500"
                style={{ backgroundColor: flowColor }}
            >
                <Droplets size={10} />
                {flowRate !== null && flowRate !== undefined
                    ? `${flowRate.toFixed(1)} L/min`
                    : 'No signal'}
            </div>
        </div>
    );
}
