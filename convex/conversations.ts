import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create a 1-on-1 DM conversation between current user and another user
export const getOrCreateDM = mutation({
    args: { otherUserId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        // Check if DM already exists
        const allConversations = await ctx.db.query("conversations").collect();
        const existing = allConversations.find(
            (c) =>
                !c.isGroup &&
                c.participants.includes(me._id) &&
                c.participants.includes(args.otherUserId)
        );

        if (existing) return existing._id;

        // Create new DM
        return await ctx.db.insert("conversations", {
            participants: [me._id, args.otherUserId],
            isGroup: false,
            lastMessageTime: Date.now(),
        });
    },
});

// List all conversations for the current user, sorted by last message time
export const listForMe = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) return [];

        const allConversations = await ctx.db
            .query("conversations")
            .order("desc")
            .collect();

        const myConversations = allConversations.filter((c) =>
            c.participants.includes(me._id)
        );

        // Enrich each conversation with participant info and last message
        const enriched = await Promise.all(
            myConversations.map(async (conv) => {
                const participants = await Promise.all(
                    conv.participants.map((id) => ctx.db.get(id))
                );

                const lastMessage = conv.lastMessageId
                    ? await ctx.db.get(conv.lastMessageId)
                    : null;

                // Unread count: messages after lastReadMessageId
                const readReceipt = await ctx.db
                    .query("readReceipts")
                    .withIndex("by_conversation_user", (q) =>
                        q.eq("conversationId", conv._id).eq("userId", me._id)
                    )
                    .unique();

                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();

                let unreadCount = 0;
                if (readReceipt) {
                    const lastReadMsg = await ctx.db.get(readReceipt.lastReadMessageId);
                    if (lastReadMsg) {
                        unreadCount = allMessages.filter(
                            (m) =>
                                m._creationTime > lastReadMsg._creationTime &&
                                m.senderId !== me._id
                        ).length;
                    }
                } else {
                    // Never read — all messages from others are unread
                    unreadCount = allMessages.filter((m) => m.senderId !== me._id).length;
                }

                return {
                    ...conv,
                    participants: participants.filter(Boolean),
                    lastMessage,
                    unreadCount,
                };
            })
        );

        return enriched;
    },
});

// Get a single conversation by ID
export const getById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});
