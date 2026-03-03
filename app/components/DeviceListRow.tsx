'use client';

import { FileText, MoreHorizontal, Plus, Share2 } from 'lucide-react';

interface DeviceListRowProps {
    name: string;
    type: string;
    date: string;
    status: string;
    iconColor: string;
}

export default function DeviceListRow({ name, type, date, status, iconColor }: DeviceListRowProps) {
    return (
        <div className="flex items-center gap-6 py-4 px-6 hover:bg-[var(--bg-page)] rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-[var(--border-color)]">
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
            >
                <FileText size={20} />
            </div>

            <div className="flex-[2]">
                <h4 className="font-bold text-[var(--text-main)]">{name}</h4>
            </div>

            <div className="flex-1">
                <p className="text-sm text-[var(--text-muted)]">{type}</p>
            </div>

            <div className="flex-1">
                <p className="text-sm text-[var(--text-muted)]">{date}</p>
            </div>

            <div className="flex-[0.5] text-right">
                <p className="text-sm font-bold text-[var(--text-main)]">{status}</p>
            </div>

            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <MoreHorizontal size={18} />
                </button>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <Plus size={18} />
                </button>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
}
