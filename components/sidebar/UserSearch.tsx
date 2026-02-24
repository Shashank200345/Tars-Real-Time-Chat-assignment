"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "../UserAvatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function UserSearch() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    const users = useQuery(api.users.listAll);
    const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);
    const [isCreating, setIsCreating] = useState<string | null>(null);

    const filteredUsers = users?.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const startChat = async (userId: string) => {
        setIsCreating(userId);
        try {
            const conversationId = await getOrCreateDM({ otherUserId: userId as any });
            setOpen(false);
            router.push(`/chats/${conversationId}`);
        } catch (error) {
            toast.error("Failed to create conversation");
        } finally {
            setIsCreating(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full shadow-sm bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-700 text-slate-100 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        New Contact
                    </DialogTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 focus-visible:border-indigo-500 h-10"
                            autoFocus
                        />
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[300px] h-[300px]">
                    {users === undefined ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                        </div>
                    ) : filteredUsers?.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No users found matching "{search}"
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredUsers?.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => startChat(user._id)}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={user.name} imageUrl={user.imageUrl} />
                                        <span className="font-medium text-slate-200">
                                            {user.name}
                                        </span>
                                    </div>
                                    {isCreating === user._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full h-8 px-3"
                                        >
                                            Message
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
