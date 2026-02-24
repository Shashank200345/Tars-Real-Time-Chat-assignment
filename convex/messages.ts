import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a new message
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
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

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            isDeleted: false,
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

        // Enrich with sender info
        const enriched = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return { ...msg, sender };
            })
        );

        return enriched;
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
