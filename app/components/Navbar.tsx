"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Hexagon, AlertTriangle } from "lucide-react";

interface NavbarProps {
  isConnected?: boolean;
}

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/report-leak", label: "Report Leak", isAlert: true },
];

export default function Navbar({ isConnected = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-semibold transition-all flex items-center gap-1.5 pb-1 ${isActive
                  ? "text-[var(--text-main)] border-b-2 border-[var(--accent-orange)]"
                  : link.isAlert
                    ? "text-[var(--accent-orange)] hover:opacity-80 border-b-2 border-transparent"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] border-b-2 border-transparent"
                  }`}
              >
                {link.isAlert && <AlertTriangle size={15} />}
                {link.label}
              </Link>
            </li>
          );
        })}
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
          className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-md border border-white/30 transition-all ${isConnected
            ? "bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] shadow-[0_0_10px_rgba(57,108,184,0.3)]"
            : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
            }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-[var(--accent-orange)]" : "bg-[var(--text-muted)]"}`}
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
