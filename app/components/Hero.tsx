'use client';

import { User } from 'lucide-react';
import WaterGauge from './TempGauge';

interface HeroProps {
    value: number | null;
}

export default function Hero({ value }: HeroProps) {
    return (
        <header className="bg-[var(--accent-orange)] dark:bg-[var(--bg-header)] px-16 py-8 flex justify-between items-center text-white rounded-b-3xl relative mb-12 shadow-[0_10px_30px_rgba(57,108,184,0.2)]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                    <User size={24} />
                </div>
                <div>
                    <h2 className="text-xs opacity-80 font-light">Good Morning,</h2>
                    <h1 className="text-xl font-bold">Cyizere</h1>
                </div>
            </div>

            <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-10">
                <WaterGauge value={value} />
            </div>

            <div className="text-right">
                <p className="text-[9px] opacity-70 uppercase tracking-widest mb-0.5">Water Quality</p>
                <h1 className="text-3xl font-bold">Healthy</h1>
            </div>
        </header>
    );
}
