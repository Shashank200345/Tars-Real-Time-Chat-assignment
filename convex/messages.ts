import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a new message
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        replyToId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            isDeleted: false,
            ...(args.replyToId ? { replyToId: args.replyToId } : {}),
        });

        // Update conversation's last message for sidebar preview
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            lastMessageTime: Date.now(),
        });

        // Update read receipt for the sender immediately
        const existing = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadMessageId: messageId });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: user._id,
                lastReadMessageId: messageId,
            });
        }

        return messageId;
    },
});

// List all messages in a conversation (with sender info)
export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich with sender info and reply data
        const enriched = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);

                // Enrich reply-to message if present
                let replyTo = null;
                if (msg.replyToId) {
                    const replyMsg = await ctx.db.get(msg.replyToId);
                    if (replyMsg) {
                        const replySender = await ctx.db.get(replyMsg.senderId);
                        replyTo = {
                            _id: replyMsg._id,
                            content: replyMsg.isDeleted ? "This message was deleted" : replyMsg.content,
                            senderName: replySender?.name || "Unknown",
                        };
                    }
                }

                return { ...msg, sender, replyTo };
            })
        );

        return enriched;
    },
});

// Forward a message to another conversation
export const forward = mutation({
    args: {
        messageId: v.id("messages"),
        targetConversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const originalMsg = await ctx.db.get(args.messageId);
        if (!originalMsg) throw new Error("Message not found");

        const originalSender = await ctx.db.get(originalMsg.senderId);

        const newMsgId = await ctx.db.insert("messages", {
            conversationId: args.targetConversationId,
            senderId: user._id,
            content: originalMsg.content,
            isDeleted: false,
            forwardedFrom: originalSender?.name || "Unknown",
        });

        await ctx.db.patch(args.targetConversationId, {
            lastMessageId: newMsgId,
            lastMessageTime: Date.now(),
        });

        return newMsgId;
    },
});

// Soft delete a message
export const softDelete = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (message.senderId !== user?._id) throw new Error("Not your message");

        await ctx.db.patch(args.messageId, { isDeleted: true, content: "" });
    },
});

// Add or toggle an emoji reaction
export const addReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions ?? [];
        const existingIndex = reactions.findIndex(
            (r) => r.emoji === args.emoji && r.userId === user._id
        );

        let updatedReactions;
        if (existingIndex >= 0) {
            // Toggle off
            updatedReactions = reactions.filter((_, i) => i !== existingIndex);
        } else {
            // Add reaction
            updatedReactions = [...reactions, { emoji: args.emoji, userId: user._id }];
        }

        await ctx.db.patch(args.messageId, { reactions: updatedReactions });
    },
});

// Mark conversation as read (update read receipt)
export const markRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const existing = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadMessageId: args.messageId });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: user._id,
                lastReadMessageId: args.messageId,
            });
        }
    },
});

// Get the read receipt for another user in a DM (for "Seen" indicator)
export const getReadReceipt = query({
    args: {
        conversationId: v.id("conversations"),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.otherUserId)
            )
            .unique();
    },
});

// Broadcast a message to all active conversations
export const sendBroadcast = mutation({
    args: {
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Find all conversations where the user is a participant
        const allConversations = await ctx.db.query("conversations").collect();
        const myConversations = allConversations.filter((c) =>
            c.participants.includes(user._id)
        );

        if (myConversations.length === 0) {
            throw new Error("No conversations to broadcast to");
        }

        const now = Date.now();

        // Send the message to all of them
        const messagePromises = myConversations.map(async (conv) => {
            const messageId = await ctx.db.insert("messages", {
                conversationId: conv._id,
                senderId: user._id,
                content: args.content,
                isDeleted: false,
            });

            // Update conversation last message info
            await ctx.db.patch(conv._id, {
                lastMessageId: messageId,
                lastMessageTime: now,
            });

            // Update read receipt for sender
            const existingReceipt = await ctx.db
                .query("readReceipts")
                .withIndex("by_conversation_user", (q) =>
                    q.eq("conversationId", conv._id).eq("userId", user._id)
                )
                .unique();

            if (existingReceipt) {
                await ctx.db.patch(existingReceipt._id, { lastReadMessageId: messageId });
            } else {
                await ctx.db.insert("readReceipts", {
                    conversationId: conv._id,
                    userId: user._id,
                    lastReadMessageId: messageId,
                });
            }

            return messageId;
        });

        await Promise.all(messagePromises);
        return myConversations.length; // return count of conversations reached
    },
});
