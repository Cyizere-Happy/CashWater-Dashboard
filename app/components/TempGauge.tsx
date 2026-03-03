'use client';

import { useEffect, useState } from 'react';

interface TempGaugeProps {
    temperature: number | null;
}

export default function TempGauge({ temperature }: TempGaugeProps) {
    const [offset, setOffset] = useState(565.48); // 2 * PI * 90
    const circumference = 2 * Math.PI * 90;

    useEffect(() => {
        if (temperature !== null) {
            const min = 0;
            const max = 50;
            const percent = Math.min(Math.max((temperature - min) / (max - min), 0), 1) * 100;
            const newOffset = circumference - (percent / 100) * circumference;
            setOffset(newOffset);
        }
    }, [temperature, circumference]);

    return (
        <div className="relative w-[240px] h-[240px] mx-auto bg-white dark:bg-[#1e293b] rounded-full flex flex-col items-center justify-center shadow-2xl border-8 border-white/50 dark:border-slate-800/50">
            <svg className="absolute top-0 left-0 -rotate-90" width="240" height="240">
                <circle
                    stroke="var(--bg-page)"
                    strokeWidth="12"
                    fill="transparent"
                    r="90"
                    cx="120"
                    cy="120"
                />
                <circle
                    stroke="var(--accent-orange)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    r="90"
                    cx="120"
                    cy="120"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-out',
                    }}
                />
            </svg>
            <div className="text-[var(--accent-orange)] font-bold text-5xl leading-none">
                {temperature !== null ? temperature.toFixed(1) : '--'}°
            </div>
            <div className="text-slate-400 text-[10px] uppercase tracking-widest mt-2 font-semibold">
                Temperature
            </div>
        </div>
    );
}
