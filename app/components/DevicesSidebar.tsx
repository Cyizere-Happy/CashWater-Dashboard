"use client";

import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 25 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function AnimatedCircle({
  value,
  color,
  delay,
}: {
  value: number;
  color: string;
  delay: number;
}) {
  const target = CIRCUMFERENCE * (1 - value / 100);

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="3"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: target }}
          transition={{ delay, duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        className="absolute text-[10px] font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.4 }}
      >
        {value}
      </motion.span>
    </div>
  );
}

interface DevicesSidebarProps {
  devices: any[];
}

export default function DevicesSidebar({ devices }: DevicesSidebarProps) {
  const residentialCount = devices.filter(d =>
    d.type?.toUpperCase() === 'RESIDENTIAL' || d.type === 'Smart Meter'
  ).length;
  const commercialCount = devices.filter(d => d.type?.toUpperCase() === 'COMMERCIAL').length;
  const industrialCount = devices.filter(d => d.type?.toUpperCase() === 'INDUSTRIAL').length;
  const total = devices.length || 1;

  const stats = [
    {
      label: 'Residential',
      value: residentialCount,
      percentage: Math.round((residentialCount / total) * 100),
      sublabel: 'Properties',
      color: 'var(--accent-orange)'
    },
    {
      label: 'Commercial',
      value: commercialCount,
      percentage: Math.round((commercialCount / total) * 100),
      sublabel: 'Businesses',
      color: '#34d399' // Success green
    },
    {
      label: 'Industrial',
      value: industrialCount,
      percentage: Math.round((industrialCount / total) * 100),
      sublabel: 'Facilities',
      color: '#60a5fa' // Info blue
    },
  ];

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-[340px] flex flex-col gap-8"
    >
      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative group">
        <input
          type="text"
          placeholder="Search your content"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)] transition-all shadow-[var(--card-shadow)]"
        />
        <div className="absolute right-2 top-2 w-10 h-10 bg-[var(--accent-orange)] rounded-xl flex items-center justify-center text-white cursor-pointer shadow-lg shadow-[var(--accent-orange)]/30">
          <Search size={18} />
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        variants={itemVariants}
        className="bg-[var(--bg-card)] rounded-[32px] p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)]"
      >
        <h3 className="font-bold text-xl mb-8">Statistic</h3>

        <div className="flex flex-col gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-page)]/50 border border-[var(--border-color)]"
            >
              <div className="flex-1">
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  {stat.label}
                </h4>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-[var(--text-main)]">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {stat.sublabel}
                  </p>
                </div>
              </div>

              <AnimatedCircle
                value={stat.percentage}
                color={stat.color}
                delay={0.6 + idx * 0.2}
              />
            </motion.div>
          ))}
        </div>

        {/* Promo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          className="mt-12 bg-[var(--accent-orange)]/10 rounded-3xl p-6 text-center border border-[var(--accent-orange)]/20 relative overflow-hidden group"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-orange)]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
              <ChevronRight className="text-[var(--accent-orange)]" size={32} />
            </div>
            <h4 className="font-bold text-lg mb-2">Unlock more space now!</h4>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Upgrade to Drive Plus for advanced device analytics.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-[var(--accent-orange)] text-white font-bold py-3 rounded-2xl shadow-lg shadow-[var(--accent-orange)]/30 transition-all"
            >
              UPGRADE NOW
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}
