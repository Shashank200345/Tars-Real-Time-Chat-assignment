"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "../UserAvatar";
import { toast } from "sonner";
import { Loader2, Users, Search, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateGroupModal({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter();
    const users = useQuery(api.users.listAll);
    const currentUser = useQuery(api.users.getMe);
    const createGroup = useMutation(api.conversations.createGroup);

    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Filter out the current user from the list
    const availableUsers = users?.filter((u) => u._id !== currentUser?._id) ?? [];
    const filteredUsers = availableUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (selectedUserIds.length === 0) {
            toast.error("Please select at least one other user.");
            return;
        }
        if (!groupName.trim()) {
            toast.error("Please provide a group name.");
            return;
        }

        setIsCreating(true);
        try {
            const conversationId = await createGroup({
                groupName: groupName.trim(),
                participantIds: selectedUserIds as any[],
            });

            toast.success("Group created successfully!");
            setGroupName("");
            setSelectedUserIds([]);
            onOpenChange(false);
            router.push(`/chats/${conversationId}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to create group");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border border-border text-card-foreground p-0 shadow-2xl overflow-hidden">
                <DialogHeader className="p-4 border-b border-border bg-background">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Create Group Chat
                    </DialogTitle>

                    <div className="mt-4 space-y-3">
                        <Input
                            placeholder="Group Name (e.g. Engineering Team)"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                        />

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users to add..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[250px] h-[250px] bg-background">
                    {users === undefined ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No users found.
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user._id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                                            isSelected
                                                ? "bg-primary/10 border-primary/50"
                                                : "border-transparent hover:bg-accent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={user.name} imageUrl={user.imageUrl} className="h-9 w-9 border border-border" />
                                            <span className="font-medium text-foreground">
                                                {user.name}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-border bg-background flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        {selectedUserIds.length} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating || selectedUserIds.length === 0 || !groupName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
