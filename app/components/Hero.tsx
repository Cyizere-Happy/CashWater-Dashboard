"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import WaterGauge from "./TempGauge";

interface HeroProps {
  value: number | null;
}

export default function Hero({ value }: HeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[var(--accent-orange)] dark:bg-[var(--bg-header)] px-16 pt-12 pb-24 flex justify-between items-center text-white rounded-b-[60px] relative mb-8 shadow-[0_10px_30px_rgba(98,169,227,0.2)]"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center border-2 border-white">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-sm opacity-90 font-light">Good Morning,</h2>
          <h1 className="text-2xl font-bold">Cyizere</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
        }}
        className="absolute left-1/2 -bottom-16 -translate-x-1/2 z-10"
      >
        <WaterGauge value={value} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-right"
      >
        <p className="text-[10px] opacity-80 uppercase tracking-widest mb-1">
          Water Quality
        </p>
        <h1 className="text-4xl font-bold">Healthy</h1>
      </motion.div>
    </motion.header>
  );
}
