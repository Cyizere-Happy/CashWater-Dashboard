'use client';

import { ShieldCheck, Database, CheckCircle2, Droplets, Lock, Unlock } from 'lucide-react';

interface EventFeedProps {
    lastHeartbeat: string | null;
    mqttMessage: string;
    flowRate?: number | null;
    valveState?: 'OPEN' | 'CLOSED' | null;
}

export default function EventFeed({ lastHeartbeat, mqttMessage, flowRate, valveState }: EventFeedProps) {
    const valveOpen    = valveState === 'OPEN';
    const valveUnknown = valveState === null || valveState === undefined;

    const flowDisplay = flowRate !== null && flowRate !== undefined
        ? `${flowRate.toFixed(2)} L/min`
        : 'Awaiting sensor...';

    const flowColor =
        flowRate === null || flowRate === undefined ? 'text-[var(--text-muted)]' :
        flowRate > 20 ? 'text-red-500' :
        flowRate > 0  ? 'text-[var(--accent-teal)]' :
                        'text-[var(--text-muted)]';

    return (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
            <h3 className="font-semibold text-sm mb-6">System Feed</h3>
            <div className="flex flex-col">

                {/* Row 1 — AI Integrity heartbeat */}
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-orange)]">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">AI Integrity Scan</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{lastHeartbeat || 'Waiting for hardware sync...'}</p>
                    </div>
                    <div className={`text-[10px] font-bold ${lastHeartbeat ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                        {lastHeartbeat ? 'ACTIVE' : 'IDLE'}
                    </div>
                </div>

                {/* Row 2 — MQTT bridge status */}
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-teal)]">
                        <Database size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">Data Bridge Status</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{mqttMessage}</p>
                    </div>
                    {mqttMessage.includes('Active') && (
                        <div className="text-green-500">
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>

                {/* Row 3 — Live flow rate */}
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <div className={`w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center ${flowColor}`}>
                        <Droplets size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">Flow Sensor</h4>
                        <p className={`text-[10px] font-bold ${flowColor}`}>{flowDisplay}</p>
                    </div>
                    {flowRate !== null && flowRate !== undefined && flowRate > 20 && (
                        <div className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                            HIGH
                        </div>
                    )}
                </div>

                {/* Row 4 — Valve state */}
                <div className="flex items-center gap-4 py-4">
                    <div className={`w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center ${
                        valveUnknown ? 'text-[var(--text-muted)]' :
                        valveOpen    ? 'text-green-500' : 'text-orange-500'
                    }`}>
                        {valveUnknown ? <Lock size={20} /> : valveOpen ? <Unlock size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">Solenoid Valve</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">
                            {valveUnknown ? 'Awaiting hardware...' :
                             valveOpen    ? 'Water supply open' : 'Water supply blocked'}
                        </p>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        valveUnknown ? 'text-[var(--text-muted)]' :
                        valveOpen    ? 'text-green-500 bg-green-50 dark:bg-green-500/10' :
                                       'text-orange-500 bg-orange-50 dark:bg-orange-500/10'
                    }`}>
                        {valveUnknown ? '--' : valveOpen ? 'OPEN' : 'CLOSED'}
                    </div>
                </div>

            </div>
        </div>
    );
}
