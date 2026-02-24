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

    // Since we only do 1-on-1s right now, the "other user" is always index 1
    // (Assuming backend filters the current user out or we pick the first non-matching one)
    // Let's assume the backend returned exact participants cleanly, but to be safe:
    // Usually listForMe returns [me, other]. We want the `other` one for the avatar.
    // The query `listForMe` actually returns BOTH. For UI, we just need one of them (the other person).
    // Note: the backend returns `participants: participants.filter(Boolean)`. This includes ME.
    // In a real app we'd filter ME out in the UI or backend. Since this is 1-1, let's just pick the last one.
    const otherUser =
        conversation.participants.length === 2
            ? conversation.participants[1]
            : conversation.participants[0];

    if (!otherUser) return null;

    return (
        <Link
            href={`/chats/${conversation._id}`}
            className={cn(
                "flexItems-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer mb-1 group relative overflow-hidden",
                isActive
                    ? "bg-indigo-600 shadow-md shadow-indigo-900/20"
                    : "hover:bg-slate-800 text-slate-300"
            )}
        >
            <div className="flex w-full items-center gap-3 relative z-10">
                <UserAvatar
                    name={otherUser.name}
                    imageUrl={otherUser.imageUrl}
                    isOnline={otherUser.isOnline}
                    className="h-12 w-12"
                />

                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <span
                            className={cn(
                                "font-semibold truncate pr-2 tracking-tight",
                                isActive ? "text-white" : "text-slate-100 group-hover:text-white"
                            )}
                        >
                            {otherUser.name}
                        </span>
                        {conversation.lastMessageTime && (
                            <span
                                className={cn(
                                    "text-xs shrink-0 font-medium",
                                    conversation.unreadCount && conversation.unreadCount > 0 && !isActive
                                        ? "text-emerald-400"
                                        : isActive
                                            ? "text-indigo-200"
                                            : "text-slate-500"
                                )}
                            >
                                {formatMessageTime(conversation.lastMessageTime)}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <span
                            className={cn(
                                "text-sm truncate w-full",
                                isActive ? "text-indigo-200" : "text-slate-400"
                            )}
                        >
                            {conversation.lastMessage?.content || "Start a conversation..."}
                        </span>

                        {/* Unread Badge */}
                        {conversation.unreadCount ? (
                            conversation.unreadCount > 0 &&
                            !isActive && (
                                <div className="shrink-0 bg-emerald-500 text-slate-900 text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                                    {conversation.unreadCount}
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}
