import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getByRideId = query({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .first();
  },
});

export const getByRideIdInternal = internalQuery({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .first();
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db.query("payments").order("desc").take(limit);
  },
});

export const listRefunds = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db.query("refunds").order("desc").take(limit);
  },
});

export const getByStripeSessionId = internalQuery({
  args: { stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId))
      .first();
  },
});

export const createPaymentRecord = internalMutation({
  args: {
    rideId: v.id("rides"),
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("unpaid"),
      v.literal("checkout_started"),
      v.literal("pending"),
      v.literal("paid"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("partially_refunded"),
      v.literal("refunded"),
      v.literal("cancellation_fee"),
      v.literal("disputed")
    ),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("payments", {
      rideId: args.rideId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      paymentMethod: args.paymentMethod,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recordRefundInternal = internalMutation({
  args: {
    rideId: v.id("rides"),
    stripeRefundId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    reason: v.string(),
    initiatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("refunds", {
      rideId: args.rideId,
      stripeRefundId: args.stripeRefundId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      amount: args.amount,
      currency: args.currency,
      reason: args.reason,
      initiatedBy: args.initiatedBy,
      status: "succeeded",
      createdAt: now,
    });

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .first();

    if (payment) {
      const isFullRefund = args.amount >= payment.amount;
      await ctx.db.patch(payment._id, {
        status: isFullRefund ? "refunded" : "partially_refunded",
        refundAmount: (payment.refundAmount || 0) + args.amount,
        refundedAt: now,
        updatedAt: now,
      });
    }

    const ride = await ctx.db.get(args.rideId);
    if (ride) {
      const isFullRefund = args.amount >= ride.price;
      await ctx.db.patch(args.rideId, {
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        updatedAt: now,
      });
    }
  },
});

export const markRefunded = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
    refundAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripe_payment_intent", (q) => q.eq("stripePaymentIntentId", args.stripePaymentIntentId))
      .first();

    if (payment && payment.status !== "refunded") {
      const isFull = args.refundAmount >= payment.amount;
      await ctx.db.patch(payment._id, {
        status: isFull ? "refunded" : "partially_refunded",
        refundAmount: args.refundAmount,
        refundedAt: Date.now(),
        updatedAt: Date.now(),
      });

      const ride = await ctx.db.get(payment.rideId);
      if (ride) {
        await ctx.db.patch(ride._id, {
          paymentStatus: isFull ? "refunded" : "partially_refunded",
          updatedAt: Date.now(),
        });
      }
    }
  },
});
