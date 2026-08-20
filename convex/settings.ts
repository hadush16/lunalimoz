import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Default settings if none exist
const DEFAULT_SETTINGS = {
  companyName: "Luna Limo",
  email: "concierge@lunalimo.com",
  phone: "(206) 327-4411",
  address: "1902 E Yesler way, Seattle, WA 98122",
  surgeMultiplier: 1.0,
  minimumFare: 50.0,
  notificationsEmail: true,
  updatedAt: Date.now(),
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings || DEFAULT_SETTINGS;
  },
});

export const getInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

export const update = mutation({
  args: {
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    surgeMultiplier: v.optional(v.number()),
    minimumFare: v.optional(v.number()),
    notificationsEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    const currentTimestamp = Date.now();

    if (existing) {
      // Create an object with only the defined fields to update
      const updateData: Record<string, any> = { updatedAt: currentTimestamp };
      if (args.companyName !== undefined) updateData.companyName = args.companyName;
      if (args.email !== undefined) updateData.email = args.email;
      if (args.phone !== undefined) updateData.phone = args.phone;
      if (args.address !== undefined) updateData.address = args.address;
      if (args.surgeMultiplier !== undefined) updateData.surgeMultiplier = args.surgeMultiplier;
      if (args.minimumFare !== undefined) updateData.minimumFare = args.minimumFare;
      if (args.notificationsEmail !== undefined) updateData.notificationsEmail = args.notificationsEmail;
      
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      const insertData = {
        companyName: args.companyName ?? DEFAULT_SETTINGS.companyName,
        email: args.email ?? DEFAULT_SETTINGS.email,
        phone: args.phone ?? DEFAULT_SETTINGS.phone,
        address: args.address ?? DEFAULT_SETTINGS.address,
        surgeMultiplier: args.surgeMultiplier ?? DEFAULT_SETTINGS.surgeMultiplier,
        minimumFare: args.minimumFare ?? DEFAULT_SETTINGS.minimumFare,
        notificationsEmail: args.notificationsEmail ?? DEFAULT_SETTINGS.notificationsEmail,
        updatedAt: currentTimestamp,
      };
      
      return await ctx.db.insert("settings", insertData as any);
    }
  },
});
