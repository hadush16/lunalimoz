import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

const DEFAULT_SETTINGS = {
  companyName: "Luna Limo",
  email: "concierge@lunalimo.com",
  phone: "(206) 327-4411",
  address: "1902 E Yesler way, Seattle, WA 98122",
  surgeMultiplier: 1.0,
  minimumFare: 75.0,
  baseAirportFee: 20.0,
  meetAndGreetFee: 35.0,
  additionalStopFee: 30.0,
  waitingTimePerMinuteRate: 1.5,
  complimentaryWaitMinutes: 15,
  weekendSurgeMultiplier: 1.1,
  holidaySurgeMultiplier: 1.25,
  taxRatePercent: 10.25,
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
    baseAirportFee: v.optional(v.number()),
    meetAndGreetFee: v.optional(v.number()),
    additionalStopFee: v.optional(v.number()),
    waitingTimePerMinuteRate: v.optional(v.number()),
    complimentaryWaitMinutes: v.optional(v.number()),
    weekendSurgeMultiplier: v.optional(v.number()),
    holidaySurgeMultiplier: v.optional(v.number()),
    taxRatePercent: v.optional(v.number()),
    notificationsEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    const currentTimestamp = Date.now();

    if (existing) {
      const updateData: Record<string, any> = { updatedAt: currentTimestamp };
      for (const [key, val] of Object.entries(args)) {
        if (val !== undefined) updateData[key] = val;
      }
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      const insertData = {
        ...DEFAULT_SETTINGS,
        ...args,
        updatedAt: currentTimestamp,
      };
      return await ctx.db.insert("settings", insertData as any);
    }
  },
});
