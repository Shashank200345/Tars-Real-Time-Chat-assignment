import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Set the current user online
export const setOnline = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { isOnline: true, lastSeen: Date.now() });
        }
    },
});

// Set the current user offline
export const setOffline = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { isOnline: false, lastSeen: Date.now() });
        }
    },
});
