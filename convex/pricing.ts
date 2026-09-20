import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_VEHICLES, DEFAULT_SURCHARGES, DEFAULT_POLICY_SETTINGS } from "./rate_cards";

export interface OptionalServiceItem {
  id: string;
  name: string;
  price: number;
}

export const AVAILABLE_OPTIONAL_SERVICES: OptionalServiceItem[] = [
  { id: "meet_greet", name: "Airport Meet & Greet with Signage", price: 35.0 },
  { id: "child_seat", name: "Child Safety Car Seat", price: 25.0 },
  { id: "extra_stop", name: "Additional Intermediate Stop", price: 30.0 },
  { id: "champagne", name: "Chilled Champagne & Refreshment Package", price: 75.0 },
  { id: "luggage_assist", name: "Executive White-Glove Luggage Concierge", price: 20.0 },
];

export interface ItemizedQuote {
  carTypeName: string;
  carTypeImage: string;
  serviceType: "point_to_point" | "round_trip" | "hourly" | "airport" | "custom";
  distanceKm: number;
  calculatedMiles: number;
  durationMinutes: number;
  baseFare: number;
  perMileRate: number;
  mileageCharge: number;
  timeCharge: number;
  hourlyDuration?: number;
  hourlyRate?: number;
  airportFee: number;
  stopFee: number;
  waitingFee: number;
  optionalServicesFee: number;
  optionalServicesList: OptionalServiceItem[];
  surgeMultiplier: number;
  surgeFee: number;
  discountCode?: string;
  discountAmount: number;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  finalAmount: number;
  currency: string;
  pricingVersion: string;
  quoteTimestamp: number;
  signedQuoteToken?: string;
}

export const getAvailableServices = query({
  args: {},
  handler: async () => {
    return AVAILABLE_OPTIONAL_SERVICES;
  },
});

