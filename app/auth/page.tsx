"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon } from "lucide-react";

function AuthContent() {
    const searchParams = useSearchParams();
    const initialMode =
        searchParams.get("mode") === "register" ? "register" : "login";
    const [mode, setMode] = useState<"login" | "register">(initialMode);

    return (
        <div className="h-screen bg-white flex items-stretch font-sans overflow-hidden">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col px-8 lg:px-20 py-6 relative">
                {/* Logo */}
                <div className="mb-4 lg:mb-6">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <div className="transform group-hover:rotate-12 transition-transform duration-300">
                            <Hexagon className="fill-[#62a9e3] text-[#62a9e3]" size={32} />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-[#1e293b]">
                            Cash<span className="text-[#62a9e3]">Water</span>.
                        </span>
                    </Link>
                </div>

                <div className="max-w-[400px] w-full mx-auto my-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="space-y-4"
                        >
                            <div className="space-y-1">
                                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900 leading-tight">
                                    {mode === "login" ? "Welcome Back" : "Create Account"}
                                </h1>
                                <p className="text-gray-400 font-medium text-[10px] leading-relaxed">
                                    {mode === "login"
                                        ? "Enter your credentials to access your account."
                                        : "Join us for a premium water management experience."}
                                </p>
                            </div>

                            {/* Google Login */}
                            <button className="w-full h-10 rounded-xl border border-gray-100 flex items-center justify-center gap-3 font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 group">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="text-xs">Login with Google</span>
                            </button>

                            <div className="relative flex items-center justify-center py-1">
                                <div className="absolute w-full h-[1px] bg-gray-100" />
                                <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                                    or
                                </span>
                            </div>

                            {/* Form */}
                            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                {mode === "register" && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                            Name*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            className="w-full h-10 px-6 rounded-xl bg-[#f8f8f8] border-2 border-transparent focus:border-[#62a9e3] focus:bg-white transition-all duration-300 outline-none font-semibold text-sm"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                        Email*
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full h-10 px-6 rounded-xl bg-[#f8f8f8] border-2 border-transparent focus:border-[#62a9e3] focus:bg-white transition-all duration-300 outline-none font-semibold text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                        Password*
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        className="w-full h-10 px-6 rounded-xl bg-[#f8f8f8] border-2 border-transparent focus:border-[#62a9e3] focus:bg-white transition-all duration-300 outline-none font-semibold text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-3 py-1">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-2 border-gray-100 appearance-none checked:bg-[#62a9e3] checked:border-[#62a9e3] transition-all duration-300 cursor-pointer"
                                        />
                                        <svg
                                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 checked:opacity-100"
                                            viewBox="0 0 12 10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <path d="M1 5l3.5 3.5L11 1" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-400 leading-tight">
                                        I agree to all Terms and Conditions
                                    </span>
                                </div>

                                <button className="w-full h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#62a9e3] text-white font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-xl shadow-gray-200 active:scale-[0.98]">
                                    {mode === "login" ? "Login" : "Sign Up"}
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <p className="text-xs font-semibold text-gray-400">
                                    {mode === "login"
                                        ? "Don't have an account? "
                                        : "Already have an account? "}
                                    <button
                                        onClick={() =>
                                            setMode(mode === "login" ? "register" : "login")
                                        }
                                        className="text-[#62a9e3] font-black hover:underline underline-offset-4"
                                    >
                                        {mode === "login" ? "Register" : "Log in"}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side: Marketing */}
            <div className="hidden lg:flex flex-1 p-6 bg-white items-center justify-center">
                <div
                    className="relative w-full h-full max-w-[650px] overflow-hidden shadow-2xl bg-[#1a1a1a] rounded-[80px]"
                    style={{
                        clipPath:
                            "path('M 120,0 H 530 C 596,0 650,54 650,120 V 680 C 650,746 596,800 530,800 H 120 C 54,800 0,746 0,680 V 220 C 0,154 54,100 120,100 V 100 C 120,44 164,0 220,0 Z')",
                    }}
                >
                    {/* Image Layer */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/auth-hero.png"
                            alt="Premium Water Management"
                            fill
                            className="object-cover opacity-90 brightness-[0.7] contrast-[1.1]"
                            priority
                        />
                    </div>

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent z-10" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-14 space-y-6 z-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-white max-w-lg leading-tight tracking-tight">
                            Smart Water Management for Everyone
                        </h2>
                        <p className="text-white/80 text-base font-medium max-w-md">
                            From automated tracking to seamless payments, CashWater brings the
                            efficiency you deserve right to your fingertips.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#62a9e3] flex items-center justify-center">
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="4"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    100% Reliability
                                </span>
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M1 3h15v13H1z" />
                                    <path d="M16 8h4l3 3v5h-7V8z" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-nowrap">
                                    Real-time monitoring
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cutout Corners */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-br-[40px] z-30 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-12 h-12 bg-[#1a1a1a] rounded-tl-[60px] translate-x-12 translate-y-12 shadow-[-20px_-20px_0_0_white] z-30 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-tl-[40px] z-30 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-[#1a1a1a] rounded-br-[60px] -translate-x-12 -translate-y-12 shadow-[20px_20px_0_0_white] z-30 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-[#62a9e3]">
                    Loading...
                </div>
            }
        >
            <AuthContent />
        </Suspense>
    );
}
