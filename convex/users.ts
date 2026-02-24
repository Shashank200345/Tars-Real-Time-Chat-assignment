import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Called by Clerk webhook to sync users into Convex DB
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: false,
            lastSeen: Date.now(),
        });
    },
});

// Get the current logged-in user's Convex record
export const getMe = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

// Auto-create user from Clerk identity if not in DB (call on app load)
export const ensureUser = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existing) return existing._id;

        // Auto-create from Clerk identity
        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name || identity.email || "Unknown",
            email: identity.email || "",
            imageUrl: identity.pictureUrl || "",
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

// Get a user by their Convex ID
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// List all users except the current user (for new DM search)
export const listAll = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const allUsers = await ctx.db.query("users").collect();
        return allUsers.filter((u) => u.clerkId !== identity.subject);
    },
});

// List all users (no auth, for debugging)
export const listAllRaw = query({
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// Remove duplicate users by name, keeping only the first entry per name
export const dedup = mutation({
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("users").collect();
        const seen = new Map<string, boolean>();
        let deletedCount = 0;

        for (const user of allUsers) {
            if (seen.has(user.name)) {
                // Duplicate name — delete it
                await ctx.db.delete(user._id);
                deletedCount++;
            } else {
                seen.set(user.name, true);
            }
        }

        return { deletedCount, remaining: allUsers.length - deletedCount };
    },
});

