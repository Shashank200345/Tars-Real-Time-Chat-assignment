"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send, Smile, X, Reply } from "lucide-react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface ReplyContext {
    _id: Id<"messages">;
    content: string;
    senderName: string;
}

export function MessageInput({
    conversationId,
    replyTo,
    onCancelReply,
}: {
    conversationId: Id<"conversations">;
    replyTo?: ReplyContext | null;
    onCancelReply?: () => void;
}) {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.typing.setTyping);
    const clearTyping = useMutation(api.typing.clearTyping);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when replying
    useEffect(() => {
        if (replyTo) {
            inputRef.current?.focus();
        }
    }, [replyTo]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSend = async () => {
        if (!content.trim() || isSending) return;

        const messageContent = content.trim();
        setContent("");
        setIsSending(true);
        setShowEmojiPicker(false);

        clearTyping({ conversationId }).catch(() => { });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            await sendMessage({
                conversationId,
                content: messageContent,
                ...(replyTo ? { replyToId: replyTo._id } : {}),
            });
            onCancelReply?.(); // Clear reply context after sending
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === "Escape") {
            if (replyTo) {
                onCancelReply?.();
            } else {
                setShowEmojiPicker(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setContent(value);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (!value.trim()) {
            clearTyping({ conversationId }).catch(() => { });
            return;
        }

        setTyping({ conversationId });

        typingTimeoutRef.current = setTimeout(() => {
            clearTyping({ conversationId }).catch(() => { });
        }, 2000);
    };

    const onEmojiClick = (emojiData: { emoji: string }) => {
        setContent((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    return (
        <div className="bg-[#0A0A0A] pt-2 pb-6 px-6 shrink-0 relative mt-auto z-10">
            {/* Reply context bar */}
            {replyTo && (
                <div className="flex items-center gap-3 mb-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 animate-fade-in">
                    <Reply className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0 border-l-2 border-blue-500 pl-3">
                        <span className="text-xs font-medium text-blue-400">{replyTo.senderName}</span>
                        <p className="text-xs text-slate-400 truncate">{replyTo.content}</p>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-slate-400 hover:text-white p-1 shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-24 left-6 z-50 animate-fade-in"
                >
                    <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width={350}
                        height={400}
                        theme={"dark" as any}
                        searchPlaceholder="Search emojis..."
                        skinTonesDisabled
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis
                    />
                </div>
            )}

            <div className="w-full flex items-center bg-[#1A1A1A] rounded-xl border border-white/10 px-2 shadow-sm focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all">
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 transition-colors ${showEmojiPicker ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                    title="Open emoji picker"
                >
                    <Smile className="w-5 h-5" />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={replyTo ? `Reply to ${replyTo.senderName}...` : "Type a reply..."}
                    className="flex-1 bg-transparent border-none text-slate-200 text-sm h-12 px-2 outline-none placeholder:text-slate-600"
                    autoFocus
                />

                <button
                    onClick={handleSend}
                    disabled={!content.trim() || isSending}
                    className="p-2 m-1 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
