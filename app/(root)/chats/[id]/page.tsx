"use client";

import { use } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="h-full w-full relative">
            <ChatWindow conversationId={id as Id<"conversations">} />
        </div>
    );
}
