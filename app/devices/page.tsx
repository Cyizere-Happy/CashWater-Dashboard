"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import FolderCard from "../components/FolderCard";
import DeviceListRow from "../components/DeviceListRow";
import DevicesSidebar from "../components/DevicesSidebar";
import { ChevronLeft, ChevronRight, LayoutGrid, QrCode } from "lucide-react";
import { useMQTT } from "../hooks/useMQTT";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

export default function DevicesPage() {
  const { isConnected, publishMessage } = useMQTT();

  const folders = [
    { title: "Residential", itemCount: 1240, color: "var(--accent-orange)" },
    { title: "Commercial", itemCount: 450, color: "var(--accent-orange)" },
    { title: "Industrial", itemCount: 120, color: "var(--accent-orange)" },
  ];

  const [devices, setDevices] = useState([
    {
      name: "Kigali Main Meter",
      type: "Flow Sensor",
      date: "21.03.2024",
      status: ".active",
      color: "var(--accent-orange)",
    },
    {
      name: "Nyamirambo Node 4",
      type: "Pressure Valve",
      date: "20.03.2024",
      status: ".standby",
      color: "var(--accent-orange)",
    },
    {
      name: "Kimironko Hub",
      type: "Smart Meter",
      date: "20.03.2024",
      status: ".active",
      color: "var(--accent-orange)",
    },
    {
      name: "Gikondo Pump",
      type: "Heavy Duty",
      date: "12.01.2024",
      status: ".offline",
      color: "var(--text-muted)",
    },
  ]);

  const handleToggleSupply = (deviceName: string, isCutOff: boolean) => {
    const command = isCutOff ? "OFF" : "ON";
    const topic = `control/water/${deviceName.toLowerCase().replace(/ /g, "_")}`;

    publishMessage(topic, command);

    setDevices((prev) =>
      prev.map((d) =>
        d.name === deviceName
          ? { ...d, status: isCutOff ? ".cutoff" : ".active" }
          : d,
      ),
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-[var(--bg-page)]">
      <Navbar isConnected={isConnected} />

      <div className="px-16 pt-12">
        {/* Top toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="h-10 w-[1px] bg-[var(--border-color)]" />

            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--accent-orange)]/10 rounded-xl border border-[var(--accent-orange)]/20">
              <QrCode className="text-[var(--accent-orange)]" size={20} />
              <span className="text-xs font-bold text-[var(--accent-orange)] uppercase tracking-wider">
                Mobile QR Sync Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                System Auth
              </p>
              <p className="text-xs font-bold text-[var(--accent-orange)]">ADMIN SECURE</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[var(--accent-orange)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--accent-orange)]/20 transition-all flex items-center gap-3"
            >
              <QrCode size={20} />
              REGISTER NEW DEVICE
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-[1fr_340px] gap-12 items-start">
          <div className="flex flex-col gap-12">
            {/* Recently Used Section */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between mb-8"
              >
                <h2 className="text-2xl font-bold">Recently used</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Manage categories
                </p>
              </motion.div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-8"
              >
                {folders.map((folder, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <FolderCard {...folder} />
                  </motion.div>
                ))}
              </motion.div>
            </section>

            {/* Registered Devices List */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">Registered Devices</h2>
                  <span className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold text-[var(--text-muted)]">
                    {devices.length} TOTAL
                  </span>
                </div>
                <button className="text-sm font-bold text-[var(--accent-orange)] hover:underline">
                  VIEW ALL
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="bg-[var(--bg-card)] rounded-[32px] p-4 shadow-[var(--card-shadow)] border border-[var(--border-color)]"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-1"
                >
                  {devices.map((device, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                      <DeviceListRow
                        {...device}
                        iconColor={device.color}
                        onToggleSupply={handleToggleSupply}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <p className="mt-6 text-[10px] text-[var(--text-muted)] text-center italic">
                * Devices registered via Mobile App QR scan are automatically
                verified.
              </p>
            </section>

            {/* Shared with me Section */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center justify-between mb-8"
              >
                <h2 className="text-2xl font-bold">Shared with me</h2>
                <button className="text-sm font-bold text-[var(--accent-orange)] hover:underline">
                  VIEW ALL
                </button>
              </motion.div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-6 gap-4"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                    className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-color)] flex flex-col items-center justify-center gap-3 aspect-square cursor-pointer shadow-sm hover:border-[var(--accent-orange)]/30"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-orange)]">
                      <LayoutGrid size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--accent-orange)] truncate w-full text-center">
                      Node_{i}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          </div>

          {/* Sidebar */}
          <DevicesSidebar />
        </div>
      </div>
    </div>
  );
}
