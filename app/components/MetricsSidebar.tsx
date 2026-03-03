"use client";

import { motion } from "framer-motion";
import { Droplets, Power, CircleSlash } from "lucide-react";

interface MetricsSidebarProps {
  households: number | null;
  anomalies: string;
  onSyncAI: (state: "ON" | "OFF") => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function MetricsSidebar({
  households,
  anomalies,
  onSyncAI,
}: MetricsSidebarProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 w-[280px]"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="bg-[var(--accent-teal)] text-white rounded-3xl p-8 shadow-lg flex flex-col gap-4"
      >
        <div className="flex justify-between items-center opacity-80 text-sm font-medium">
          <span>Registered Households</span>
          <Droplets size={18} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">
            {households !== null ? households.toLocaleString() : "--"}
          </span>
        </div>
        <p className="text-[10px] mt-2 opacity-90">Urban Region A</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-[var(--card-shadow)] border border-[var(--border-color)]"
      >
        <h3 className="text-sm font-semibold mb-6">AI Anomaly Guard</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSyncAI("ON")}
            className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${
              anomalies.includes("FLAG")
                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30"
                : "bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)]"
            }`}
          >
            <Power size={24} />
            <span className="text-xs">SCAN</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSyncAI("OFF")}
            className={`flex flex-col items-center gap-2 p-6 rounded-2xl font-bold transition-all border ${
              anomalies.includes("SECURE")
                ? "bg-green-500 text-white border-green-500 shadow-lg"
                : "bg-[var(--bg-page)] text-[var(--text-main)] border-[var(--border-color)]"
            }`}
          >
            <CircleSlash size={24} />
            <span className="text-xs">SECURE</span>
          </motion.button>
        </div>
        <div className="mt-6 text-center">
          <span className="text-[10px] text-[var(--text-muted)]">
            System State:{" "}
          </span>
          <strong
            className={`text-[10px] uppercase ${anomalies.includes("FLAG") ? "text-red-500" : "text-green-500"}`}
          >
            {anomalies}
          </strong>
        </div>
      </motion.div>
    </motion.div>
  );
}
