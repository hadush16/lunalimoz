import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const DEFAULT_VEHICLES = [
  {
    vehicle_slug: "escalade-esv",
    display_name: "Cadillac Escalade ESV",
    base_fare_cents: 4000, // $40.00
    per_mile_cents: 450, // $4.50
    per_minute_cents: 80, // $0.80
    hourly_rate_cents: 18000, // $180.00
    hourly_minimum_hours: 2,
    minimum_fare_cents: 12000, // $120.00
    max_passengers: 6,
    max_bags: 6,
    is_bookable: true,
    sort_order: 1,
    image: "/luxury_suv.png",
    description: "First-class travel for up to 6 passengers. Unrivaled luxury and commanding presence.",
    tiers: [
      { from_mile: 0, to_mile: 10, per_mile_cents: 650 },
      { from_mile: 10, to_mile: 30, per_mile_cents: 525 },
      { from_mile: 30, to_mile: 75, per_mile_cents: 450 },
      { from_mile: 75, to_mile: undefined, per_mile_cents: 395 },
    ],
  },
  {
    vehicle_slug: "s-class",
    display_name: "Mercedes-Benz S-Class",
    base_fare_cents: 3500, // $35.00
    per_mile_cents: 380, // $3.80
    per_minute_cents: 65, // $0.65
    hourly_rate_cents: 15000, // $150.00
    hourly_minimum_hours: 2,
    minimum_fare_cents: 10000, // $100.00
    max_passengers: 3,
    max_bags: 3,
    is_bookable: true,
    sort_order: 2,
    image: "/executive_sedan.png",
    description: "The benchmark of luxury sedans. Handcrafted leather interior and supreme acoustic soundproofing.",
    tiers: [
      { from_mile: 0, to_mile: 10, per_mile_cents: 550 },
      { from_mile: 10, to_mile: 30, per_mile_cents: 450 },
      { from_mile: 30, to_mile: 75, per_mile_cents: 380 },
      { from_mile: 75, to_mile: undefined, per_mile_cents: 325 },
    ],
  },
  {
    vehicle_slug: "navigator-l",
    display_name: "Lincoln Navigator L",
    base_fare_cents: 4000, // $40.00
    per_mile_cents: 450, // $4.50
    per_minute_cents: 80, // $0.80
    hourly_rate_cents: 18000, // $180.00
    hourly_minimum_hours: 2,
    minimum_fare_cents: 12000, // $120.00
    max_passengers: 6,
    max_bags: 6,
    is_bookable: true,
    sort_order: 3,
    image: "/luxury_suv.png",
    description: "Executive American refinement with extended cargo capacity and presidential comfort.",
    tiers: [
      { from_mile: 0, to_mile: 10, per_mile_cents: 650 },
      { from_mile: 10, to_mile: 30, per_mile_cents: 525 },
      { from_mile: 30, to_mile: 75, per_mile_cents: 450 },
      { from_mile: 75, to_mile: undefined, per_mile_cents: 395 },
    ],
  },
  {
    vehicle_slug: "sprinter",
    display_name: "Mercedes-Benz Sprinter",
    base_fare_cents: 6500, // $65.00
    per_mile_cents: 550, // $5.50
    per_minute_cents: 100, // $1.00
    hourly_rate_cents: 22000, // $220.00
    hourly_minimum_hours: 3,
    minimum_fare_cents: 18000, // $180.00
    max_passengers: 14,
    max_bags: 14,
    is_bookable: true,
    sort_order: 4,
    image: "/executive_van.png",
    description: "Bespoke executive logistics for corporate teams and VIP groups up to 14 passengers.",
    tiers: [
      { from_mile: 0, to_mile: 10, per_mile_cents: 750 },
      { from_mile: 10, to_mile: 30, per_mile_cents: 650 },
      { from_mile: 30, to_mile: 75, per_mile_cents: 550 },
      { from_mile: 75, to_mile: undefined, per_mile_cents: 495 },
    ],
  },
];

export const DEFAULT_SURCHARGES = [
  { key: "airport_pickup_fee", label: "Sea-Tac Airport Pickup Fee", type: "flat" as const, amount: 2500, is_active: true },
  { key: "airport_dropoff_fee", label: "Sea-Tac Airport Dropoff Fee", type: "flat" as const, amount: 1500, is_active: true },
  { key: "meet_and_greet", label: "Airport Meet & Greet with Baggage Escort", type: "flat" as const, amount: 3500, is_active: true },
  { key: "extra_stop", label: "Additional Intermediate Stop", type: "flat" as const, amount: 3000, is_active: true },
  { key: "child_seat", label: "Forward/Rear Facing Child Safety Seat", type: "flat" as const, amount: 2500, is_active: true },
  { key: "after_hours", label: "After-Hours Service (11:00 PM - 5:00 AM)", type: "flat" as const, amount: 3500, is_active: true },
  { key: "holiday_surcharge", label: "Holiday Premium", type: "percent" as const, amount: 2000, is_active: false }, // 20% = 2000 bps
  { key: "wa_sales_tax", label: "Washington State Sales & Transit Tax", type: "percent" as const, amount: 1025, is_active: true }, // 10.25% = 1025 bps
  { key: "default_gratuity", label: "Chauffeur Gratuity (Customer Adjustable)", type: "percent" as const, amount: 2000, is_active: true }, // 20% = 2000 bps
];

