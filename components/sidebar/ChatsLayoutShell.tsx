"use client";

import { useState } from "react";
import { PrimarySidebar } from "@/components/sidebar/PrimarySidebar";
import { Sidebar as SecondarySidebar } from "@/components/sidebar/Sidebar";
import { cn } from "@/lib/utils";

export function ChatsLayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    // On mobile, we might want to toggle the secondary sidebar.
    // For now, we'll keep the desktop triple-column view robust.
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#0A0A0A] text-slate-100 overflow-hidden font-sans">
            {/* 1. Primary Icon Sidebar (Always visible on desktop, hidden on tiny mobile or pushed) */}
            <div className="hidden sm:flex h-full z-30">
                <PrimarySidebar />
            </div>

            {/* 2. Secondary List Sidebar */}
            <div className={cn(
                "h-full z-20 transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0B0B0B]",
                mobileMenuOpen ? "absolute inset-y-0 left-0 w-80 shadow-2xl" : "hidden md:flex md:w-[280px] lg:w-[320px] shrink-0"
            )}>
                <SecondarySidebar />
            </div>

            {/* 3. Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0A0A0A] relative z-0">
                {children}
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
