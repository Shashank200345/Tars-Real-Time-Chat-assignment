"use client";

import { useState } from "react";
import { PrimarySidebar } from "@/components/sidebar/PrimarySidebar";
import { Sidebar as SecondarySidebar } from "@/components/sidebar/Sidebar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function ChatsLayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // We can also let desktop users collapse the secondary sidebar for a focus mode if wanted,
    // but for now, we'll keep it standard on desktop and sliding on mobile.
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-[100dvh] bg-[#0A0A0A] text-slate-100 overflow-hidden font-sans relative">

            {/* 
        Mobile Hamburger Toggle (only visible on small screens when menu is closed) 
        This is absolutely positioned over the chat view so you can open the menu.
      */}
            {!mobileMenuOpen && (
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden absolute top-3 left-3 z-40 p-2.5 bg-[#111] border border-white/10 rounded-xl shadow-lg backdrop-blur text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* 1. Primary Icon Sidebar (Hidden on tight mobile, visible sm+) */}
            <div className="hidden sm:flex h-full z-30 shrink-0">
                <PrimarySidebar />
            </div>

            {/* 2. Secondary List Sidebar */}
            <div
                className={cn(
                    "h-full z-40 shrink-0 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ease-out border-r border-white/5 bg-[#0B0B0B]",
                    // Mobile state: positioned absolute, slide in/out
                    "absolute inset-y-0 left-0 shadow-2xl md:relative md:shadow-none",
                    mobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0",
                    // Desktop state widths
                    desktopSidebarCollapsed ? "md:w-0 md:opacity-0 md:overflow-hidden md:border-none" : "md:w-[260px] lg:w-[280px]"
                )}
            >
                <SecondarySidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>

            {/* 3. Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0A0A0A] relative z-0">
                {children}
            </div>

            {/* Mobile Overlay Background (dims the chat when drawer is open) */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300",
                    mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileMenuOpen(false)}
            />
        </div>
    );
}
