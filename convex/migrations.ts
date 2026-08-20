import { mutation } from "./_generated/server";

export const backfillReviewTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const ridesWithNoToken = await ctx.db
      .query("rides")
      .filter((q) => q.eq(q.field("reviewToken"), undefined))
      .collect();

    for (const ride of ridesWithNoToken) {
      const reviewToken = Math.random().toString(36).substring(2, 14).toUpperCase();
      await ctx.db.patch(ride._id, { reviewToken });
    }

    return ridesWithNoToken.length;
  },
});
