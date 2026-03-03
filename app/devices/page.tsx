'use client';

import Navbar from '../components/Navbar';
import FolderCard from '../components/FolderCard';
import DeviceListRow from '../components/DeviceListRow';
import DevicesSidebar from '../components/DevicesSidebar';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useMQTT } from '../hooks/useMQTT';

export default function DevicesPage() {
    const { isConnected } = useMQTT();

    const folders = [
        { title: 'Residential', itemCount: 1240, color: '#62a9e3' },
        { title: 'Commercial', itemCount: 450, color: '#87c4c4' },
        { title: 'Industrial', itemCount: 120, color: '#eb807d' },
    ];

    const devices = [
        { name: 'Kigali Main Meter', type: 'Flow Sensor', date: '21.03.2024', status: '.active', color: '#62a9e3' },
        { name: 'Nyamirambo Node 4', type: 'Pressure Valve', date: '20.03.2024', status: '.standby', color: '#87c4c4' },
        { name: 'Kimironko Hub', type: 'Smart Meter', date: '20.03.2024', status: '.alert', color: '#eb807d' },
        { name: 'Gikondo Pump', type: 'Heavy Duty', date: '12.01.2024', status: '.offline', color: '#64748b' },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[var(--bg-page)]">
            <Navbar isConnected={isConnected} />

            <div className="px-16 pt-12">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button className="px-8 py-4 bg-[var(--accent-orange)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--accent-orange)]/20 hover:scale-[1.02] active:scale-95 transition-all">
                        REGISTER NEW DEVICE
                    </button>
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-12 items-start">
                    <div className="flex flex-col gap-12">
                        {/* Recently Used Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-8">Recently used</h2>
                            <div className="grid grid-cols-3 gap-8">
                                {folders.map((folder, idx) => (
                                    <FolderCard key={idx} {...folder} />
                                ))}
                            </div>
                        </section>

                        {/* Registered Devices List */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Registered Devices</h2>
                                <button className="text-sm font-bold text-[var(--accent-orange)] hover:underline">VIEW ALL</button>
                            </div>

                            <div className="bg-[var(--bg-card)] rounded-[32px] p-4 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                                <div className="flex flex-col gap-1">
                                    {devices.map((device, idx) => (
                                        <DeviceListRow key={idx} {...device} iconColor={device.color} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Shared with me Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Shared with me</h2>
                                <button className="text-sm font-bold text-[var(--accent-orange)] hover:underline">VIEW ALL</button>
                            </div>
                            <div className="grid grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-color)] flex flex-col items-center justify-center gap-3 aspect-square hover:scale-105 transition-all cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                                            <LayoutGrid size={20} />
                                        </div>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] truncate w-full text-center">Node_{i}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <DevicesSidebar />
                </div>
            </div>
        </div>
    );
}
