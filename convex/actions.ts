import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const sendInvoice = action({
  args: {
    rideId: v.id("rides"),
    pdfBase64: v.string(), // Client sends the generated PDF as base64
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    // Basic verification: user should ideally be an admin
    // For now, we trust the internalAction call
    return await ctx.runAction(internal.emails.sendInvoiceEmail, {
      rideId: args.rideId,
      pdfBase64: args.pdfBase64
    });
  },
});
