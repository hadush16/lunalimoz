import { query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getByRideId = query({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .first();
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
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
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
      await ctx.db.patch(payment._id, {
        status: "refunded",
        refundAmount: args.refundAmount,
        refundedAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db
        .query("rides")
        .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", payment.stripeCheckoutSessionId))
        .first()
        .then(async (ride) => {
          if (ride) {
            await ctx.db.patch(ride._id, {
              paymentStatus: "refunded",
              updatedAt: Date.now(),
            });
          }
        });
    }
  },
});
