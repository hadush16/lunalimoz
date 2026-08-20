import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("notifications")
      .order("desc")
      .take(limit);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_isRead", (q) => q.eq("isRead", false))
      .take(100);
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_isRead", (q) => q.eq("isRead", false))
      .take(100);
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const create = internalMutation({
  args: {
    type: v.union(
      v.literal("new_booking"),
      v.literal("status_update"),
      v.literal("cancellation"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
