'use client';

import { FileText, MapPin, MoreHorizontal, Plus, Share2 } from 'lucide-react';

interface DeviceListRowProps {
    name: string;
    type: string;
    date: string;
    status: string;
    iconColor: string;
    location?: string;
    coordinates?: [number, number];
    onToggleSupply?: (name: string, isOff: boolean) => void;
}

export default function DeviceListRow({ name, type, date, status, iconColor, location, coordinates, onToggleSupply }: DeviceListRowProps) {
    const isOff = (status || "").toLowerCase() === '.cutoff';

    return (
        <div className={`flex items-center gap-6 py-4 px-6 hover:bg-[var(--bg-page)] rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-[var(--border-color)] ${isOff ? 'opacity-70 bg-red-50/10' : ''}`}>
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center relative shadow-sm"
                style={{ backgroundColor: isOff ? '#ef444415' : `${iconColor}15`, color: isOff ? '#ef4444' : iconColor }}
            >
                <FileText size={20} />
                {isOff && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
            </div>

            <div className="flex-[2] min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className={`font-bold truncate ${isOff ? 'text-red-500' : 'text-[var(--text-main)]'}`}>{name}</h4>
                    {coordinates && (
                        <div className="px-1.5 py-0.5 bg-blue-50 text-[8px] text-blue-500 rounded-md font-bold flex items-center gap-0.5">
                            <MapPin size={8} />
                            GPS
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">QR_VERIFIED_REG</p>
                    {location && (
                        <>
                            <div className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                            <p className="text-[10px] text-[var(--accent-orange)] font-bold truncate max-w-[120px]">{location}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <p className="text-sm text-[var(--text-muted)]">{type}</p>
            </div>

            <div className="flex-1">
                <p className="text-sm text-[var(--text-muted)]">{date}</p>
            </div>

            <div className="flex-[0.5] text-right">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter ${isOff ? 'bg-red-500 text-white' :
                    status === '.active' ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]' :
                        status === '.standby' ? 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]' :
                            'bg-[var(--accent-light)] text-[var(--accent-orange)]'
                    }`}>
                    {status.replace('.', '')}
                </span>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                {onToggleSupply && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSupply(name, !isOff);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-sm ${isOff
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                    >
                        {isOff ? 'RESTORE' : 'CUT OFF'}
                    </button>
                )}
                <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1">
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </div>
    );
}
