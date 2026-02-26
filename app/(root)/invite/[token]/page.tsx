"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const { isLoaded, isSignedIn } = useUser();

    const groupDetails = useQuery(api.conversations.getConversationByInvite, { inviteToken: token });
    const joinGroup = useMutation(api.conversations.joinByInvite);

    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        if (groupDetails?.isMember && isLoaded && isSignedIn) {
            router.push(`/chats/${groupDetails._id}`);
        }
    }, [groupDetails, isLoaded, isSignedIn, router]);

    const handleJoin = async () => {
        if (!isSignedIn) {
            toast.error("You must be signed in to join a group.");
            router.push("/sign-in");
            return;
        }

        setIsJoining(true);
        try {
            const conversationId = await joinGroup({ inviteToken: token });
            toast.success("Successfully joined the group!");
            router.push(`/chats/${conversationId}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to join group");
        } finally {
            setIsJoining(false);
        }
    };

    if (groupDetails === undefined) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (groupDetails === null) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground gap-4">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <Users className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Invalid Invite Link</h1>
                <p className="text-muted-foreground">This group invite link is invalid or has expired.</p>
                <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
                    Return Home
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <div className="max-w-md w-full mx-4 bg-card border border-border shadow-2xl rounded-2xl p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20">
                    <Users className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-3xl font-bold mb-2 break-words w-full">
                    {groupDetails.groupName}
                </h1>

                <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-1.5 rounded-full mb-8 border border-border">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">
                        {groupDetails.participantCount} members
                    </span>
                </div>

                <Button
                    onClick={handleJoin}
                    disabled={isJoining || groupDetails.isMember}
                    className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
                >
                    {isJoining ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Joining Group...
                        </>
                    ) : groupDetails.isMember ? (
                        "Already a Member"
                    ) : (
                        <>
                            Join Group
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>

                <p className="mt-6 text-sm text-muted-foreground w-full flex flex-col gap-1 items-center">
                    {!isSignedIn && (
                        <span className="text-destructive/80 font-medium">
                            You will be asked to sign in first.
                        </span>
                    )}
                    <span>
                        Anyone with this link can join the group.
                    </span>
                </p>
            </div>
        </div>
    );
}
