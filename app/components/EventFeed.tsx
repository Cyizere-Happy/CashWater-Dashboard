"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, CheckCircle2 } from "lucide-react";

interface EventFeedProps {
  lastHeartbeat: string | null;
  mqttMessage: string;
}

<<<<<<< HEAD
export default function EventFeed({ lastHeartbeat, mqttMessage }: EventFeedProps) {
    return (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
            <h3 className="font-semibold text-sm mb-6">System Feed</h3>
            <div className="flex flex-col">
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-orange)]">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">AI Integrity Scan</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{lastHeartbeat || 'Waiting for sync...'}</p>
                    </div>
                    <div className="text-[10px] font-bold text-[var(--accent-orange)]">ACTIVE</div>
                </div>

                <div className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-teal)]">
                        <Database size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">Data Bridge Status</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{mqttMessage}</p>
                    </div>
                    {mqttMessage.includes('Active') && (
                        <div className="text-[var(--accent-orange)]">
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
=======
export default function EventFeed({
  lastHeartbeat,
  mqttMessage,
}: EventFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
      className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]"
    >
      <h3 className="font-semibold text-sm mb-6">System Feed</h3>
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-orange)]">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-main)]">
              AI Integrity Scan
            </h4>
            <p className="text-[10px] text-[var(--text-muted)]">
              {lastHeartbeat || "Waiting for sync..."}
            </p>
          </div>
          <div className="text-[10px] font-bold text-green-500">ACTIVE</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="flex items-center gap-4 py-4"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-page)] flex items-center justify-center text-[var(--accent-teal)]">
            <Database size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-main)]">
              Data Bridge Status
            </h4>
            <p className="text-[10px] text-[var(--text-muted)]">
              {mqttMessage}
            </p>
          </div>
          {mqttMessage.includes("Active") && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
              className="text-green-500"
            >
              <CheckCircle2 size={16} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
>>>>>>> bde9b26d23012dd55fd47c6812f9bc06076d648e
}
