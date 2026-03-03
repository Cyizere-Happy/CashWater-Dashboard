'use client';

import { Search, ChevronRight } from 'lucide-react';

export default function DevicesSidebar() {
    const stats = [
        { label: 'Uptime', value: 98, sublabel: 'this week', color: 'var(--accent-orange)' },
        { label: 'Cloud Space', value: 12, sublabel: 'gb left', color: 'var(--accent-orange)' },
        { label: 'Shared Devices', value: 49, sublabel: 'today', color: 'var(--accent-orange)' },
    ];

    return (
        <aside className="w-[340px] flex flex-col gap-8">
            {/* Search Bar */}
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Search your content"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)] transition-all shadow-[var(--card-shadow)]"
                />
                <div className="absolute right-2 top-2 w-10 h-10 bg-[var(--accent-orange)] rounded-xl flex items-center justify-center text-white cursor-pointer shadow-lg shadow-[var(--accent-orange)]/30">
                    <Search size={18} />
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-[var(--bg-card)] rounded-[32px] p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                <h3 className="font-bold text-xl mb-8">Statistic</h3>

                <div className="flex flex-col gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-page)]/50 border border-[var(--border-color)]">
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-[var(--text-main)]">{stat.label}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{stat.sublabel}</p>
                            </div>

                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="24" cy="24" r="20"
                                        fill="none" stroke="var(--border-color)" strokeWidth="3"
                                    />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        fill="none" stroke={stat.color} strokeWidth="3"
                                        strokeDasharray={2 * Math.PI * 20}
                                        strokeDashoffset={2 * Math.PI * 20 * (1 - stat.value / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-bold">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Promo Card */}
                <div className="mt-12 bg-[var(--accent-orange)]/10 rounded-3xl p-6 text-center border border-[var(--accent-orange)]/20 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-orange)]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                            <ChevronRight className="text-[var(--accent-orange)]" size={32} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Unlock more space now!</h4>
                        <p className="text-xs text-[var(--text-muted)] mb-6">Upgrade to Drive Plus for advanced device analytics.</p>

                        <button className="w-full bg-[var(--accent-orange)] text-white font-bold py-3 rounded-2xl shadow-lg shadow-[var(--accent-orange)]/30 hover:scale-[1.02] active:scale-95 transition-all">
                            UPGRADE NOW
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
