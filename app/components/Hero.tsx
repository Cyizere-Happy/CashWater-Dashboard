'use client';

import { User } from 'lucide-react';
import WaterGauge from './TempGauge';

interface HeroProps {
    value: number | null;
}

export default function Hero({ value }: HeroProps) {
    return (
        <header className="bg-[var(--accent-orange)] dark:bg-[var(--bg-header)] px-16 pt-12 pb-24 flex justify-between items-center text-white rounded-b-[60px] relative mb-8 shadow-[0_10px_30px_rgba(98,169,227,0.2)]">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center border-2 border-white">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-sm opacity-90 font-light">Good Morning,</h2>
                    <h1 className="text-2xl font-bold">Cyizere</h1>
                </div>
            </div>

            <div className="absolute left-1/2 -bottom-16 -translate-x-1/2 z-10">
                <WaterGauge value={value} />
            </div>

            <div className="text-right">
                <p className="text-[10px] opacity-80 uppercase tracking-widest mb-1">Water Quality</p>
                <h1 className="text-4xl font-bold">Healthy</h1>
            </div>
        </header>
    );
}
