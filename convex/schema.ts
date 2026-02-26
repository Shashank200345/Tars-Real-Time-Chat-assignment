import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(), // timestamp
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"]),

    conversations: defineTable({
        participants: v.array(v.id("users")), // works for both DM and group
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        adminIds: v.optional(v.array(v.id("users"))), // Array of group admins
        lastMessageId: v.optional(v.id("messages")),
        lastMessageTime: v.optional(v.number()),
    }).index("by_last_message_time", ["lastMessageTime"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        isDeleted: v.boolean(), // soft delete
        replyToId: v.optional(v.id("messages")), // reply to another message
        forwardedFrom: v.optional(v.string()), // original sender name if forwarded
        reactions: v.optional(
            v.array(
                v.object({
                    emoji: v.string(),
                    userId: v.id("users"),
                })
            )
        ),
    }).index("by_conversation", ["conversationId"]),

    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        timestamp: v.number(), // for 2-sec expiry logic
    }).index("by_conversation", ["conversationId"]),

    readReceipts: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadMessageId: v.id("messages"),
    }).index("by_conversation_user", ["conversationId", "userId"]),
});
