"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { Loader2 } from "lucide-react";
// We'll build the message list and input next
// import { MessageList } from "./MessageList";
// import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
    conversationId: Id<"conversations">;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const conversation = useQuery(api.conversations.getById, { conversationId });
    const currentUser = useQuery(api.users.getMe);

    // We need the other user's info to show in the header
    // Let's figure out who the other participant is. 
    // We could just fetch the users by ID.
    // Actually, listForMe enriches participants. 
    // Let's do a quick separate query for the other user or assume the users query handles it.
    // For simplicity, let's fetch listForMe and find this conversation in it because it's already enriched and cached!
    const allConvs = useQuery(api.conversations.listForMe);
    const enrichedConv = allConvs?.find(c => c._id === conversationId);

    if (conversation === undefined || allConvs === undefined || currentUser === undefined) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    if (!conversation || !enrichedConv) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-slate-400">
                Conversation not found
            </div>
        );
    }

    const otherUser =
        enrichedConv.participants.length === 2
            ? enrichedConv.participants[1]
            : enrichedConv.participants[0];

    return (
        <div className="flex flex-col h-full absolute inset-0 bg-slate-900">
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                {/* Mobile Back Button */}
                <Link href="/chats" className="md:hidden">
                    <ArrowLeft className="h-6 w-6 text-slate-300 hover:text-white transition-colors" />
                </Link>

                {otherUser && (
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            name={otherUser.name}
                            imageUrl={otherUser.imageUrl}
                            isOnline={otherUser.isOnline}
                            className="h-10 w-10 ring-2 ring-slate-800"
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-slate-100 text-lg">{otherUser.name}</span>
                            {otherUser.isOnline ? (
                                <span className="text-xs font-medium text-emerald-400">Online</span>
                            ) : (
                                <span className="text-xs text-slate-400">Offline</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main message area (Placeholders for now, will build in Phase 4) */}
            <div className="flex-1 overflow-hidden relative bg-slate-900">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
                <div className="h-full flex items-center justify-center text-slate-500 rotate-[-10deg] opacity-20 text-4xl font-bold uppercase tracking-widest pointer-events-none select-none">
                    Messages Go Here
                </div>
            </div>

            {/* Input area placeholder */}
            <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center p-4">
                <div className="w-full h-12 bg-slate-800 rounded-full border border-slate-700 animate-pulse" />
            </div>
        </div>
    );
}
