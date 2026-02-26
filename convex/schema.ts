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
        inviteToken: v.optional(v.string()), // For group invite links
        lastMessageId: v.optional(v.id("messages")),
        lastMessageTime: v.optional(v.number()),
    })
        .index("by_last_message_time", ["lastMessageTime"])
        .index("by_invite_token", ["inviteToken"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        isDeleted: v.boolean(), // soft delete
        replyToId: v.optional(v.id("messages")), // reply to another message
        forwardedFrom: v.optional(v.string()), // original sender name if forwarded
        fileId: v.optional(v.id("_storage")), // Convex file storage ID
        fileName: v.optional(v.string()), // original file name
        fileType: v.optional(v.string()), // MIME type (image/png, application/pdf, etc.)
        isPinned: v.optional(v.boolean()), // pinned messages
        editedAt: v.optional(v.number()), // timestamp when message was edited
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
