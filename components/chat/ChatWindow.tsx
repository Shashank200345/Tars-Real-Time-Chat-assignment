"use client";

import { useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Loader2 } from "lucide-react";
import { MessageInput } from "./MessageInput";
import { MessageBubble } from "./MessageBubble";
import { UserAvatar } from "../UserAvatar"; // Keep this if we want it later

interface ChatWindowProps {
    conversationId: Id<"conversations">;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const currentUser = useQuery(api.users.getMe);
    const messages = useQuery(api.messages.list, { conversationId });
    const allConvs = useQuery(api.conversations.listForMe);

    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (messages === undefined || allConvs === undefined || currentUser === undefined) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
        );
    }

    const enrichedConv = allConvs.find(c => c._id === conversationId);

    if (!enrichedConv) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 bg-[#0A0A0A] text-sm">
                Conversation not found
            </div>
        );
    }

    // Determine if it's a group chat to adjust header
    const isGroup = enrichedConv.isGroup;
    const headerName = isGroup
        ? enrichedConv.groupName
        : (enrichedConv.participants.find(p => p?._id !== currentUser?._id)?.name || "Unknown User");

    return (
        <div className="flex flex-col h-full absolute inset-0 bg-[#0A0A0A] font-sans">
            {/* 
        Top Banner - Copied from screenshot.
        A vibrant blue gradient promoting a free trial.
      */}
            <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-500 w-full flex items-center px-6 shrink-0 relative overflow-hidden shadow-sm z-20">
                <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-[18px] h-[18px] text-blue-200" />
                    <span className="font-semibold text-sm">
                        {isGroup ? `Group Chat: ${headerName}` : `Chatting with: ${headerName}`}
                    </span>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-2xl transform skew-x-12 translate-x-10" />
            </div>

            {/* Main message area */}
            <div className="flex-1 overflow-y-auto relative bg-[#0A0A0A] px-6 py-6 flex flex-col gap-6">

                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMe = message.senderId === currentUser?._id;
                        return (
                            <MessageBubble
                                key={message._id}
                                message={message as any}
                                isMe={isMe}
                            />
                        );
                    })
                )}

                <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input area */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
