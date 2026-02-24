"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserSearch } from "./UserSearch";
import { ConversationItem } from "./ConversationItem";
import { UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export function Sidebar() {
    const conversations = useQuery(api.conversations.listForMe);
    const currentUser = useQuery(api.users.getMe);

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: { userButtonAvatarBox: "w-8 h-8 rounded-full" },
                        }}
                    />
                    <span className="font-semibold text-slate-200">
                        {currentUser?.name || "Chats"}
                    </span>
                </div>
                <UserSearch />
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1 w-full bg-slate-900/50">
                <div className="p-3">
                    {conversations === undefined ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-10 px-4 text-slate-500 text-sm">
                            No conversations yet. <br /> Click the + icon to start chatting!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {conversations.map((conv) => (
                                <ConversationItem key={conv._id} conversation={conv as any} />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
