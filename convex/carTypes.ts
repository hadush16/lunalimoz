import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const LUNA_LIMO_FLEET = [
  {
    name: "Mercedes-Benz S-Class",
    description: "The benchmark of luxury sedans. Handcrafted leather interior, active noise cancellation, and unparalleled ride smoothness for VIPs.",
    image: "/executive_sedan.png",
    baseFare: 35.0,
    perMileRate: 4.5,
    perKmRate: 2.8,
    perMinuteRate: 0.6,
    hourlyRate: 135.0,
    hourlyMin: 2,
    minFare: 75.0,
    minMiles: 5.0,
    multiplier: 1.0,
    capacity: 3,
    luggageCapacity: 3,
    isActive: true,
  },
  {
    name: "Cadillac Escalade ESV",
    description: "The pinnacle of executive SUV luxury with extended legroom and cavernous luggage capacity. Perfect for Seattle airport transfers and executive teams.",
    image: "/luxury_suv.png",
    baseFare: 50.0,
    perMileRate: 5.5,
    perKmRate: 3.4,
    perMinuteRate: 0.8,
    hourlyRate: 165.0,
    hourlyMin: 2,
    minFare: 95.0,
    minMiles: 5.0,
    multiplier: 1.25,
    capacity: 6,
    luggageCapacity: 6,
    isActive: true,
  },
  {
    name: "Lincoln Navigator L",
    description: "American grand luxury with extended wheelbase, premium Revel sound, and captain chairs designed for supreme relaxation.",
    image: "/fleet_black_bg.png",
    baseFare: 50.0,
    perMileRate: 5.5,
    perKmRate: 3.4,
    perMinuteRate: 0.8,
    hourlyRate: 165.0,
    hourlyMin: 2,
    minFare: 95.0,
    minMiles: 5.0,
    multiplier: 1.25,
    capacity: 6,
    luggageCapacity: 6,
    isActive: true,
  },
  {
    name: "Mercedes-Benz Sprinter",
    description: "High-ceiling executive van with custom leather captain seating, presentation monitors, and spacious luggage bays for large delegations.",
    image: "/executive_van.png",
    baseFare: 85.0,
    perMileRate: 7.0,
    perKmRate: 4.35,
    perMinuteRate: 1.2,
    hourlyRate: 225.0,
    hourlyMin: 3,
    minFare: 175.0,
    minMiles: 10.0,
    multiplier: 1.6,
    capacity: 14,
    luggageCapacity: 14,
    isActive: true,
  },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cars = await ctx.db.query("carTypes").take(50);
    if (cars.length === 0) {
      return LUNA_LIMO_FLEET.map((car, idx) => ({
        ...car,
        _id: `fallback_${idx}` as any,
        createdAt: Date.now(),
      }));
    }
    return cars;
  },
});

export const getById = query({
  args: { id: v.id("carTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByName = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("carTypes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const seedCarTypes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("carTypes").take(50);
    if (existing.length > 0) return;

    for (const car of LUNA_LIMO_FLEET) {
      await ctx.db.insert("carTypes", {
        ...car,
        createdAt: Date.now(),
      });
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    image: v.string(),
    baseFare: v.number(),
    perMileRate: v.optional(v.number()),
    perKmRate: v.number(),
    perMinuteRate: v.number(),
    hourlyRate: v.optional(v.number()),
    hourlyMin: v.optional(v.number()),
    minFare: v.optional(v.number()),
    minMiles: v.optional(v.number()),
    multiplier: v.number(),
    capacity: v.number(),
    luggageCapacity: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("carTypes", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("carTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    baseFare: v.optional(v.number()),
    perMileRate: v.optional(v.number()),
    perKmRate: v.optional(v.number()),
    perMinuteRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    hourlyMin: v.optional(v.number()),
    minFare: v.optional(v.number()),
    minMiles: v.optional(v.number()),
    multiplier: v.optional(v.number()),
    capacity: v.optional(v.number()),
    luggageCapacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("carTypes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});