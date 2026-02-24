"use client";

import { usePathname } from "next/navigation";
import { MessageSquare, LayoutDashboard, RadioTower, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { BroadcastModal } from "./BroadcastModal";
import { CreateGroupModal } from "./CreateGroupModal";

export function PrimarySidebar() {
    const pathname = usePathname();
    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);

    const isChatsActive = pathname.startsWith("/chats");

    return (
        <>
            <div className="w-[72px] h-full bg-[#050505] border-r border-white/5 flex flex-col items-center py-4 gap-4 z-20 shrink-0">
                <TooltipProvider delayDuration={0}>
                    {/* App Logo / Top Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-2 shadow-lg shadow-blue-900/20 cursor-pointer hover:bg-blue-500 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Separator */}
                    <div className="w-8 h-[2px] bg-white/10 rounded-full mb-2" />

                    {/* Nav Icons */}
                    <div className="flex-1 flex flex-col gap-3 w-full items-center">
                        {/* Chats Link */}
                        <Tooltip placement="right">
                            <TooltipTrigger asChild>
                                <Link href="/chats" className="relative group w-full flex justify-center">
                                    <div className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-md transition-all duration-300",
                                        isChatsActive ? "h-8" : "h-0 group-hover:h-5 opacity-50"
                                    )} />
                                    <div className={cn(
                                        "w-12 h-12 rounded-[24px] flex items-center justify-center transition-all duration-300 overflow-hidden",
                                        isChatsActive
                                            ? "bg-blue-600 text-white rounded-[16px]"
                                            : "bg-white/5 hover:bg-blue-500 hover:text-white hover:rounded-[16px] text-slate-400"
                                    )}>
                                        <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="font-semibold">
                                Chats
                            </TooltipContent>
                        </Tooltip>

                        {/* Broadcast Button */}
                        <Tooltip placement="right">
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setBroadcastOpen(true)}
                                    className="relative group w-full flex justify-center"
                                >
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-md transition-all duration-300 h-0 group-hover:h-5 opacity-50" />
                                    <div className="w-12 h-12 rounded-[24px] flex items-center justify-center transition-all duration-300 overflow-hidden bg-white/5 hover:bg-orange-500 hover:text-white hover:rounded-[16px] text-slate-400">
                                        <RadioTower className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="font-semibold text-orange-400">
                                Broadcast Announcement
                            </TooltipContent>
                        </Tooltip>

                        {/* Add Group Button */}
                        <Tooltip placement="right">
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setGroupOpen(true)}
                                    className="w-12 h-12 rounded-[24px] bg-transparent border border-dashed border-white/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:rounded-[16px] hover:border-transparent transition-all duration-300 mt-2"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="font-semibold text-emerald-500">
                                Create Group Chat
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Bottom Profile */}
                    <div className="mt-auto mb-2 flex items-center justify-center w-full">
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: { userButtonAvatarBox: "w-10 h-10 hover:ring-2 hover:ring-white/20 transition-all" },
                            }}
                        />
                    </div>
                </TooltipProvider>
            </div>

            <BroadcastModal open={broadcastOpen} onOpenChange={setBroadcastOpen} />
            <CreateGroupModal open={groupOpen} onOpenChange={setGroupOpen} />
        </>
    );
}
