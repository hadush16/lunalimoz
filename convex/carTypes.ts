import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("carTypes").take(50);
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

    const carTypes = [
      {
        name: "Executive Sedan",
        description: "The ultimate business-class experience with Mercedes-Benz S-Class or BMW 7-Series. Optimal comfort and soundproofing.",
        image: "/executive_sedan.png",
        baseFare: 25,
        perKmRate: 2.5,
        perMinuteRate: 0.5,
        hourlyRate: 120,
        multiplier: 1.0,
        capacity: 3,
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Luxury SUV",
        description: "Commanding presence with Cadillac Escalade or Lincoln Navigator. First-class travel for up to 6 passengers.",
        image: "/luxury_suv.png",
        baseFare: 40,
        perKmRate: 4.5,
        perMinuteRate: 0.8,
        hourlyRate: 180,
        multiplier: 1.4,
        capacity: 6,
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Premium Electric",
        description: "Silent innovation with Tesla Model S or Lucid Air. Future-focused luxury for the modern traveler.",
        image: "/premium_electric.png",
        baseFare: 35,
        perKmRate: 3.5,
        perMinuteRate: 0.7,
        hourlyRate: 150,
        multiplier: 1.2,
        capacity: 4,
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Executive Van",
        description: "Custom Mercedes Sprinter with high-ceiling and captain's chairs. Luxury logistics for groups up to 14.",
        image: "/executive_van.png",
        baseFare: 65,
        perKmRate: 5.5,
        perMinuteRate: 1.2,
        hourlyRate: 250,
        multiplier: 1.8,
        capacity: 14,
        isActive: true,
        createdAt: Date.now(),
      },
    ];

    for (const carType of carTypes) {
      await ctx.db.insert("carTypes", carType);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("carTypes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    image: v.string(),
    baseFare: v.number(),
    perKmRate: v.number(),
    perMinuteRate: v.number(),
    hourlyRate: v.optional(v.number()),
    multiplier: v.number(),
    capacity: v.number(),
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
    perKmRate: v.optional(v.number()),
    perMinuteRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    multiplier: v.optional(v.number()),
    capacity: v.optional(v.number()),
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