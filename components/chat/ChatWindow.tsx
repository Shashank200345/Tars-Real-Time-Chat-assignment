"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, CheckCircle2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
    conversationId: Id<"conversations">;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const conversation = useQuery(api.conversations.getById, { conversationId });
    const currentUser = useQuery(api.users.getMe);
    const allConvs = useQuery(api.conversations.listForMe);
    const enrichedConv = allConvs?.find(c => c._id === conversationId);

    if (conversation === undefined || allConvs === undefined || currentUser === undefined) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
        );
    }

    if (!conversation || !enrichedConv) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 bg-[#0A0A0A] text-sm">
                Conversation not found
            </div>
        );
    }

    const otherUser =
        enrichedConv.participants.length === 2
            ? enrichedConv.participants[1]
            : enrichedConv.participants[0];

    return (
        <div className="flex flex-col h-full absolute inset-0 bg-[#0A0A0A] font-sans">
            {/* 
        Top Banner - Copied from screenshot.
        A vibrant blue gradient promoting a free trial.
      */}
            <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-500 w-full flex items-center px-6 shrink-0 relative overflow-hidden shadow-sm z-20">
                <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-[18px] h-[18px] text-blue-200" />
                    <span className="font-semibold text-sm">Get free trial for whole weekend!</span>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-2xl transform skew-x-12 translate-x-10" />
            </div>

            {/* Main message area (Placeholders for now, structure mimics screenshot) */}
            <div className="flex-1 overflow-y-auto relative bg-[#0A0A0A] px-6 py-6 flex flex-col gap-6">
                {/* Date separator */}
                <div className="w-full flex justify-center mb-4">
                    <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                        Started - August 25th Mon. 12:42 AM
                    </span>
                </div>

                {/* Mock Received Message */}
                {otherUser && (
                    <div className="flex gap-3 max-w-[85%]">
                        <UserAvatar
                            name={otherUser.name}
                            imageUrl={otherUser.imageUrl}
                            isOnline={otherUser.isOnline}
                            className="h-8 w-8 mt-1 border border-white/10 rounded-full"
                        />
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-300">{otherUser.name}</span>
                                <span className="text-[10px] text-slate-500">14:00 pm</span>
                            </div>
                            <div className="bg-[#111111] border border-white/[0.05] text-slate-300 px-4 py-3 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed shadow-sm">
                                Hi! I was just charged twice for the Pro plan. The bot said I'd be transferred to an agent can you help?
                            </div>
                        </div>
                    </div>
                )}

                {/* Mock Sent Message */}
                <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
                    <div className="flex flex-col gap-1.5 min-w-0 items-end">
                        <div className="bg-[#111111] border border-white/[0.05] text-slate-300 px-4 py-3 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm text-left">
                            Hey {otherUser?.name.split(' ')[0] || "there"}, you're with {currentUser.name.split(' ')[0]} from support. Can you share the email on your account and the last 4 digits of the card (or the order ID)?
                        </div>
                    </div>
                </div>

            </div>

            {/* Input area placeholder */}
            <div className="h-24 bg-[#0A0A0A] pt-2 pb-6 px-6 shrink-0 relative mt-auto z-10">
                <div className="w-full h-12 bg-[#1A1A1A] rounded-xl border border-white/10 animate-pulse flex items-center px-4">
                    <span className="text-slate-600 outline-none text-sm w-full">Type a reply...</span>
                </div>
            </div>
        </div>
    );
}
