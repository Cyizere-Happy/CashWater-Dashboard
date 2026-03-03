'use client';

import { useEffect, useState } from 'react';

interface WaterGaugeProps {
    value: number | null;
}

export default function WaterGauge({ value }: WaterGaugeProps) {
    const [offset, setOffset] = useState(326.73); // 2 * PI * 52
    const circumference = 2 * Math.PI * 52;

    useEffect(() => {
        if (value !== null) {
            const min = 0;
            const max = 100;
            const percent = Math.min(Math.max((value - min) / (max - min), 0), 1) * 100;
            const newOffset = circumference - (percent / 100) * circumference;
            setOffset(newOffset);
        }
    }, [value, circumference]);

    return (
        <div className="relative w-[140px] h-[140px] mx-auto bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-[#396cb8]/10">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
                <circle
                    stroke="var(--accent-orange)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-out',
                    }}
                />
            </svg>
            <div className="text-[var(--accent-orange)] font-bold text-2xl leading-none">
                {value !== null ? value.toFixed(1) : '--'}%
            </div>
            <div className="text-slate-400 text-[6px] uppercase tracking-widest mt-1 font-semibold">
                Revenue Target
            </div>
        </div>
    );
}
