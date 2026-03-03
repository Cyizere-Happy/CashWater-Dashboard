'use client';

import { Sun, Wind } from 'lucide-react';

export default function AnalyticsSidebar() {
    return (
        <aside className="w-[340px] flex flex-col gap-8">
            <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                <h3 className="font-semibold text-lg mb-6">Sensor Stats</h3>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-amber-400">
                            <Sun size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--text-main)]">Avg Temp</h4>
                            <p className="text-[10px] text-[var(--text-muted)]">Past 24 hours</p>
                        </div>
                        <div className="font-bold text-sm">24.5°</div>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-blue-400">
                            <Wind size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--text-main)]">Max Humidity</h4>
                            <p className="text-[10px] text-[var(--text-muted)]">Past 24 hours</p>
                        </div>
                        <div className="font-bold text-sm">65%</div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-[var(--bg-page)] rounded-2xl text-center">
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">Uptime</p>
                    <h2 className="text-2xl font-bold text-[var(--text-main)]">04h 32m</h2>
                </div>
            </div>
        </aside>
    );
}