export const calculateQuote = query({
  args: {
    carTypeName: v.string(),
    distanceKm: v.number(),
    durationMinutes: v.number(),
    serviceType: v.union(
      v.literal("point_to_point"),
      v.literal("round_trip"),
      v.literal("hourly"),
      v.literal("airport"),
      v.literal("custom")
    ),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    pickupAddress: v.optional(v.string()),
    destinationAddress: v.optional(v.string()),
    selectedServiceIds: v.optional(v.array(v.string())),
    discountCode: v.optional(v.string()),
    extraStopsCount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ItemizedQuote> => {
    return await computeAuthoritativeQuote(ctx, args);
  },
});

export const calculateQuoteInternal = internalQuery({
  args: {
    carTypeName: v.string(),
    distanceKm: v.number(),
    durationMinutes: v.number(),
    serviceType: v.union(
      v.literal("point_to_point"),
      v.literal("round_trip"),
      v.literal("hourly"),
      v.literal("airport"),
      v.literal("custom")
    ),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    pickupAddress: v.optional(v.string()),
    destinationAddress: v.optional(v.string()),
    selectedServiceIds: v.optional(v.array(v.string())),
    discountCode: v.optional(v.string()),
    extraStopsCount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ItemizedQuote> => {
    return await computeAuthoritativeQuote(ctx, args);
  },
});

async function computeAuthoritativeQuote(ctx: any, args: any): Promise<ItemizedQuote> {
  let activeRateCardData: any = null;
  try {
    const activeCard = await ctx.db
      .query("rate_cards")
      .withIndex("by_active", (q: any) => q.eq("is_active", true))
      .first();

    if (activeCard) {
      const vehicleRates = await ctx.db
        .query("vehicle_rates")
        .withIndex("by_rate_card", (q: any) => q.eq("rate_card_id", activeCard._id))
        .collect();

      const vehicleRatesWithTiers = await Promise.all(
        vehicleRates.map(async (vr: any) => {
          const tiers = await ctx.db
            .query("mileage_tiers")
            .withIndex("by_vehicle_rate", (q: any) => q.eq("vehicle_rate_id", vr._id))
            .collect();
          return {
            ...vr,
            tiers: tiers.sort((a: any, b: any) => a.from_mile - b.from_mile),
          };
        })
      );

      const surcharges = await ctx.db
        .query("surcharges")
        .withIndex("by_rate_card", (q: any) => q.eq("rate_card_id", activeCard._id))
        .collect();

      activeRateCardData = {
        rateCard: activeCard,
        vehicleRates: vehicleRatesWithTiers,
        surcharges,
      };
    }
  } catch (err) {
    console.warn("Falling back to default rate cards:", err);
  }

  const vehicles = activeRateCardData?.vehicleRates?.length > 0 ? activeRateCardData.vehicleRates : DEFAULT_VEHICLES;
  const surcharges = activeRateCardData?.surcharges?.length > 0 ? activeRateCardData.surcharges : DEFAULT_SURCHARGES;

  // Match vehicle by name or slug
  const matchedVehicle = vehicles.find(
    (v: any) =>
      v.display_name?.toLowerCase() === args.carTypeName?.toLowerCase() ||
      v.vehicle_slug?.toLowerCase() === args.carTypeName?.toLowerCase() ||
      args.carTypeName?.toLowerCase().includes(v.vehicle_slug?.toLowerCase())
  ) || vehicles[0];

  const calculatedMiles = Math.round((args.distanceKm * 0.621371) * 10) / 10;
  const isRoundTrip = args.serviceType === "round_trip";
  const tripMultiplier = isRoundTrip ? 2 : 1;
  const effectiveMiles = calculatedMiles * tripMultiplier;
  const effectiveDuration = args.durationMinutes * tripMultiplier;

  let baseFare = (matchedVehicle.base_fare_cents || 3500) / 100 * tripMultiplier;
  let mileageCharge = 0;
  let timeCharge = 0;
  let hourlyRate = (matchedVehicle.hourly_rate_cents || 15000) / 100;
  let rawTransitCost = 0;

  if (args.serviceType === "hourly") {
    const minHours = matchedVehicle.hourly_minimum_hours || 2;
    const requestedHours = Math.max(minHours, args.hourlyDuration || minHours);
    rawTransitCost = requestedHours * hourlyRate;
    timeCharge = rawTransitCost;
    baseFare = 0;
  } else {
    // Cumulative mileage tiers
    const tiers = matchedVehicle.tiers || [];
    let remaining = effectiveMiles;
    let tierCents = 0;
    if (tiers.length > 0) {
      for (const t of tiers) {
        if (effectiveMiles <= t.from_mile) break;
        const span = t.to_mile !== undefined && t.to_mile !== null ? t.to_mile - t.from_mile : Infinity;
        const inTier = Math.min(remaining, span);
        if (inTier > 0) {
          tierCents += inTier * t.per_mile_cents;
          remaining -= inTier;
        }
        if (remaining <= 0) break;
      }
      mileageCharge = Math.round(tierCents) / 100;
    } else {
      mileageCharge = Math.round(effectiveMiles * (matchedVehicle.per_mile_cents || 450)) / 100;
    }

    if (matchedVehicle.per_minute_cents > 0 && effectiveDuration > 0) {
      timeCharge = Math.round(effectiveDuration * matchedVehicle.per_minute_cents) / 100;
    }
    rawTransitCost = baseFare + mileageCharge + timeCharge;
  }

  // Minimum Fare Floor
  const minFare = ((matchedVehicle.minimum_fare_cents || 7500) / 100) * tripMultiplier;
  if (rawTransitCost < minFare) {
    rawTransitCost = minFare;
  }

  // Surcharges mapping
  const surchargesMap = new Map<string, any>(surcharges.map((s: any) => [s.key, s]));

  // Airport Fee
  let airportFee = 0;
  const isAirport =
    args.serviceType === "airport" ||
    (args.pickupAddress && /airport|sea-tac|seatac|terminal|concourse/i.test(args.pickupAddress)) ||
    (args.destinationAddress && /airport|sea-tac|seatac|terminal|concourse/i.test(args.destinationAddress));
  if (isAirport) {
    const airportPickup = surchargesMap.get("airport_pickup_fee");
    airportFee = (airportPickup && airportPickup.is_active) ? (airportPickup.amount / 100) : 25.0;
  }

  // Additional intermediate stops
  const stopCount = args.extraStopsCount || 0;
  const stopFeeItem = surchargesMap.get("extra_stop");
  const stopFeeRate = (stopFeeItem && stopFeeItem.is_active) ? (stopFeeItem.amount / 100) : 30.0;
  const stopFee = stopCount * stopFeeRate;

  // Optional Services
  const selectedServiceIds: string[] = args.selectedServiceIds || [];
  const optionalServicesList: OptionalServiceItem[] = [];
  let optionalServicesFee = 0;

  for (const sId of selectedServiceIds) {
    const found = AVAILABLE_OPTIONAL_SERVICES.find((s) => s.id === sId);
    if (found) {
      optionalServicesList.push(found);
      optionalServicesFee += found.price;
    }
  }

  // Surge Multiplier
  let surgeMultiplier = 1.0;
  if (args.pickupDate) {
    const dayOfWeek = new Date(args.pickupDate).getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
    if (isWeekend) {
      surgeMultiplier = 1.10;
    }
  }
  const surgeFee = Math.round(rawTransitCost * (surgeMultiplier - 1.0) * 100) / 100;

  // Pre-discount subtotal
  const preDiscountSubtotal = Math.round(
    (rawTransitCost + surgeFee + airportFee + stopFee + optionalServicesFee) * 100
  ) / 100;

  // Promo Discount
  let discountAmount = 0;
  let cleanDiscountCode: string | undefined = undefined;

  if (args.discountCode && args.discountCode.trim()) {
    const clean = args.discountCode.trim().toUpperCase();
    const discountRecord = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q: any) => q.eq("code", clean))
      .first();

    if (
      discountRecord &&
      discountRecord.isActive &&
      (!discountRecord.expiryDate || new Date(discountRecord.expiryDate).getTime() > Date.now()) &&
      (!discountRecord.maxUses || discountRecord.timesUsed < discountRecord.maxUses) &&
      (!discountRecord.minSpend || preDiscountSubtotal >= discountRecord.minSpend)
    ) {
      cleanDiscountCode = discountRecord.code;
      if (discountRecord.discountType === "percentage") {
        discountAmount = Math.round((preDiscountSubtotal * (discountRecord.value / 100)) * 100) / 100;
      } else {
        discountAmount = Math.min(discountRecord.value, preDiscountSubtotal);
      }
    }
  }

  const subtotal = Math.max(0, Math.round((preDiscountSubtotal - discountAmount) * 100) / 100);

  // Washington Sales Tax
  const taxSurcharge = surchargesMap.get("wa_sales_tax");
  const taxRatePercent = (taxSurcharge && taxSurcharge.is_active) ? (taxSurcharge.amount / 100) : 10.25;
  const taxAmount = Math.round(subtotal * (taxRatePercent / 100) * 100) / 100;
  const finalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    carTypeName: matchedVehicle.display_name || args.carTypeName,
    carTypeImage: matchedVehicle.image || "/luxury_suv.png",
    serviceType: args.serviceType,
    distanceKm: args.distanceKm,
    calculatedMiles: effectiveMiles,
    durationMinutes: effectiveDuration,
    baseFare: Math.round(baseFare * 100) / 100,
    perMileRate: (matchedVehicle.per_mile_cents || 450) / 100,
    mileageCharge,
    timeCharge,
    hourlyDuration: args.hourlyDuration,
    hourlyRate,
    airportFee,
    stopFee,
    waitingFee: 0,
    optionalServicesFee,
    optionalServicesList,
    surgeMultiplier,
    surgeFee,
    discountCode: cleanDiscountCode,
    discountAmount,
    subtotal,
    taxRatePercent,
    taxAmount,
    finalAmount,
    currency: "USD",
    pricingVersion: "v2.0-tiered",
    quoteTimestamp: Date.now(),
  };
}
