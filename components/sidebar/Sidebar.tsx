"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserSearch } from "./UserSearch";
import { ConversationItem } from "./ConversationItem";
import { Loader2, MessageSquare, Users, Settings, Moon, Sun, ChevronRight, Menu } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

// Relevant nav items for a chat app
const topNavCategories = [
    { name: "All Chats", icon: MessageSquare, active: true },
    { name: "Contacts", icon: Users, active: false },
];

const bottomNavCategories = [
    { name: "Settings", icon: Settings },
    { name: "Dark Mode", icon: Moon },
];

export function Sidebar({
    onCloseMobile
}: {
    onCloseMobile?: () => void
}) {
    const router = useRouter();
    const conversations = useQuery(api.conversations.listForMe);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleBottomNavClick = (name: string) => {
        if (name === "Settings") {
            router.push("/chats/settings");
            if (onCloseMobile) onCloseMobile();
        } else if (name === "Dark Mode" || name === "Light Mode") {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    // Calculate dynamic bottom nav
    const isDark = theme === "dark";
    const bottomNavCategories = [
        { name: "Settings", icon: Settings },
        { name: mounted && !isDark ? "Dark Mode" : "Light Mode", icon: mounted && !isDark ? Moon : Sun },
    ];

    return (
        <div className="flex flex-col h-full bg-background text-foreground w-full overflow-hidden font-sans relative">
            {/* Mobile Close Button (only visible on small screens when overlay is up) */}
            {onCloseMobile && (
                <button
                    onClick={onCloseMobile}
                    className="md:hidden absolute top-6 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg bg-secondary"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-20 shrink-0 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-foreground tracking-tight flex items-center gap-2">
                        calley
                    </span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                    Pro
                </div>
            </div>

            <ScrollArea className="flex-1 w-full px-3">
                <div className="flex flex-col gap-1 pb-4">

                    {/* Main App Navigation */}
                    <div className="mb-4">
                        {topNavCategories.map((item) => (
                            <button
                                key={item.name}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group text-sm mb-1",
                                    item.active ? "bg-accent" : "hover:bg-accent/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] stroke-[1.5]",
                                        item.active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        item.active ? "text-foreground" : "group-hover:text-foreground"
                                    )}>
                                        {item.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Direct Messages Section */}
                    <div className="mt-2 mb-1">
                        <div className="w-full flex items-center justify-between px-3 py-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                Direct Messages
                            </span>
                            <UserSearch /> {/* This contains the + button */}
                        </div>

                        <div className="mt-2 flex flex-col gap-0.5">
                            {conversations === undefined ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="px-3 py-4 text-slate-500 text-xs italic">
                                    No active chats yet.
                                    <br />Click the + icon to start!
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <ConversationItem key={conv._id} conversation={conv as any} />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </ScrollArea>

            {/* Bottom Preferences Nav */}
            <div className="px-3 pb-4 pt-2 border-t border-border shrink-0">
                {/* User Profile Info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-card border border-border">
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: { userButtonAvatarBox: "w-8 h-8" },
                        }}
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">My Profile</span>
                        <span className="text-[10px] text-muted-foreground">Manage account</span>
                    </div>
                </div>

                {bottomNavCategories.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleBottomNavClick(item.name)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors group text-sm mb-1"
                    >
                        <item.icon className="w-[18px] h-[18px] stroke-[1.5] text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium group-hover:text-foreground transition-colors">{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
