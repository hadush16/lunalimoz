import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const DEFAULT_RULES = [
  {
    tierHours: 24,
    feePercentage: 0,
    description: "Cancellations made 24+ hours prior to scheduled pickup incur 0% cancellation fee.",
    ruleType: "standard",
    isActive: true,
  },
  {
    tierHours: 2,
    feePercentage: 50,
    description: "Cancellations made between 2 and 24 hours prior to scheduled pickup incur up to 50% cancellation fee.",
    ruleType: "standard",
    isActive: true,
  },
  {
    tierHours: 0,
    feePercentage: 100,
    description: "Cancellations made within 2 hours or after chauffeur dispatch incur 100% cancellation fee.",
    ruleType: "dispatch",
    isActive: true,
  },
  {
    tierHours: -1,
    feePercentage: 100,
    description: "Passenger no-shows incur 100% cancellation fee.",
    ruleType: "no_show",
    isActive: true,
  },
];

export const seedRules = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("cancellationRules").take(10);
    if (existing.length > 0) return;

    for (const rule of DEFAULT_RULES) {
      await ctx.db.insert("cancellationRules", {
        ...rule,
        createdAt: Date.now(),
      });
    }
  },
});

export const listRules = query({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.db.query("cancellationRules").take(50);
    if (rules.length === 0) {
      return DEFAULT_RULES.map((r, i) => ({ ...r, _id: `default_${i}` as any, createdAt: Date.now() }));
    }
    return rules;
  },
});

export const updateRule = mutation({
  args: {
    id: v.id("cancellationRules"),
    feePercentage: v.optional(v.number()),
    description: v.optional(v.string()),
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

export const createRule = mutation({
  args: {
    tierHours: v.number(),
    feePercentage: v.number(),
    description: v.string(),
    ruleType: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cancellationRules", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const evaluateCancellation = query({
  args: {
    rideId: v.id("rides"),
    isNoShow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.rideId);
    if (!ride) throw new Error("Reservation not found");

    const totalPaid = ride.price || 0;

    if (args.isNoShow || ride.status === "no_show") {
      return {
        feePercentage: 100,
        cancellationFee: totalPaid,
        refundAmount: 0,
        reason: "No-show policy (100% charge)",
        hoursRemaining: 0,
      };
    }

    if (ride.status === "dispatched" || ride.status === "in_progress") {
      return {
        feePercentage: 100,
        cancellationFee: totalPaid,
        refundAmount: 0,
        reason: "Chauffeur already dispatched (100% charge)",
        hoursRemaining: 0,
      };
    }

    // Parse pickup datetime
    const pickupDateTimeStr = `${ride.pickupDate}T${ride.pickupTime || "00:00"}:00`;
    const pickupTimestamp = new Date(pickupDateTimeStr).getTime();
    const now = Date.now();
    const diffMs = pickupTimestamp - now;
    const hoursRemaining = diffMs / (1000 * 60 * 60);

    let feePercentage = 0;
    let reason = "24+ hours advance notice (0% fee, full refund)";

    if (hoursRemaining >= 24) {
      feePercentage = 0;
      reason = "24+ hours advance notice (0% fee, full refund)";
    } else if (hoursRemaining >= 2) {
      feePercentage = 50;
      reason = "Less than 24 hours notice (50% cancellation fee)";
    } else {
      feePercentage = 100;
      reason = "Within 2 hours of scheduled pickup (100% cancellation fee)";
    }

    const cancellationFee = Math.round((totalPaid * (feePercentage / 100)) * 100) / 100;
    const refundAmount = Math.max(0, Math.round((totalPaid - cancellationFee) * 100) / 100);

    return {
      feePercentage,
      cancellationFee,
      refundAmount,
      reason,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    };
  },
});

export const evaluateCancellationInternal = internalQuery({
  args: {
    rideId: v.id("rides"),
    isNoShow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.rideId);
    if (!ride) throw new Error("Reservation not found");

    const totalPaid = ride.price || 0;

    if (args.isNoShow || ride.status === "no_show") {
      return {
        feePercentage: 100,
        cancellationFee: totalPaid,
        refundAmount: 0,
        reason: "No-show policy (100% charge)",
        hoursRemaining: 0,
      };
    }

    if (ride.status === "dispatched" || ride.status === "in_progress") {
      return {
        feePercentage: 100,
        cancellationFee: totalPaid,
        refundAmount: 0,
        reason: "Chauffeur already dispatched (100% charge)",
        hoursRemaining: 0,
      };
    }

    // Parse pickup datetime
    const pickupDateTimeStr = `${ride.pickupDate}T${ride.pickupTime || "00:00"}:00`;
    const pickupTimestamp = new Date(pickupDateTimeStr).getTime();
    const now = Date.now();
    const diffMs = pickupTimestamp - now;
    const hoursRemaining = diffMs / (1000 * 60 * 60);

    let feePercentage = 0;
    let reason = "24+ hours advance notice (0% fee, full refund)";

    if (hoursRemaining >= 24) {
      feePercentage = 0;
      reason = "24+ hours advance notice (0% fee, full refund)";
    } else if (hoursRemaining >= 2) {
      feePercentage = 50;
      reason = "Less than 24 hours notice (50% cancellation fee)";
    } else {
      feePercentage = 100;
      reason = "Within 2 hours of scheduled pickup (100% cancellation fee)";
    }

    const cancellationFee = Math.round((totalPaid * (feePercentage / 100)) * 100) / 100;
    const refundAmount = Math.max(0, Math.round((totalPaid - cancellationFee) * 100) / 100);

    return {
      feePercentage,
      cancellationFee,
      refundAmount,
      reason,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    };
  },
});
