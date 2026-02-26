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
import { Loader2, Users, Search, UserPlus, Shield, ShieldAlert, X, LogOut, CheckCircle2 } from "lucide-react";
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

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setIsAddingMode(false);
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-md bg-[#111] border border-white/10 text-slate-100 p-0 shadow-2xl overflow-hidden">
                <DialogHeader className="p-4 border-b border-white/5 bg-[#0B0B0B]">
                    <DialogTitle className="text-lg font-semibold flex items-center justify-between text-white pr-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            {conversation.groupName}
                        </div>
                        {isAdmin && !isAddingMode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddingMode(true)}
                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-8 px-2"
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
                                className="text-slate-400 hover:text-white hover:bg-white/10 h-8 px-2"
                            >
                                Back
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {!isAddingMode ? (
                    <>
                        <div className="p-4 bg-white/5 border-b border-white/5">
                            <p className="text-sm text-slate-400 mb-1">Group Details</p>
                            <p className="text-xs text-slate-500">{participants.length} members</p>
                        </div>
                        <ScrollArea className="max-h-[300px] bg-[#0A0A0A]">
                            <div className="p-2 space-y-1">
                                {participants.map((user) => {
                                    if (!user) return null;
                                    const isUserAdmin = conversation.adminIds?.includes(user._id);
                                    const isMe = user._id === currentUser._id;

                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group border border-transparent transition-all">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={user.name} imageUrl={user.imageUrl} className="h-9 w-9 border border-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-200 text-sm flex items-center gap-2">
                                                        {isMe ? "You" : user.name}
                                                        {isUserAdmin && (
                                                            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{user.email}</span>
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
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                        <div className="p-4 border-t border-white/5 bg-[#0B0B0B]">
                            <Button
                                variant="ghost"
                                className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
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
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search users to add..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-[#1A1A1A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <ScrollArea className="max-h-[300px] min-h-[200px] bg-[#0A0A0A]">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No users found...
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {filteredUsers.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent transition-all">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={user.name} imageUrl={user.imageUrl} className="h-9 w-9 border border-white/10" />
                                                <span className="font-medium text-slate-200 text-sm">
                                                    {user.name}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
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
