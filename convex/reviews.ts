import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    rideId: v.id("rides"),
    token: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.rideId);
    
    if (!ride) {
      throw new Error("Ride not found");
    }

    // Security Check: Token must match
    if (ride.reviewToken !== args.token) {
      throw new Error("Invalid review token");
    }

    // Logic Check: Ride must be confirmed
    if (ride.status !== "confirmed") {
      throw new Error("Only confirmed rides can be reviewed");
    }

    // Duplication Check: Only one review per ride
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .unique();

    if (existing) {
      throw new Error("This ride has already been reviewed");
    }

    // Submit the review
    return await ctx.db.insert("reviews", {
      rideId: args.rideId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });
  },
});

export const getByRideToken = query({
  args: {
    rideId: v.id("rides"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.rideId);
    
    if (!ride || ride.reviewToken !== args.token) {
      return { isValid: false };
    }

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .unique();

    return {
      isValid: true,
      ride: {
        customerName: ride.customerName,
        pickupDate: ride.pickupDate,
        carTypeName: ride.carTypeName,
        status: ride.status,
      },
      hasReviewed: !!existingReview,
      review: existingReview,
    };
  },
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const listWithRides = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .order("desc")
      .take(args.limit ?? 50);
      
    // Join with rides
    return await Promise.all(
      reviews.map(async (review) => {
        const ride = await ctx.db.get(review.rideId);
        return {
          ...review,
          ride: ride ? {
            customerName: ride.customerName,
            pickupDate: ride.pickupDate,
            carTypeName: ride.carTypeName,
          } : null,
        };
      })
    );
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").order("desc").take(500);
    
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0,0,0,0,0] };
    }
    
    let totalScore = 0;
    const distribution = [0, 0, 0, 0, 0]; // 1-star to 5-star
    
    for (const r of reviews) {
      totalScore += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
    }
    
    return {
      average: totalScore / reviews.length,
      total: reviews.length,
      distribution: distribution.reverse(), // 5-star to 1-star
    };
  },
});
