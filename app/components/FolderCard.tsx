'use client';

import { MoreHorizontal } from 'lucide-react';

interface FolderCardProps {
    title: string;
    itemCount: number;
    color: string;
}

export default function FolderCard({ title, itemCount, color }: FolderCardProps) {
    return (
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border-color)] relative overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
            <div
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex justify-between items-start">
                <div
                    className="w-12 h-10 rounded-xl flex items-center justify-center border border-[var(--border-color)] shadow-sm overflow-hidden"
                    style={{ backgroundColor: `${color}08` }}
                >
                    <div
                        className="w-6 h-4 rounded-[2px] border-2"
                        style={{ borderColor: color, opacity: 0.7 }}
                    />
                </div>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="mt-6">
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold opacity-60">Folder</p>
                <h3 className="text-lg font-bold text-[var(--text-main)] leading-tight">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{itemCount} items</p>
            </div>

            <div className="mt-6 flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-page)] flex items-center justify-center text-[9px] font-bold shadow-sm"
                        style={{ backgroundColor: i % 2 === 0 ? 'var(--accent-orange)' : 'var(--accent-teal)', opacity: 0.15 }}
                    >
                        {String.fromCharCode(64 + i)}
                    </div>
                ))}
            </div>
        </div>
    );
}
