"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserAvatar } from "../UserAvatar";

export function TypingIndicator({ conversationId }: { conversationId: Id<"conversations"> }) {
    const typers = useQuery(api.typing.getTyping, { conversationId });

    if (!typers || typers.length === 0) return null;

    const names = typers
        .map((t) => t.user?.name || "Someone")
        .join(", ");

    return (
        <div className="flex items-center gap-2 px-6 py-2 animate-fade-in">
            <div className="flex -space-x-2">
                {typers.slice(0, 3).map((t, i) => (
                    <UserAvatar
                        key={i}
                        name={t.user?.name || "?"}
                        imageUrl={t.user?.imageUrl || ""}
                        className="h-5 w-5 border border-[#0A0A0A] rounded-full"
                    />
                ))}
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">
                    {names} {typers.length === 1 ? "is" : "are"} typing
                </span>
                <div className="flex gap-0.5">
                    <span className="typing-dot w-1 h-1 bg-slate-500 rounded-full" style={{ animationDelay: "0ms" }} />
                    <span className="typing-dot w-1 h-1 bg-slate-500 rounded-full" style={{ animationDelay: "150ms" }} />
                    <span className="typing-dot w-1 h-1 bg-slate-500 rounded-full" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}
