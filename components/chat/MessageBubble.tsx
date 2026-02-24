"use client";

import { Id } from "@/convex/_generated/dataModel";
import { UserAvatar } from "../UserAvatar";
import { formatMessageTime } from "@/utils/formatTime";
import { cn } from "@/lib/utils";

interface MessageProps {
    _id: Id<"messages">;
    content: string;
    senderId: Id<"users">;
    _creationTime: number;
    sender?: {
        _id: Id<"users">;
        name: string;
        imageUrl: string;
    };
}

export function MessageBubble({
    message,
    isMe
}: {
    message: MessageProps;
    isMe: boolean
}) {
    const time = new Date(message._creationTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={cn("flex gap-3 max-w-[85%]", isMe ? "self-end flex-row-reverse" : "self-start")}>
            {!isMe && message.sender && (
                <UserAvatar
                    name={message.sender.name}
                    imageUrl={message.sender.imageUrl}
                    className="h-8 w-8 mt-1 border border-white/10 rounded-full shrink-0"
                />
            )}

            <div className={cn("flex flex-col gap-1.5 min-w-0", isMe ? "items-end" : "items-start")}>
                {!isMe && message.sender && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">{message.sender.name}</span>
                        <span className="text-[10px] text-slate-500">{time}</span>
                    </div>
                )}

                <div
                    style={{ wordBreak: 'break-word' }}
                    className={cn(
                        "bg-[#111111] border border-white/[0.05] text-slate-300 px-4 py-3 text-[13px] leading-relaxed shadow-sm text-left max-w-full",
                        isMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
                    )}
                >
                    {message.content}
                </div>

                {isMe && (
                    <span className="text-[10px] text-slate-500 mt-0.5 pr-1">
                        {time}
                    </span>
                )}
            </div>
        </div>
    );
}
