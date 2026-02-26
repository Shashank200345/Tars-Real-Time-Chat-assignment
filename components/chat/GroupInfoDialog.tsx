"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { Loader2, Users, Search, UserPlus, Shield, ShieldAlert, X, LogOut, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GroupInfoDialogProps {
    conversationId: Id<"conversations">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GroupInfoDialog({ conversationId, open, onOpenChange }: GroupInfoDialogProps) {
    const router = useRouter();
    const currentUser = useQuery(api.users.getMe);
    const allUsers = useQuery(api.users.listAll);
    const conversation = useQuery(api.conversations.getById, { conversationId });

    // Check if the current conversation is listed in the user's conversations to get enriched participants
    const myConvs = useQuery(api.conversations.listForMe);
    const enrichedConv = myConvs?.find(c => c._id === conversationId);

    const addMember = useMutation(api.conversations.addGroupMember);
    const removeMember = useMutation(api.conversations.removeGroupMember);
    const makeAdmin = useMutation(api.conversations.makeAdmin);
    const removeAdmin = useMutation(api.conversations.removeAdmin);
    const leaveGroup = useMutation(api.conversations.leaveGroup);
    const generateInvite = useMutation(api.conversations.generateInvite);

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [search, setSearch] = useState("");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    if (!conversation || !enrichedConv || !currentUser || !allUsers) {
        return null;
    }

    const isAdmin = conversation.adminIds?.includes(currentUser._id);
    const participants = enrichedConv.participants;

    // For adding members: users not in the group
    const availableUsers = allUsers.filter(u => !conversation.participants.includes(u._id));
    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddMember = async (userId: Id<"users">) => {
        setIsProcessing(userId);
        try {
            await addMember({ conversationId, userId });
            toast.success("Member added");
            setSearch(""); // Reset search
        } catch (error: any) {
            toast.error(error.message || "Failed to add member");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRemoveMember = async (userId: Id<"users">) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        setIsProcessing(userId);
        try {
            await removeMember({ conversationId, userId });
            toast.success("Member removed");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove member");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleMakeAdmin = async (userId: Id<"users">) => {
        setIsProcessing(userId);
        try {
            await makeAdmin({ conversationId, userId });
            toast.success("Promoted to admin");
        } catch (error: any) {
            toast.error(error.message || "Failed to make admin");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRemoveAdmin = async (userId: Id<"users">) => {
        setIsProcessing(userId);
        try {
            await removeAdmin({ conversationId, userId });
            toast.success("Admin role removed");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove admin");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm("Are you sure you want to leave this group?")) return;
        setIsProcessing("leave");
        try {
            await leaveGroup({ conversationId });
            toast.success("You left the group");
            onOpenChange(false);
            router.push("/"); // Redirect to home
        } catch (error: any) {
            toast.error(error.message || "Failed to leave group");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleCopyInvite = async () => {
        setIsProcessing("invite");
        try {
            const token = await generateInvite({ conversationId });
            const inviteUrl = `${window.location.origin}/invite/${token}`;
            await navigator.clipboard.writeText(inviteUrl);
            toast.success("Invite link copied to clipboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to generate invite link");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setIsAddingMode(false);
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-md bg-card border border-border text-card-foreground p-0 shadow-2xl overflow-hidden">
                <DialogHeader className="p-4 border-b border-border bg-background">
                    <DialogTitle className="text-lg font-semibold flex items-center justify-between text-foreground pr-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            {conversation.groupName}
                        </div>
                        {isAdmin && !isAddingMode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddingMode(true)}
                                className="text-primary hover:text-primary/90 hover:bg-primary/10 h-8 px-2"
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Add
                            </Button>
                        )}
                        {isAddingMode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddingMode(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-2"
                            >
                                Back
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {!isAddingMode ? (
                    <>
                        <div className="p-4 bg-secondary/50 border-b border-border flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Group Details</p>
                                <p className="text-xs text-muted-foreground">{participants.length} members</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyInvite}
                                disabled={!!isProcessing}
                                className="h-8 gap-2 bg-background border-border"
                            >
                                {isProcessing === "invite" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                                Copy Link
                            </Button>
                        </div>
                        <ScrollArea className="max-h-[300px] bg-background">
                            <div className="p-2 space-y-1">
                                {participants.map((user) => {
                                    if (!user) return null;
                                    const isUserAdmin = conversation.adminIds?.includes(user._id);
                                    const isMe = user._id === currentUser._id;

                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent group border border-transparent transition-all">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={user.name} imageUrl={user.imageUrl} className="h-9 w-9 border border-border" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground text-sm flex items-center gap-2">
                                                        {isMe ? "You" : user.name}
                                                        {isUserAdmin && (
                                                            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>

                                            {/* Admin Controls */}
                                            {isAdmin && !isMe && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    {isUserAdmin ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                                            onClick={() => handleRemoveAdmin(user._id)}
                                                            disabled={!!isProcessing}
                                                            title="Dismiss Admin"
                                                        >
                                                            {isProcessing === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                                            onClick={() => handleMakeAdmin(user._id)}
                                                            disabled={!!isProcessing}
                                                            title="Make Admin"
                                                        >
                                                            {isProcessing === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                        onClick={() => handleRemoveMember(user._id)}
                                                        disabled={!!isProcessing}
                                                        title="Remove Member"
                                                    >
                                                        {isProcessing === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t border-border bg-background">
                            <Button
                                variant="ghost"
                                className="w-full text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex items-center justify-center gap-2"
                                onClick={handleLeaveGroup}
                                disabled={!!isProcessing}
                            >
                                {isProcessing === "leave" ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                Leave Group
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 border-b border-border">
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
                        <ScrollArea className="max-h-[300px] min-h-[200px] bg-background">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No users found...
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {filteredUsers.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent border border-transparent transition-all">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={user.name} imageUrl={user.imageUrl} className="h-9 w-9 border border-border" />
                                                <span className="font-medium text-foreground text-sm">
                                                    {user.name}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                                onClick={() => handleAddMember(user._id)}
                                                disabled={!!isProcessing}
                                            >
                                                {isProcessing === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
