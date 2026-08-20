import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(500);
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    return users[0];
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = {
      name: args.name,
      email: args.email,
      phone: args.phone,
      createdAt: now,
      updatedAt: now,
    };
    return await ctx.db.insert("users", user);
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.phone && { phone: args.phone }),
      updatedAt: Date.now(),
    });
  },
});

export const updatePushIdByEmail = mutation({
  args: { pushId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    const isAdmin = args.email === "admin@lunalimoz.com";

    if (user) {
      await ctx.db.patch(user._id, {
        pushAlertSubscriberId: args.pushId,
        isAdmin: user.isAdmin || isAdmin, // Keep existing admin status or promote if default admin
        updatedAt: Date.now(),
      });
    } else {
      // Create the user if it doesn't exist yet
      await ctx.db.insert("users", {
        email: args.email,
        pushAlertSubscriberId: args.pushId,
        isAdmin: isAdmin,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const makeAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { isAdmin: args.isAdmin });
    return true;
  },
});

export const updatePushId = mutation({
  args: { pushId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        pushAlertSubscriberId: args.pushId,
        updatedAt: Date.now(),
      });
    }
  },
});