export const DEFAULT_POLICY_SETTINGS = {
  free_cancel_hours: 24,
  late_cancel_hours: 24,
  late_cancel_percent: 50,
  imminent_cancel_hours: 2,
  imminent_cancel_percent: 100,
  no_show_percent: 100,
  complimentary_wait_minutes_standard: 15,
  complimentary_wait_minutes_airport: 60,
  wait_charge_per_minute_cents: 150, // $1.50/min ($90/hr)
  dispatch_locks_cancellation: true,
  special_event_deposit_percent: 25,
  special_event_deposit_refundable: false,
};

// Seed or retrieve active rate card
export const seedRateCard = mutation({
  args: {},
  handler: async (ctx) => {
    const existingActive = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    if (existingActive) return existingActive._id;

    const now = Date.now();
    const rateCardId = await ctx.db.insert("rate_cards", {
      version: 1,
      is_active: true,
      effective_from: now,
      created_by: "system_init",
      created_at: now,
      note: "Initial production rate card with integer cents & cumulative mileage tiers",
    });

    for (const vData of DEFAULT_VEHICLES) {
      const { tiers, ...rateData } = vData;
      const vehicleRateId = await ctx.db.insert("vehicle_rates", {
        rate_card_id: rateCardId,
        ...rateData,
      });

      for (const tier of tiers) {
        await ctx.db.insert("mileage_tiers", {
          vehicle_rate_id: vehicleRateId,
          ...tier,
        });
      }
    }

    for (const s of DEFAULT_SURCHARGES) {
      await ctx.db.insert("surcharges", {
        rate_card_id: rateCardId,
        ...s,
      });
    }

    const existingPolicy = await ctx.db.query("policy_settings").first();
    if (!existingPolicy) {
      await ctx.db.insert("policy_settings", {
        ...DEFAULT_POLICY_SETTINGS,
        updated_at: now,
        updated_by: "system_init",
      });
    }

    return rateCardId;
  },
});

export const getActiveRateCard = query({
  args: {},
  handler: async (ctx) => {
    let activeCard = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    if (!activeCard) {
      return null;
    }

    const vehicleRates = await ctx.db
      .query("vehicle_rates")
      .withIndex("by_rate_card", (q) => q.eq("rate_card_id", activeCard._id))
      .collect();

    const vehicleRatesWithTiers = await Promise.all(
      vehicleRates.map(async (vr) => {
        const tiers = await ctx.db
          .query("mileage_tiers")
          .withIndex("by_vehicle_rate", (q) => q.eq("vehicle_rate_id", vr._id))
          .collect();
        return {
          ...vr,
          tiers: tiers.sort((a, b) => a.from_mile - b.from_mile),
        };
      })
    );

    const surcharges = await ctx.db
      .query("surcharges")
      .withIndex("by_rate_card", (q) => q.eq("rate_card_id", activeCard._id))
      .collect();

    const policySettings = await ctx.db.query("policy_settings").first();

    return {
      rateCard: activeCard,
      vehicleRates: vehicleRatesWithTiers.sort((a, b) => a.sort_order - b.sort_order),
      surcharges,
      policySettings: policySettings || DEFAULT_POLICY_SETTINGS,
    };
  },
});

export const getActiveRateCardInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    let activeCard = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    if (!activeCard) {
      return {
        rateCard: { version: 1, is_active: true },
        vehicleRates: DEFAULT_VEHICLES,
        surcharges: DEFAULT_SURCHARGES,
        policySettings: DEFAULT_POLICY_SETTINGS,
      };
    }

    const vehicleRates = await ctx.db
      .query("vehicle_rates")
      .withIndex("by_rate_card", (q) => q.eq("rate_card_id", activeCard._id))
      .collect();

    const vehicleRatesWithTiers = await Promise.all(
      vehicleRates.map(async (vr) => {
        const tiers = await ctx.db
          .query("mileage_tiers")
          .withIndex("by_vehicle_rate", (q) => q.eq("vehicle_rate_id", vr._id))
          .collect();
        return {
          ...vr,
          tiers: tiers.sort((a, b) => a.from_mile - b.from_mile),
        };
      })
    );

    const surcharges = await ctx.db
      .query("surcharges")
      .withIndex("by_rate_card", (q) => q.eq("rate_card_id", activeCard._id))
      .collect();

    const policySettings = await ctx.db.query("policy_settings").first();

    return {
      rateCard: activeCard,
      vehicleRates: vehicleRatesWithTiers.sort((a, b) => a.sort_order - b.sort_order),
      surcharges,
      policySettings: policySettings || DEFAULT_POLICY_SETTINGS,
    };
  },
});

