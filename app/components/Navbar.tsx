"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Hexagon, Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface NavbarProps {
  isConnected?: boolean;
}

export default function Navbar({ isConnected = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <nav className="flex items-center justify-between px-16 py-6 bg-[var(--nav-bg)] border-b border-[var(--border-color)] sticky top-0 z-50">
      <div className="flex items-center gap-3 text-2xl font-bold tracking-widest text-[var(--text-main)]">
        <Hexagon
          className="fill-[var(--accent-orange)] text-[var(--accent-orange)]"
          size={32}
        />
        Cash<span className="text-[var(--accent-orange)]">Water</span>.
      </div>

      <ul className="flex gap-8 list-none">
        <li>
          <Link
            href="/"
            className="text-[var(--text-main)] font-semibold border-b-2 border-[var(--accent-orange)] pb-1"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/devices"
            className="text-[var(--text-muted)] font-semibold hover:text-[var(--text-main)] transition-colors"
          >
            Devices
          </Link>
        </li>
        <li>
          <Link
            href="/report-leak"
            className="text-[var(--accent-pink)] font-semibold hover:opacity-80 transition-all flex items-center gap-1.5"
          >
            <AlertTriangle size={15} />
            Report Leak
          </Link>
        </li>
      </ul>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div
          className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-md border border-white/30 transition-all ${
            isConnected
              ? "bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>

        <Link
          href="/auth?mode=login"
          className="px-6 py-2 rounded-xl bg-[var(--text-main)] text-white text-sm font-bold hover:bg-[var(--accent-orange)] transition-all active:scale-95"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
