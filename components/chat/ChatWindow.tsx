"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { MessageInput } from "./MessageInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { GroupInfoDialog } from "./GroupInfoDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
    conversationId: Id<"conversations">;
}

interface ReplyContext {
    _id: Id<"messages">;
    content: string;
    senderName: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const currentUser = useQuery(api.users.getMe);
    const messages = useQuery(api.messages.list, { conversationId });
    const allConvs = useQuery(api.conversations.listForMe);
    const markRead = useMutation(api.messages.markRead);
    const forwardMessage = useMutation(api.messages.forward);

    const bottomRef = useRef<HTMLDivElement>(null);
    const [replyTo, setReplyTo] = useState<ReplyContext | null>(null);
    const [forwardingMsg, setForwardingMsg] = useState<{ _id: Id<"messages">; content: string } | null>(null);
    const [infoOpen, setInfoOpen] = useState(false);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Mark the latest message as read when this conversation is opened or new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            markRead({
                conversationId,
                messageId: lastMessage._id,
            }).catch(() => { });
        }
    }, [messages, conversationId, markRead]);

    if (messages === undefined || allConvs === undefined || currentUser === undefined) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const enrichedConv = allConvs.find(c => c._id === conversationId);

    if (!enrichedConv) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-muted-foreground bg-background text-sm">
                Conversation not found
            </div>
        );
    }

    const isGroup = enrichedConv.isGroup;
    const headerName = isGroup
        ? enrichedConv.groupName
        : (enrichedConv.participants.find(p => p?._id !== currentUser?._id)?.name || "Unknown User");

    const memberNames = isGroup
        ? enrichedConv.participants.map(p => p?.name || "Unknown").join(", ")
        : null;

    // Other conversations for forward picker
    const otherConvs = allConvs.filter(c => c._id !== conversationId);

    const handleForwardTo = async (targetId: Id<"conversations">) => {
        if (!forwardingMsg) return;
        try {
            await forwardMessage({
                messageId: forwardingMsg._id,
                targetConversationId: targetId,
            });
            toast.success("Message forwarded!");
        } catch {
            toast.error("Failed to forward message");
        }
        setForwardingMsg(null);
    };

    return (
        <div className="flex flex-col h-full absolute inset-0 bg-background font-sans">
            {/* Top Banner */}
            <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-500 w-full flex items-center px-6 shrink-0 relative overflow-hidden shadow-sm z-20">
                <div className="flex items-center gap-3 text-white z-10 w-full">
                    <CheckCircle2 className="w-[18px] h-[18px] text-blue-200 shrink-0" />
                    <div
                        className={cn("flex flex-col min-w-0 flex-1", isGroup && "cursor-pointer hover:opacity-80 transition-opacity")}
                        onClick={() => isGroup && setInfoOpen(true)}
                    >
                        <span className="font-semibold text-sm truncate">
                            {headerName}
                        </span>
                        {isGroup && memberNames && (
                            <span className="text-xs text-blue-100/90 truncate">
                                {memberNames}
                            </span>
                        )}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-2xl transform skew-x-12 translate-x-10 pointer-events-none" />
            </div>

            {/* Main message area */}
            <div className="flex-1 overflow-y-auto relative bg-background px-6 py-6 flex flex-col gap-6">

                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
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
                                onReply={(msg) => setReplyTo(msg)}
                                onForward={(msg) => setForwardingMsg(msg)}
                            />
                        );
                    })
                )}

                <div ref={bottomRef} className="h-1" />
            </div>

            {/* Typing indicator */}
            <TypingIndicator conversationId={conversationId} />

            {/* Input area with reply context */}
            <MessageInput
                conversationId={conversationId}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />

            {/* Forward dialog overlay */}
            {forwardingMsg && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-card border border-border rounded-2xl p-5 w-80 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground font-semibold text-sm">Forward to...</h3>
                            <button
                                onClick={() => setForwardingMsg(null)}
                                className="text-muted-foreground hover:text-foreground p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Message preview */}
                        <div className="bg-secondary/50 border border-border rounded-lg p-3 mb-4 text-xs text-muted-foreground truncate">
                            &ldquo;{forwardingMsg.content}&rdquo;
                        </div>

                        {/* Conversation list */}
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                            {otherConvs.length === 0 ? (
                                <p className="text-muted-foreground text-xs text-center py-4">No other conversations</p>
                            ) : (
                                otherConvs.map((conv) => {
                                    const other = conv.participants.find(
                                        (p) => p?._id !== currentUser?._id
                                    );
                                    return (
                                        <button
                                            key={conv._id}
                                            onClick={() => handleForwardTo(conv._id)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {(other?.name || "?")[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm text-foreground truncate">
                                                {conv.isGroup ? conv.groupName : other?.name || "Unknown"}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Group info dialog */}
            {isGroup && (
                <GroupInfoDialog
                    conversationId={conversationId}
                    open={infoOpen}
                    onOpenChange={setInfoOpen}
                />
            )}
        </div>
    );
}
