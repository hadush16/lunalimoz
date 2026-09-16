import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
  serviceType: "point_to_point" | "hourly";
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
    serviceType: v.union(v.literal("point_to_point"), v.literal("hourly")),
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
    serviceType: v.union(v.literal("point_to_point"), v.literal("hourly")),
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
  const carType = await ctx.db
    .query("carTypes")
    .withIndex("by_name", (q: any) => q.eq("name", args.carTypeName))
    .first();

  if (!carType) {
    throw new Error(`Vehicle class "${args.carTypeName}" not found.`);
  }

  const settings = await ctx.db.query("settings").first();

  // Mileage conversion
  const calculatedMiles = Math.round((args.distanceKm * 0.621371) * 10) / 10;
  const perMileRate = carType.perMileRate || (carType.perKmRate ? carType.perKmRate * 1.60934 : 4.0);
  const baseFare = carType.baseFare || 35.0;

  // Surge and Date evaluation
  let surgeMultiplier = settings?.surgeMultiplier || 1.0;
  if (args.pickupDate) {
    const dayOfWeek = new Date(args.pickupDate).getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5; // Fri/Sat/Sun
    if (isWeekend && settings?.weekendSurgeMultiplier && settings.weekendSurgeMultiplier > 1.0) {
      surgeMultiplier = Math.max(surgeMultiplier, settings.weekendSurgeMultiplier);
    }
  }

  let mileageCharge = 0;
  let timeCharge = 0;
  let hourlyRate = carType.hourlyRate || 150.0;
  let rawTransitCost = 0;

  if (args.serviceType === "hourly") {
    const minHours = carType.hourlyMin || 2;
    const requestedHours = Math.max(minHours, args.hourlyDuration || minHours);
    rawTransitCost = requestedHours * hourlyRate * (carType.multiplier || 1.0);
    timeCharge = Math.round(rawTransitCost * 100) / 100;
  } else {
    const effectiveMiles = Math.max(carType.minMiles || 0, calculatedMiles);
    mileageCharge = Math.round((effectiveMiles * perMileRate * (carType.multiplier || 1.0)) * 100) / 100;
    timeCharge = Math.round((args.durationMinutes * (carType.perMinuteRate || 0.5) * (carType.multiplier || 1.0)) * 100) / 100;
    rawTransitCost = baseFare + mileageCharge + timeCharge;
  }

  // Minimum fare check
  const minFare = Math.max(carType.minFare || 0, settings?.minimumFare || 50.0);
  if (rawTransitCost < minFare) {
    rawTransitCost = minFare;
  }

  // Airport Fee detection
  let airportFee = 0;
  const isAirport =
    (args.pickupAddress && /airport|sea-tac|seatac|terminal|concourse/i.test(args.pickupAddress)) ||
    (args.destinationAddress && /airport|sea-tac|seatac|terminal|concourse/i.test(args.destinationAddress));
  if (isAirport) {
    airportFee = settings?.baseAirportFee ?? 20.0;
  }

  // Additional stops
  const stopCount = args.extraStopsCount || 0;
  const stopFee = stopCount * (settings?.additionalStopFee ?? 30.0);

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

  // Waiting fee (default 0 for standard reservations)
  const waitingFee = 0;

  // Surge Fee calculation
  const surgeFee = Math.round((rawTransitCost * (surgeMultiplier - 1.0)) * 100) / 100;

  // Pre-discount subtotal
  const preDiscountSubtotal = Math.round(
    (rawTransitCost + surgeFee + airportFee + stopFee + waitingFee + optionalServicesFee) * 100
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

  // Taxes
  const taxRatePercent = settings?.taxRatePercent ?? 10.25; // Seattle/WA combined local rate standard or 0 if all-inclusive
  const taxAmount = Math.round((subtotal * (taxRatePercent / 100)) * 100) / 100;
  const finalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    carTypeName: carType.name,
    carTypeImage: carType.image,
    serviceType: args.serviceType,
    distanceKm: args.distanceKm,
    calculatedMiles,
    durationMinutes: args.durationMinutes,
    baseFare,
    perMileRate,
    mileageCharge,
    timeCharge,
    hourlyDuration: args.serviceType === "hourly" ? args.hourlyDuration || 2 : undefined,
    hourlyRate: args.serviceType === "hourly" ? hourlyRate : undefined,
    airportFee,
    stopFee,
    waitingFee,
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
    pricingVersion: "v2.0-luna-engine",
    quoteTimestamp: Date.now(),
  };
}
