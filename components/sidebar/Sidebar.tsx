"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserSearch } from "./UserSearch";
import { ConversationItem } from "./ConversationItem";
import { Loader2, Home, Activity, Truck, Package, ShoppingCart, Users, Settings, Tag, Megaphone, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Static nav items matched to screenshot
const staticNavCategories = [
    { name: "Dashboard", icon: Home, hasSubmenu: true, active: false },
    { name: "Analytics", icon: Activity },
    { name: "Track Shipment", icon: Truck },
    { name: "Products", icon: Package },
    { name: "Orders", icon: ShoppingCart },
];

const bottomNavCategories = [
    { name: "Affiliates", icon: Tag },
    { name: "Marketing", icon: Megaphone },
];

export function Sidebar() {
    const conversations = useQuery(api.conversations.listForMe);
    const [customersOpen, setCustomersOpen] = useState(true);

    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] text-slate-300 w-full overflow-hidden font-sans">
            {/* 
        Header - Removed UserButton (moved to primary sidebar).
        Just branding and the "Pro" badge as seen in screenshot.
      */}
            <div className="flex items-center justify-between px-5 h-20 shrink-0">
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
                    {/* Static Top Nav */}
                    {staticNavCategories.map((item) => (
                        <button
                            key={item.name}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-sm"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-[18px] h-[18px] stroke-[1.5] text-slate-400 group-hover:text-white" />
                                <span className="font-medium group-hover:text-white transition-colors">{item.name}</span>
                            </div>
                            {item.hasSubmenu && <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </button>
                    ))}

                    {/* Customers / Chats Accordion (Active Section) */}
                    <div className="mt-4 mb-1">
                        <div
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] cursor-pointer"
                            onClick={() => setCustomersOpen(!customersOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-[18px] h-[18px] stroke-[1.5] text-white" />
                                <span className="font-medium text-white text-sm">Customers</span>
                            </div>
                            <UserSearch /> {/* Plus icon to create new chat */}
                        </div>

                        {/* Submenu for Chats */}
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out pl-6 pr-2",
                            customersOpen ? "max-h-[800px] mt-2 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <div className="border-l border-white/10 ml-2 pl-3 py-1 flex flex-col gap-1">
                                <div className="text-sm font-medium text-white py-1.5 px-2 bg-white/5 rounded-lg">Chats</div>
                                <div className="text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors">Contact Details</div>
                                <div className="text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors">Add New User</div>

                                {/* Dynamic Convex Conversations List */}
                                <div className="mt-4 flex flex-col gap-1">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 px-2">Active Chats</div>
                                    {conversations === undefined ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="text-center px-2 text-slate-500 text-xs">
                                            No active chats
                                        </div>
                                    ) : (
                                        conversations.map((conv) => (
                                            <ConversationItem key={conv._id} conversation={conv as any} />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Static Bottom Nav */}
                    {bottomNavCategories.map((item) => (
                        <button
                            key={item.name}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-sm"
                        >
                            <item.icon className="w-[18px] h-[18px] stroke-[1.5] text-slate-400 group-hover:text-white" />
                            <span className="font-medium group-hover:text-white transition-colors">{item.name}</span>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
