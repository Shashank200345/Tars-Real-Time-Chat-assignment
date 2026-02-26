"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserAvatar } from "../UserAvatar";
import { formatMessageTime } from "@/utils/formatTime";
import { getAnimatedEmojiUrl, splitEmojis } from "@/utils/animatedEmoji";
import { cn } from "@/lib/utils";
import { Trash2, Reply, Forward, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🎉", "🔥"];

interface ReplyTo {
    _id: string;
    content: string;
    senderName: string;
}

interface MessageProps {
    _id: Id<"messages">;
    content: string;
    senderId: Id<"users">;
    _creationTime: number;
    isDeleted?: boolean;
    forwardedFrom?: string;
    replyTo?: ReplyTo | null;
    reactions?: { emoji: string; userId: Id<"users"> }[];
    sender?: {
        _id: Id<"users">;
        name: string;
        imageUrl: string;
    };
}

export function MessageBubble({
    message,
    isMe,
    onReply,
    onForward,
}: {
    message: MessageProps;
    isMe: boolean;
    onReply?: (msg: { _id: Id<"messages">; content: string; senderName: string }) => void;
    onForward?: (msg: { _id: Id<"messages">; content: string }) => void;
}) {
    const [showActions, setShowActions] = useState(false);
    const [copied, setCopied] = useState(false);
    const addReaction = useMutation(api.messages.addReaction);
    const softDelete = useMutation(api.messages.softDelete);

    const time = formatMessageTime(message._creationTime);

    // Detect if message is only emojis (1-3 emojis, no other text)
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}){1,3}$/u;
    const isEmojiOnly = emojiRegex.test(message.content.trim());
    const emojiList = isEmojiOnly ? splitEmojis(message.content.trim()) : [];

    // Group reactions by emoji
    const reactionCounts = (message.reactions || []).reduce(
        (acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReply = () => {
        onReply?.({
            _id: message._id,
            content: message.content,
            senderName: message.sender?.name || (isMe ? "You" : "Unknown"),
        });
    };

    const handleForward = () => {
        onForward?.({
            _id: message._id,
            content: message.content,
        });
    };

    if (message.isDeleted) {
        return (
            <div className={cn("flex gap-3 max-w-[85%]", isMe ? "self-end" : "self-start")}>
                <div className="bg-card border border-border text-muted-foreground italic px-4 py-3 text-[13px] rounded-2xl">
                    🗑️ This message was deleted
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn("flex gap-3 max-w-[85%] group", isMe ? "self-end flex-row-reverse" : "self-start")}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {!isMe && message.sender && (
                <UserAvatar
                    name={message.sender.name}
                    imageUrl={message.sender.imageUrl}
                    className="h-8 w-8 mt-1 border border-border rounded-full shrink-0"
                />
            )}

            <div className={cn("flex flex-col gap-1 min-w-0 relative", isMe ? "items-end" : "items-start")}>
                {!isMe && message.sender && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{message.sender.name}</span>
                        <span className="text-[10px] text-muted-foreground">{time}</span>
                    </div>
                )}

                {/* Forwarded label */}
                {message.forwardedFrom && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic">
                        <Forward className="w-3 h-3" />
                        <span>Forwarded from {message.forwardedFrom}</span>
                    </div>
                )}

                <div className="relative">
                    {/* Reply preview (quoted message) */}
                    {message.replyTo && (
                        <div className={cn(
                            "mb-1 px-3 py-1.5 border-l-2 border-primary bg-secondary/50 rounded-r-lg text-[11px] max-w-[250px]",
                            isMe ? "ml-auto" : ""
                        )}>
                            <span className="text-primary font-medium">{message.replyTo.senderName}</span>
                            <p className="text-muted-foreground truncate">{message.replyTo.content}</p>
                        </div>
                    )}

                    {isEmojiOnly ? (
                        /* Animated emoji GIFs from Google Noto */
                        <div className={cn(
                            "flex gap-1 emoji-pop py-1",
                            isMe ? "justify-end" : "justify-start"
                        )}>
                            {emojiList.map((emoji, i) => (
                                <img
                                    key={i}
                                    src={getAnimatedEmojiUrl(emoji)}
                                    alt={emoji}
                                    className="w-16 h-16 object-contain drop-shadow-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const fallback = document.createElement("span");
                                        fallback.textContent = emoji;
                                        fallback.className = "text-5xl";
                                        target.parentElement?.appendChild(fallback);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Normal text message bubble */
                        <div
                            style={{ wordBreak: "break-word" }}
                            className={cn(
                                "px-4 py-3 text-[13px] leading-relaxed shadow-sm text-left max-w-full",
                                isMe
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                    : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
                            )}
                        >
                            {message.content}
                        </div>
                    )}

                    {/* Hover action bar */}
                    {showActions && (
                        <div
                            className={cn(
                                "absolute -top-9 flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5 shadow-xl z-30 animate-fade-in",
                                isMe ? "right-0" : "left-0"
                            )}
                        >
                            {QUICK_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => addReaction({ messageId: message._id, emoji })}
                                    className="hover:bg-accent rounded p-1 text-sm transition-colors"
                                    title={`React with ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                            <div className="w-px h-5 bg-border mx-0.5" />
                            <button
                                onClick={handleReply}
                                className="hover:bg-accent text-muted-foreground hover:text-primary rounded p-1.5 transition-colors"
                                title="Reply"
                            >
                                <Reply className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleForward}
                                className="hover:bg-accent text-muted-foreground hover:text-green-500 rounded p-1.5 transition-colors"
                                title="Forward"
                            >
                                <Forward className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="hover:bg-accent text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                                title="Copy text"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {isMe && (
                                <button
                                    onClick={() => softDelete({ messageId: message._id })}
                                    className="hover:bg-destructive/20 text-destructive rounded p-1.5 transition-colors"
                                    title="Delete message"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Reaction display */}
                {Object.keys(reactionCounts).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => addReaction({ messageId: message._id, emoji })}
                                className="flex items-center gap-1 bg-secondary/50 hover:bg-secondary border border-border rounded-full px-2 py-0.5 text-xs transition-colors"
                            >
                                <span>{emoji}</span>
                                <span className="text-muted-foreground">{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {isMe && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 pr-1">
                        {time}
                    </span>
                )}
            </div>
        </div>
    );
}
