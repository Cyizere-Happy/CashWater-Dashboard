"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            // Direct pass for auth page and marketing
            if (pathname === "/auth" || pathname === "/") {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem("admin_token");
            const role = localStorage.getItem("admin_role");

            if (!token || role !== "ADMIN") {
                console.warn("Unauthorized access attempt redirected to /auth");
                window.location.href = "/auth";
            } else {
                setIsAuthorized(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-page)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--accent-orange)]/20 border-t-[var(--accent-orange)] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-orange)]">
                        Verifying Secure Access...
                    </p>
                </div>
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
