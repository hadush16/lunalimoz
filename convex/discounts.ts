import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("discounts").order("desc").take(100);
  },
});

export const validate = query({
  args: {
    code: v.string(),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    const cleanCode = args.code.trim().toUpperCase();
    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", cleanCode))
      .first();

    if (!discount || !discount.isActive) {
      return { valid: false, message: "Invalid or inactive promo code." };
    }

    if (discount.expiryDate && new Date(discount.expiryDate).getTime() < Date.now()) {
      return { valid: false, message: "This promo code has expired." };
    }

    if (discount.maxUses && discount.timesUsed >= discount.maxUses) {
      return { valid: false, message: "This promo code has reached maximum usage." };
    }

    if (discount.minSpend && args.subtotal < discount.minSpend) {
      return {
        valid: false,
        message: `Minimum spend of $${discount.minSpend} required for this code.`,
      };
    }

    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = Math.round((args.subtotal * (discount.value / 100)) * 100) / 100;
    } else {
      discountAmount = Math.min(discount.value, args.subtotal);
    }

    return {
      valid: true,
      code: discount.code,
      discountType: discount.discountType,
      value: discount.value,
      discountAmount,
      message: `${discount.code} applied successfully!`,
    };
  },
});

export const validateInternal = internalQuery({
  args: {
    code: v.string(),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    const cleanCode = args.code.trim().toUpperCase();
    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", cleanCode))
      .first();

    if (!discount || !discount.isActive) return null;
    if (discount.expiryDate && new Date(discount.expiryDate).getTime() < Date.now()) return null;
    if (discount.maxUses && discount.timesUsed >= discount.maxUses) return null;
    if (discount.minSpend && args.subtotal < discount.minSpend) return null;

    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = Math.round((args.subtotal * (discount.value / 100)) * 100) / 100;
    } else {
      discountAmount = Math.min(discount.value, args.subtotal);
    }

    return {
      code: discount.code,
      discountAmount,
      id: discount._id,
    };
  },
});

export const incrementUsage = internalMutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const cleanCode = args.code.trim().toUpperCase();
    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", cleanCode))
      .first();

    if (discount) {
      await ctx.db.patch(discount._id, {
        timesUsed: (discount.timesUsed || 0) + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    minSpend: v.optional(v.number()),
    expiryDate: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const cleanCode = args.code.trim().toUpperCase();
    const existing = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", cleanCode))
      .first();

    if (existing) {
      throw new Error(`Discount code "${cleanCode}" already exists.`);
    }

    return await ctx.db.insert("discounts", {
      ...args,
      code: cleanCode,
      timesUsed: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("discounts"),
    value: v.optional(v.number()),
    minSpend: v.optional(v.number()),
    expiryDate: v.optional(v.string()),
    maxUses: v.optional(v.number()),
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
  args: { id: v.id("discounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