export const createNewRateCardVersion = mutation({
  args: {
    actorEmail: v.string(),
    note: v.string(),
    vehicleRates: v.array(
      v.object({
        vehicle_slug: v.string(),
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
        tiers: v.array(
          v.object({
            from_mile: v.number(),
            to_mile: v.optional(v.number()),
            per_mile_cents: v.number(),
          })
        ),
      })
    ),
    surcharges: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(v.literal("flat"), v.literal("percent")),
        amount: v.number(),
        is_active: v.boolean(),
        extra_config: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentActive = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    const newVersion = (currentActive?.version || 0) + 1;
    const now = Date.now();

    if (currentActive) {
      await ctx.db.patch(currentActive._id, { is_active: false });
    }

    const newRateCardId = await ctx.db.insert("rate_cards", {
      version: newVersion,
      is_active: true,
      effective_from: now,
      created_by: args.actorEmail,
      created_at: now,
      note: args.note,
    });

    for (const vr of args.vehicleRates) {
      const { tiers, ...rateData } = vr;
      const vrId = await ctx.db.insert("vehicle_rates", {
        rate_card_id: newRateCardId,
        ...rateData,
      });

      for (const tier of tiers) {
        await ctx.db.insert("mileage_tiers", {
          vehicle_rate_id: vrId,
          ...tier,
        });
      }
    }

    for (const s of args.surcharges) {
      await ctx.db.insert("surcharges", {
        rate_card_id: newRateCardId,
        ...s,
      });
    }

    await ctx.db.insert("audit_log", {
      actor_id: args.actorEmail,
      action: "CREATE_RATE_CARD_VERSION",
      entity: "rate_cards",
      entity_id: String(newVersion),
      before_json: currentActive ? JSON.stringify(currentActive) : undefined,
      after_json: JSON.stringify({ version: newVersion, note: args.note }),
      created_at: now,
    });

    return { success: true, version: newVersion, rateCardId: newRateCardId };
  },
});

export const revertToRateCardVersion = mutation({
  args: {
    targetVersion: v.number(),
    actorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const targetCard = await ctx.db
      .query("rate_cards")
      .withIndex("by_version", (q) => q.eq("version", args.targetVersion))
      .first();

    if (!targetCard) {
      throw new Error(`Rate card version ${args.targetVersion} not found`);
    }

    const currentActive = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    if (currentActive) {
      await ctx.db.patch(currentActive._id, { is_active: false });
    }

    await ctx.db.patch(targetCard._id, { is_active: true });

    await ctx.db.insert("audit_log", {
      actor_id: args.actorEmail,
      action: "REVERT_RATE_CARD_VERSION",
      entity: "rate_cards",
      entity_id: String(args.targetVersion),
      before_json: JSON.stringify({ activeVersion: currentActive?.version }),
      after_json: JSON.stringify({ activeVersion: args.targetVersion }),
      created_at: Date.now(),
    });

    return { success: true, activeVersion: args.targetVersion };
  },
});

export const listRateCardVersions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rate_cards").order("desc").take(50);
  },
});

export const updatePolicySettings = mutation({
  args: {
    actorEmail: v.string(),
    free_cancel_hours: v.number(),
    late_cancel_hours: v.number(),
    late_cancel_percent: v.number(),
    imminent_cancel_hours: v.number(),
    imminent_cancel_percent: v.number(),
    no_show_percent: v.number(),
    complimentary_wait_minutes_standard: v.number(),
    complimentary_wait_minutes_airport: v.number(),
    wait_charge_per_minute_cents: v.number(),
    dispatch_locks_cancellation: v.boolean(),
    special_event_deposit_percent: v.number(),
    special_event_deposit_refundable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { actorEmail, ...settingsData } = args;
    const existing = await ctx.db.query("policy_settings").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...settingsData,
        updated_at: now,
        updated_by: actorEmail,
      });
    } else {
      await ctx.db.insert("policy_settings", {
        ...settingsData,
        updated_at: now,
        updated_by: actorEmail,
      });
    }

    await ctx.db.insert("audit_log", {
      actor_id: actorEmail,
      action: "UPDATE_POLICY_SETTINGS",
      entity: "policy_settings",
      entity_id: "global",
      before_json: existing ? JSON.stringify(existing) : undefined,
      after_json: JSON.stringify(settingsData),
      created_at: now,
    });

    return { success: true };
  },
});
