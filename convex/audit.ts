import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    adminEmail: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const logInternal = internalMutation({
  args: {
    adminEmail: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    entity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    if (args.entity) {
      return logs.filter((l) => l.entity === args.entity);
    }
    return logs;
  },
});
