"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ChatsLayoutShell } from "@/components/sidebar/ChatsLayoutShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactsPage() {
    const router = useRouter();
    const currentUser = useQuery(api.users.getMe);
    const allUsers = useQuery(api.users.listAll);
    const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingDM, setIsCreatingDM] = useState<string | null>(null);

    const isLoading = currentUser === undefined || allUsers === undefined;

    const filteredUsers = allUsers?.filter(
        (user) =>
            user._id !== currentUser?._id &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMessageContact = async (userId: string) => {
        setIsCreatingDM(userId);
        try {
            const conversationId = await getOrCreateDM({ otherUserId: userId as any });
            router.push(`/chats/${conversationId}`);
        } catch (error) {
            toast.error("Failed to start conversation");
            console.error(error);
        } finally {
            setIsCreatingDM(null);
        }
    };

    return (
        <ChatsLayoutShell>
            <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">All Contacts</h1>
                            <p className="text-xs text-muted-foreground font-medium">
                                {filteredUsers?.length || 0} users available
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary/50 border-border text-foreground h-12 rounded-xl text-base shadow-sm focus-visible:ring-primary/20"
                            />
                        </div>

                        {/* Contacts List */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredUsers && filteredUsers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4 hover:shadow-lg hover:border-primary/20 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <UserAvatar
                                                name={user.name}
                                                imageUrl={user.imageUrl}
                                                isOnline={user.isOnline}
                                                className="w-14 h-14 border border-border"
                                            />
                                            <div className="flex-1 min-w-0 pt-1">
                                                <h3 className="font-semibold text-foreground truncate text-lg tracking-tight">
                                                    {user.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate font-medium">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2">
                                            <Button
                                                onClick={() => handleMessageContact(user._id)}
                                                disabled={isCreatingDM === user._id}
                                                className="w-full bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground border border-border hover:border-transparent gap-2 h-10 transition-all font-medium"
                                            >
                                                {isCreatingDM === user._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <MessageSquare className="w-4 h-4" />
                                                )}
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No contacts found</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {searchQuery
                                        ? "We couldn't find anyone matching your search. Try a different name."
                                        : "There are no other users registered in the system yet."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ChatsLayoutShell>
    );
}
