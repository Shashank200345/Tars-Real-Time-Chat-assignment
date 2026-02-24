"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserSearch } from "./UserSearch";
import { ConversationItem } from "./ConversationItem";
import { Loader2, MessageSquare, Users, Settings, Moon, ChevronRight, Menu } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";

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
    const conversations = useQuery(api.conversations.listForMe);

    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] text-slate-300 w-full overflow-hidden font-sans relative">
            {/* Mobile Close Button (only visible on small screens when overlay is up) */}
            {onCloseMobile && (
                <button
                    onClick={onCloseMobile}
                    className="md:hidden absolute top-6 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-white/5"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-20 shrink-0 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                        calley
                    </span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider border border-white/20 text-white/70 px-2 py-0.5 rounded-full">
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
                                    item.active ? "bg-white/10" : "hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] stroke-[1.5]",
                                        item.active ? "text-white" : "text-slate-400 group-hover:text-white"
                                    )} />
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        item.active ? "text-white" : "group-hover:text-white"
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
            <div className="px-3 pb-4 pt-2 border-t border-white/5 shrink-0">
                {/* User Profile Info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/5 border border-white/10">
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: { userButtonAvatarBox: "w-8 h-8" },
                        }}
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">My Profile</span>
                        <span className="text-[10px] text-slate-400">Manage account</span>
                    </div>
                </div>

                {bottomNavCategories.map((item) => (
                    <button
                        key={item.name}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-sm mb-1"
                    >
                        <item.icon className="w-[18px] h-[18px] stroke-[1.5] text-slate-400 group-hover:text-white" />
                        <span className="font-medium group-hover:text-white transition-colors">{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
