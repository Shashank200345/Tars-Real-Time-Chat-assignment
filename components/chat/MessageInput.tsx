"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send, Smile } from "lucide-react";

export function MessageInput({ conversationId }: { conversationId: Id<"conversations"> }) {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.typing.setTyping);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = async () => {
        if (!content.trim() || isSending) return;

        const messageContent = content.trim();
        setContent("");
        setIsSending(true);

        try {
            await sendMessage({ conversationId, content: messageContent });
        } catch (error) {
            console.error("Failed to send message:", error);
            // We could add a toast here, but optimistic UI usually hides this 
            // unless it really fails, in which case we'd restore the text.
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);

        // Fire typing indicator
        setTyping({ conversationId });

        // Clear typing indicator after 2s of no typing
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            // typing indicator clears automatically on the backend via getTyping window,
            // but we could explicitly clear it if needed. 
            // Convex handles 3s expiring automatically!
        }, 2000);
    };

    return (
        <div className="h-24 bg-[#0A0A0A] pt-2 pb-6 px-6 shrink-0 relative mt-auto z-10">
            <div className="w-full flex items-center bg-[#1A1A1A] rounded-xl border border-white/10 px-2 shadow-sm focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all">
                <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                    <Smile className="w-5 h-5" />
                </button>

                <input
                    type="text"
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a reply..."
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
