"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, RadioTower } from "lucide-react";

export function BroadcastModal({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendBroadcast = useMutation(api.messages.sendBroadcast);

    // Just to show how many active conversations they have
    const conversations = useQuery(api.conversations.listForMe);
    const activeCount = conversations ? conversations.length : 0;

    const handleSend = async () => {
        if (!message.trim()) return;
        if (activeCount === 0) {
            toast.error("You don't have any active conversations to broadcast to.");
            return;
        }

        setIsSending(true);
        try {
            const count = await sendBroadcast({ content: message.trim() });
            toast.success(`Broadcast sent to ${count} conversations!`);
            setMessage("");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to send broadcast.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#111] border border-white/10 text-slate-100 shadow-2xl">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                        <RadioTower className="w-5 h-5 text-blue-500" />
                        Send Broadcast
                    </DialogTitle>
                    <p className="text-sm text-slate-400 mt-2">
                        This will send a single message to all <strong className="text-white">{activeCount}</strong> of your active conversations simultaneously.
                    </p>
                </DialogHeader>

                <div className="py-4">
                    <Textarea
                        placeholder="Type your announcement here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] bg-[#1A1A1A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 resize-none"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-300 hover:text-white hover:bg-white/5"
                        disabled={isSending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isSending || activeCount === 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Broadcasting...
                            </>
                        ) : (
                            "Send to All"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
