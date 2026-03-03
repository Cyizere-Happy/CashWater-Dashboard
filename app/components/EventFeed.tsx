'use client';

import { Cpu, Radio, CheckCircle2 } from 'lucide-react';

interface EventFeedProps {
    lastHeartbeat: string | null;
    mqttMessage: string;
}

export default function EventFeed({ lastHeartbeat, mqttMessage }: EventFeedProps) {
    return (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
            <h3 className="font-semibold text-sm mb-6">Recent Events</h3>
            <div className="flex flex-col">
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-orange)]">
                        <Cpu size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">ESP8266 Initialization</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{lastHeartbeat || 'Waiting for data...'}</p>
                    </div>
                    <div className="text-[10px] font-bold text-green-500">DONE</div>
                </div>

                <div className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-teal)]">
                        <Radio size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">MQTT Connection</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{mqttMessage}</p>
                    </div>
                    {mqttMessage.includes('Active') && (
                        <div className="text-green-500">
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
