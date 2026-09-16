import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const LUNA_LIMO_POLICY_V1 = {
  version: "1.0",
  title: "Cancellation & No-Show Policy and Reservation Terms",
  effectiveDate: "2026-01-01",
  content: `At Lunalimoz, we are committed to providing exceptional, reliable, and professional luxury transportation services. Each reservation requires dedicated scheduling of a professional chauffeur and vehicle. Therefore, the following policies apply to all confirmed reservations.

1. Cancellations made at least 24 hours before the scheduled pickup time may be canceled without a cancellation fee.
2. Cancellations made less than 24 hours before the scheduled pickup time may be subject to a cancellation fee of up to 50% of the total reservation amount.
3. Cancellations made within 2 hours of the scheduled pickup time, or after the chauffeur has been dispatched, may be charged 100% of the total reservation amount.
4. No-shows may be charged 100% of the total reservation amount.
5. Passengers are expected to be ready at the confirmed pickup time. Additional waiting time beyond any complimentary waiting period included with the reservation may result in additional charges.
6. For airport pickups, flight delays will be handled according to the reservation terms and available flight information.
7. Changes to the pickup time, pickup location, destination, number of passengers, vehicle type, or itinerary are subject to availability and may result in additional charges.
8. Reservations for weddings, proms, concerts, sporting events, corporate events, and other special occasions may have separate cancellation requirements. Deposits or advance payments for certain reservations may be non-refundable when disclosed at the time of booking.
9. By confirming a reservation with Lunalimoz, the customer acknowledges and agrees to this Cancellation & No-Show Policy.
10. Lunalimoz reserves the right to review exceptional circumstances on a case-by-case basis.`,
  isActive: true,
};

export const getActivePolicy = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("policyVersions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    return active || LUNA_LIMO_POLICY_V1;
  },
});

export const seedPolicy = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("policyVersions").first();
    if (!existing) {
      await ctx.db.insert("policyVersions", {
        ...LUNA_LIMO_POLICY_V1,
        createdAt: Date.now(),
      });
    }
  },
});

export const listVersions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("policyVersions").order("desc").take(20);
  },
});
