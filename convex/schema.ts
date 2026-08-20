import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    pushAlertSubscriberId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_admin", ["isAdmin"]),

  carTypes: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_name", ["name"]),

  rides: defineTable({
    userId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    pickupAddress: v.string(),
    destinationAddress: v.string(),
    pickupLat: v.number(),
    pickupLng: v.number(),
    destLat: v.number(),
    destLng: v.number(),
    distance: v.number(),
    duration: v.number(),
    carTypeName: v.string(),
    carTypeMultiplier: v.number(),
    price: v.number(),
    passengers: v.number(),
    luggage: v.number(),
    accessible: v.boolean(),
    serviceType: v.optional(v.union(
      v.literal("point_to_point"),
      v.literal("hourly")
    )),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    paymentStatus: v.optional(v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("partially_refunded")
    )),
    stripeCheckoutSessionId: v.optional(v.string()),
    reviewToken: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"])
    .searchIndex("search_customer", { searchField: "customerName" }),

  payments: defineTable({
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
    refundAmount: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ride", ["rideId"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_status", ["status"]),

  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_isRead", ["isRead"])
    .index("by_createdAt", ["createdAt"]),

  reviews: defineTable({
    rideId: v.id("rides"),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_ride", ["rideId"]),

  settings: defineTable({
    companyName: v.string(),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    surgeMultiplier: v.number(),
    minimumFare: v.number(),
    notificationsEmail: v.boolean(),
    updatedAt: v.number(),
  }),

  notifications: defineTable({
    type: v.union(
      v.literal("new_booking"),
      v.literal("status_update"),
      v.literal("cancellation"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_isRead", ["isRead"])
    .index("by_createdAt", ["createdAt"]),
});