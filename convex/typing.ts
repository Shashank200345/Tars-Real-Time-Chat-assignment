import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Set/update a typing indicator for the current user in a conversation
export const setTyping = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        // Check if indicator already exists for this user/conversation
        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), user._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { timestamp: Date.now() });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: user._id,
                timestamp: Date.now(),
            });
        }
    },
});

// Clear typing indicator when user stops typing or sends message
export const clearTyping = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), user._id))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

// Get active typers in a conversation (within last 3 seconds)
export const getTyping = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        const threeSecondsAgo = Date.now() - 3000;

        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Filter to active (within 3s) and not the current user
        const active = indicators.filter(
            (i) => i.timestamp > threeSecondsAgo && i.userId !== me?._id
        );

        // Enrich with user info
        return await Promise.all(
            active.map(async (i) => {
                const user = await ctx.db.get(i.userId);
                return { ...i, user };
            })
        );
    },
});
