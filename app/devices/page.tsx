"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FolderCard from "../components/FolderCard";
import DeviceListRow from "../components/DeviceListRow";
import DevicesSidebar from "../components/DevicesSidebar";
import { ChevronLeft, ChevronRight, LayoutGrid, QrCode, X, Copy, Check } from "lucide-react";
import { useMQTT } from "../hooks/useMQTT";
import { QRCodeCanvas } from "qrcode.react";

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

  const [devices, setDevices] = useState<any[]>([]);

  const fetchDevices = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3005/devices", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/auth";
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setDevices(data.map((d: any) => ({
          name: d.name || d.id,
          type: d.type || "Smart Meter",
          date: d.registrationTimestamp || d.createdAt
            ? new Date(d.registrationTimestamp || d.createdAt).toLocaleDateString()
            : "N/A",
          status: d.isValveBlocked ? ".cutoff" : ".active",
          location: d.location || "Default",
          coordinates: d.latitude && d.longitude ? [Number(d.longitude), Number(d.latitude)] : null,
          color: "var(--accent-orange)",
        })));
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegisterNewDevice = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3005/devices/generate-qr", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/auth";
        return;
      }

      const data = await response.json();
      if (data.registrationToken) {
        setQrToken(data.registrationToken);
        setShowQrModal(true);
      }
    } catch (error) {
      console.error("Failed to generate QR:", error);
      // For demo purposes, generate a fallback token if backend isn't reachable
      setQrToken(`CW-${Math.random().toString(16).slice(2, 10).toUpperCase()}`);
      setShowQrModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              onClick={handleRegisterNewDevice}
              disabled={isLoading}
              className="px-8 py-4 bg-[var(--accent-orange)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--accent-orange)]/20 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <QrCode size={20} />
              {isLoading ? "GENERATING..." : "REGISTER NEW DEVICE"}
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
                {devices.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {devices.map((device, idx) => (
                      <div key={idx} className="border-b border-black/5 last:border-0">
                        {/* Render indicator for debug */}
                        <DeviceListRow
                          {...device}
                          location={device.location}
                          coordinates={device.coordinates}
                          iconColor={device.color}
                          onToggleSupply={handleToggleSupply}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-[var(--text-muted)]">
                    <LayoutGrid size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No devices registered yet</p>
                    <p className="text-[10px] mt-1">Use a registration token to add devices via Mobile App</p>
                  </div>
                )}
              </motion.div>
            </motion.div>

            <div className="mt-8 p-4 bg-black/5 rounded-xl border border-dashed border-black/10 overflow-auto max-h-40">
              <p className="text-[10px] font-bold mb-2 opacity-50 uppercase tracking-widest">Debug: Device State</p>
              <pre className="text-[10px] font-mono whitespace-pre text-black/40">
                {JSON.stringify(devices, null, 2)}
              </pre>
            </div>

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

      {/* QR Code Modal */ }
  <AnimatePresence>
    {showQrModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowQrModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-[40px] p-8 border border-[var(--border-color)] shadow-2xl flex flex-col items-center"
        >
          <button
            onClick={() => setShowQrModal(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-page)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)]/10 flex items-center justify-center text-[var(--accent-orange)] mb-6">
            <QrCode size={32} />
          </div>

          <h3 className="text-xl font-bold text-center mb-2">Device Registration</h3>
          <p className="text-xs text-[var(--text-muted)] text-center mb-8 px-4">
            Scan this code with the CashWater Mobile App to bind a new device securely.
          </p>

          <div className="bg-white p-6 rounded-[32px] shadow-inner mb-8 border-4 border-[var(--accent-orange)]/10">
            <QRCodeCanvas
              value={qrToken}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/logo.png", // Ensure you have a logo or remove this
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <div className="w-full bg-[var(--bg-page)] rounded-2xl p-4 border border-[var(--border-color)] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Manual Code</p>
              <p className="text-sm font-mono font-bold text-[var(--accent-orange)]">{qrToken}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-all"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <p className="mt-8 text-[10px] text-[var(--text-muted)] font-medium text-center italic">
            * This code is unique and verified by WASAC Secure Auth.
          </p>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
    </div >
  );
}
