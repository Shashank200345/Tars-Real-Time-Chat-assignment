"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserAvatar } from "../UserAvatar";
import { formatMessageTime } from "@/utils/formatTime";
import { cn } from "@/lib/utils";

interface ConvProps {
    _id: string;
    isGroup: boolean;
    participants: Array<{
        _id: string;
        name: string;
        imageUrl: string;
        isOnline: boolean;
        clerkId: string;
    }>;
    lastMessage: { content: string; senderId: string } | null;
    lastMessageTime?: number;
    unreadCount?: number;
}

export function ConversationItem({ conversation }: { conversation: ConvProps }) {
    const params = useParams();
    const isActive = params.id === conversation._id;

    const otherUser =
        conversation.participants.length === 2
            ? conversation.participants[1]
            : conversation.participants[0];

    if (!otherUser) return null;

    return (
        <Link
            href={`/chats/${conversation._id}`}
            className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer mb-0.5 group relative overflow-hidden",
                isActive
                    ? "bg-white/10 shadow-sm"
                    : "hover:bg-white/5 text-slate-300"
            )}
        >
            <div className="flex w-full items-center gap-3 relative z-10">
                <UserAvatar
                    name={otherUser.name}
                    imageUrl={otherUser.imageUrl}
                    isOnline={otherUser.isOnline}
                    className="h-8 w-8 text-xs shrink-0"
                />

                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <span
                            className={cn(
                                "font-medium text-sm truncate pr-2 tracking-tight",
                                isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                            )}
                        >
                            {otherUser.name}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <span
                            className={cn(
                                "text-[11px] truncate w-full",
                                isActive ? "text-slate-300" : "text-slate-500"
                            )}
                        >
                            {conversation.lastMessage?.content || "No messages yet"}
                        </span>

                        {/* Unread Badge */}
                        {conversation.unreadCount && conversation.unreadCount > 0 && !isActive ? (
                            <div className="shrink-0 bg-red-500 text-white text-[9px] font-bold h-[18px] min-w-[18px] px-1.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse">
                                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}
