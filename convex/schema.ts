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
    perMileRate: v.optional(v.number()),
    perMinuteRate: v.number(),
    hourlyRate: v.optional(v.number()),
    hourlyMin: v.optional(v.number()),
    minFare: v.optional(v.number()),
    minMiles: v.optional(v.number()),
    multiplier: v.number(),
    capacity: v.number(),
    luggageCapacity: v.optional(v.number()),
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
    distance: v.number(), // in km
    duration: v.number(), // in minutes
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
    flightNumber: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    optionalServices: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
    }))),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    priceSnapshot: v.optional(v.object({
      baseFare: v.number(),
      calculatedMiles: v.number(),
      perMileRate: v.number(),
      mileageCharge: v.number(),
      timeCharge: v.optional(v.number()),
      airportFee: v.number(),
      stopFee: v.number(),
      waitingFee: v.number(),
      optionalServicesFee: v.number(),
      surgeMultiplier: v.number(),
      surgeFee: v.number(),
      discountAmount: v.number(),
      subtotal: v.number(),
      taxRatePercent: v.number(),
      taxAmount: v.number(),
      finalAmount: v.number(),
      currency: v.string(),
      pricingVersion: v.string(),
      quoteTimestamp: v.number(),
    })),
    policyVersion: v.optional(v.string()),
    policyAccepted: v.optional(v.boolean()),
    policyAcceptedAt: v.optional(v.number()),
    chauffeur: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      vehiclePlate: v.string(),
      assignedAt: v.optional(v.number()),
    })),
    cancellationDetails: v.optional(v.object({
      cancelledAt: v.number(),
      cancellationFee: v.number(),
      refundAmount: v.number(),
      reason: v.string(),
      cancelledBy: v.string(),
    })),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("awaiting_payment"),
      v.literal("confirmed"),
      v.literal("chauffeur_assigned"),
      v.literal("dispatched"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    paymentStatus: v.optional(v.union(
      v.literal("unpaid"),
      v.literal("checkout_started"),
      v.literal("paid"),
      v.literal("payment_failed"),
      v.literal("partially_refunded"),
      v.literal("refunded"),
      v.literal("cancellation_fee"),
      v.literal("disputed")
    )),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    reviewToken: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_created", ["createdAt"])
    .index("by_pickup_date", ["pickupDate"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"])
    .searchIndex("search_customer", { searchField: "customerName" }),

  payments: defineTable({
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
    refundAmount: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ride", ["rideId"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_status", ["status"]),

  refunds: defineTable({
    rideId: v.id("rides"),
    paymentId: v.optional(v.id("payments")),
    stripeRefundId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    reason: v.string(),
    initiatedBy: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_ride", ["rideId"])
    .index("by_created", ["createdAt"]),

  cancellationRules: defineTable({
    tierHours: v.number(), // e.g. 24, 2, 0
    feePercentage: v.number(), // 0, 50, 100
    description: v.string(),
    ruleType: v.string(), // "standard", "dispatch", "no_show"
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_active", ["isActive"]),

  discounts: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    minSpend: v.optional(v.number()),
    expiryDate: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    timesUsed: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_code", ["code"])
    .index("by_active", ["isActive"]),

  policyVersions: defineTable({
    version: v.string(),
    title: v.string(),
    content: v.string(),
    effectiveDate: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_version", ["version"])
    .index("by_active", ["isActive"]),

  auditLogs: defineTable({
    adminEmail: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    metadata: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_entity", ["entity", "entityId"])
    .index("by_admin", ["adminEmail"])
    .index("by_timestamp", ["timestamp"]),

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
    baseAirportFee: v.optional(v.number()),
    meetAndGreetFee: v.optional(v.number()),
    additionalStopFee: v.optional(v.number()),
    waitingTimePerMinuteRate: v.optional(v.number()),
    complimentaryWaitMinutes: v.optional(v.number()),
    weekendSurgeMultiplier: v.optional(v.number()),
    holidaySurgeMultiplier: v.optional(v.number()),
    taxRatePercent: v.optional(v.number()),
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

  // --- PHASE 1 INTEGER CENTS & RATE CARD DATA MODEL ---
  rate_cards: defineTable({
    version: v.number(),
    is_active: v.boolean(),
    effective_from: v.number(),
    created_by: v.string(),
    created_at: v.number(),
    note: v.optional(v.string()),
  }).index("by_version", ["version"])
    .index("by_active", ["is_active"]),

  vehicle_rates: defineTable({
    rate_card_id: v.id("rate_cards"),
    vehicle_slug: v.string(), // "escalade-esv" | "s-class" | "navigator-l" | "sprinter"
    display_name: v.string(),
    base_fare_cents: v.number(),
    per_mile_cents: v.number(),
    per_minute_cents: v.number(),
    hourly_rate_cents: v.number(),
    hourly_minimum_hours: v.number(),
    minimum_fare_cents: v.number(),
    max_passengers: v.number(),
    max_bags: v.number(),
    is_bookable: v.boolean(),
    sort_order: v.number(),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
  }).index("by_rate_card", ["rate_card_id"])
    .index("by_slug", ["vehicle_slug"])
    .index("by_bookable", ["is_bookable"]),

  mileage_tiers: defineTable({
    vehicle_rate_id: v.id("vehicle_rates"),
    from_mile: v.number(),
    to_mile: v.optional(v.number()), // null = infinity
    per_mile_cents: v.number(),
  }).index("by_vehicle_rate", ["vehicle_rate_id"]),

  surcharges: defineTable({
    rate_card_id: v.id("rate_cards"),
    key: v.string(),
    label: v.string(),
    type: v.union(v.literal("flat"), v.literal("percent")),
    amount: v.number(), // cents if flat, basis points or percent if percent
    is_active: v.boolean(),
    extra_config: v.optional(v.string()), // JSON for special rules like after-hours
  }).index("by_rate_card", ["rate_card_id"])
    .index("by_key", ["key"]),

  policy_settings: defineTable({
    free_cancel_hours: v.number(), // default 24
    late_cancel_hours: v.number(), // default 24
    late_cancel_percent: v.number(), // default 50
    imminent_cancel_hours: v.number(), // default 2
    imminent_cancel_percent: v.number(), // default 100
    no_show_percent: v.number(), // default 100
    complimentary_wait_minutes_standard: v.number(), // default 15
    complimentary_wait_minutes_airport: v.number(), // default 60
    wait_charge_per_minute_cents: v.number(),
    dispatch_locks_cancellation: v.boolean(),
    special_event_deposit_percent: v.number(),
    special_event_deposit_refundable: v.boolean(),
    updated_at: v.number(),
    updated_by: v.optional(v.string()),
  }),

  bookings: defineTable({
    customer_name: v.string(),
    customer_email: v.string(),
    customer_phone: v.string(),
    pickup_address: v.string(),
    dropoff_address: v.string(),
    pickup_lat: v.number(),
    pickup_lng: v.number(),
    dropoff_lat: v.number(),
    dropoff_lng: v.number(),
    pickup_datetime_utc: v.number(),
    vehicle_slug: v.string(),
    passengers: v.number(),
    bags: v.number(),
    flight_number: v.optional(v.string()),
    trip_type: v.union(v.literal("point_to_point"), v.literal("hourly"), v.literal("airport")),
    hourly_hours: v.optional(v.number()),
    special_instructions: v.optional(v.string()),
    distance_meters: v.number(),
    duration_seconds: v.number(),
    route_provider_response: v.optional(v.string()),
    quote_breakdown: v.string(), // JSON snapshot
    rate_card_version: v.number(),
    total_cents: v.number(),
    status: v.union(
      v.literal("quoted"),
      v.literal("pending_payment"),
      v.literal("confirmed"),
      v.literal("dispatched"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    stripe_customer_id: v.optional(v.string()),
    stripe_payment_intent_id: v.optional(v.string()),
    stripe_payment_method_id: v.optional(v.string()),
    stripe_setup_intent_id: v.optional(v.string()),
    payment_status: v.union(
      v.literal("none"),
      v.literal("authorized"),
      v.literal("captured"),
      v.literal("partially_refunded"),
      v.literal("refunded"),
      v.literal("failed")
    ),
    cancelled_at: v.optional(v.number()),
    cancelled_by: v.optional(v.string()),
    cancellation_fee_cents: v.optional(v.number()),
    policy_snapshot: v.optional(v.string()),
    dispatched_at: v.optional(v.number()),
    confirmation_code: v.string(), // e.g. "LL-7F3K2"
    policy_accepted_at: v.optional(v.number()),
    policy_version_hash: v.optional(v.string()),
    customer_ip: v.optional(v.string()),
    gratuity_percent: v.optional(v.number()),
    wait_time_minutes: v.optional(v.number()),
    wait_time_cents: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_confirmation_code", ["confirmation_code"])
    .index("by_status", ["status"])
    .index("by_pickup_datetime", ["pickup_datetime_utc"])
    .index("by_payment_intent", ["stripe_payment_intent_id"])
    .index("by_setup_intent", ["stripe_setup_intent_id"])
    .index("by_customer_email", ["customer_email"]),

  admin_users: defineTable({
    email: v.string(),
    password_hash: v.string(),
    role: v.union(v.literal("owner"), v.literal("dispatcher"), v.literal("viewer")),
    last_login_at: v.optional(v.number()),
    must_change_password: v.optional(v.boolean()),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  audit_log: defineTable({
    actor_id: v.string(),
    action: v.string(),
    entity: v.string(),
    entity_id: v.string(),
    before_json: v.optional(v.string()),
    after_json: v.optional(v.string()),
    ip: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_entity", ["entity", "entity_id"])
    .index("by_actor", ["actor_id"])
    .index("by_created_at", ["created_at"]),

  webhook_events: defineTable({
    stripe_event_id: v.string(),
    type: v.string(),
    processed_at: v.number(),
  }).index("by_stripe_event_id", ["stripe_event_id"]),
});