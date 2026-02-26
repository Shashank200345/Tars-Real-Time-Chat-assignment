import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

// Create a new group conversation
export const createGroup = mutation({
    args: {
        participantIds: v.array(v.id("users")),
        groupName: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        // Ensure current user is in the group and remove duplicates
        const participantsSet = new Set([...args.participantIds, me._id]);

        if (participantsSet.size < 2) {
            throw new Error("Group must have at least 2 members");
        }

        const participants = Array.from(participantsSet);

        // Create new Group chat
        return await ctx.db.insert("conversations", {
            participants,
            isGroup: true,
            groupName: args.groupName,
            adminIds: [me._id], // The creator is automatically an admin
            lastMessageTime: Date.now(),
        });
    },
});

// Helper validation function
const validateAdmin = async (ctx: any, conversationId: Id<"conversations">) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const me = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
        .unique();

    if (!me) throw new Error("User not found");

    const conv = await ctx.db.get(conversationId);
    if (!conv || !conv.isGroup) throw new Error("Group conversation not found");

    if (!conv.adminIds?.includes(me._id)) {
        throw new Error("You are not an admin of this group");
    }

    return { me, conv };
};

// Add member to group
export const addGroupMember = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { conv } = await validateAdmin(ctx, args.conversationId);

        if (conv.participants.includes(args.userId)) {
            throw new Error("User is already a member");
        }

        await ctx.db.patch(args.conversationId, {
            participants: [...conv.participants, args.userId],
        });
    },
});

// Remove member from group
export const removeGroupMember = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { me, conv } = await validateAdmin(ctx, args.conversationId);

        if (args.userId === me._id) {
            throw new Error("Use leaveGroup instead of removing yourself");
        }

        const newParticipants = conv.participants.filter((id: Id<"users">) => id !== args.userId);
        const newAdmins = (conv.adminIds || []).filter((id: Id<"users">) => id !== args.userId);

        if (newParticipants.length < 2) {
            throw new Error("Group must have at least 2 members");
        }

        await ctx.db.patch(args.conversationId, {
            participants: newParticipants,
            adminIds: newAdmins,
        });
    },
});

// Promote member to admin
export const makeAdmin = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { conv } = await validateAdmin(ctx, args.conversationId);

        if (!conv.participants.includes(args.userId)) {
            throw new Error("User must be a member to be an admin");
        }

        const admins = conv.adminIds || [];
        if (admins.includes(args.userId)) return; // Already admin

        await ctx.db.patch(args.conversationId, {
            adminIds: [...admins, args.userId],
        });
    },
});

// Demote admin to member
export const removeAdmin = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { conv, me } = await validateAdmin(ctx, args.conversationId);

        const admins = conv.adminIds || [];
        if (!admins.includes(args.userId)) return; // Not an admin

        if (admins.length === 1 && admins[0] === args.userId) {
            throw new Error("Group must have at least one admin. Promote someone else first.");
        }

        await ctx.db.patch(args.conversationId, {
            adminIds: admins.filter((id: Id<"users">) => id !== args.userId),
        });
    },
});

// Leave group (any member can do this)
export const leaveGroup = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) throw new Error("Group conversation not found");

        if (!conv.participants.includes(me._id)) return; // Already left

        const newParticipants = conv.participants.filter((id: Id<"users">) => id !== me._id);

        // If they are the last member, we could theoretically delete the group.
        // For now, let's just make it empty or let them leave.
        if (newParticipants.length === 0) {
            await ctx.db.patch(args.conversationId, {
                participants: [],
                adminIds: [],
            });
            return;
        }

        let newAdmins = (conv.adminIds || []).filter((id: Id<"users">) => id !== me._id);

        // If the last admin left but there are still members, assign random admin
        if (newAdmins.length === 0) {
            newAdmins = [newParticipants[0]];
        }

        await ctx.db.patch(args.conversationId, {
            participants: newParticipants,
            adminIds: newAdmins,
        });
    },
});

// Generate an invite link for a group
export const generateInvite = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) throw new Error("Group conversation not found");

        if (!conv.participants.includes(me._id)) {
            throw new Error("You must be a member to generate an invite link");
        }

        if (conv.inviteToken) {
            return conv.inviteToken;
        }

        // Generate a random token
        const inviteToken = crypto.randomUUID().replace(/-/g, "");

        await ctx.db.patch(args.conversationId, { inviteToken });

        return inviteToken;
    },
});

// Get basic conversation details via an invite link (publicly accessible)
export const getConversationByInvite = query({
    args: { inviteToken: v.string() },
    handler: async (ctx, args) => {
        const conv = await ctx.db
            .query("conversations")
            .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.inviteToken))
            .unique();

        if (!conv) {
            throw new Error("Invalid or expired invite link");
        }

        let isMember = false;

        // Check if user is logged in to see if they are a member
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            const me = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();
            if (me && conv.participants.includes(me._id)) {
                isMember = true;
            }
        }

        return {
            _id: conv._id,
            groupName: conv.groupName || "Group Chat",
            participantCount: conv.participants.length,
            isGroup: conv.isGroup,
            isMember
        };
    },
});

// Join a group via an invite token
export const joinByInvite = mutation({
    args: { inviteToken: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        const conv = await ctx.db
            .query("conversations")
            .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.inviteToken))
            .unique();

        if (!conv) {
            throw new Error("Invalid or expired invite link");
        }

        if (!conv.isGroup) {
            throw new Error("Invite link must be for a group");
        }

        if (conv.participants.includes(me._id)) {
            return conv._id; // Already a member
        }

        const newParticipants = [...conv.participants, me._id];
        await ctx.db.patch(conv._id, { participants: newParticipants });

        return conv._id;
    },
});
