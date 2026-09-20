import {
  TripQuoteParams,
  PricingQuoteResult,
  LineItem,
  MileageTier,
  VehicleRateData,
  SurchargeData,
} from "./types";
import { verifySignedQuoteToken } from "./quoteToken";

export const DEFAULT_VEHICLES: VehicleRateData[] = [
  {
    vehicle_slug: "escalade-esv",
    display_name: "Cadillac Escalade ESV",
    base_fare_cents: 4000,
    per_mile_cents: 450,
    per_minute_cents: 80,
    hourly_rate_cents: 18000,
    hourly_minimum_hours: 2,
    minimum_fare_cents: 12000,
    max_passengers: 6,
    max_bags: 6,
    is_bookable: true,
    sort_order: 1,
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
    base_fare_cents: 3500,
    per_mile_cents: 380,
    per_minute_cents: 65,
    hourly_rate_cents: 15000,
    hourly_minimum_hours: 2,
    minimum_fare_cents: 10000,
    max_passengers: 3,
    max_bags: 3,
    is_bookable: true,
    sort_order: 2,
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
    base_fare_cents: 4000,
    per_mile_cents: 450,
    per_minute_cents: 80,
    hourly_rate_cents: 18000,
    hourly_minimum_hours: 2,
    minimum_fare_cents: 12000,
    max_passengers: 6,
    max_bags: 6,
    is_bookable: true,
    sort_order: 3,
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
    base_fare_cents: 6500,
    per_mile_cents: 550,
    per_minute_cents: 100,
    hourly_rate_cents: 22000,
    hourly_minimum_hours: 3,
    minimum_fare_cents: 18000,
    max_passengers: 14,
    max_bags: 14,
    is_bookable: true,
    sort_order: 4,
    tiers: [
      { from_mile: 0, to_mile: 10, per_mile_cents: 750 },
      { from_mile: 10, to_mile: 30, per_mile_cents: 650 },
      { from_mile: 30, to_mile: 75, per_mile_cents: 550 },
      { from_mile: 75, to_mile: undefined, per_mile_cents: 495 },
    ],
  },
];

export const DEFAULT_SURCHARGES: SurchargeData[] = [
  { key: "airport_pickup_fee", label: "Sea-Tac Airport Pickup Fee", type: "flat", amount: 2500, is_active: true },
  { key: "airport_dropoff_fee", label: "Sea-Tac Airport Dropoff Fee", type: "flat", amount: 1500, is_active: true },
  { key: "meet_and_greet", label: "Airport Meet & Greet with Baggage Escort", type: "flat", amount: 3500, is_active: true },
  { key: "extra_stop", label: "Additional Intermediate Stop", type: "flat", amount: 3000, is_active: true },
  { key: "child_seat", label: "Forward/Rear Facing Child Safety Seat", type: "flat", amount: 2500, is_active: true },
  { key: "after_hours", label: "After-Hours Service (11:00 PM - 5:00 AM)", type: "flat", amount: 3500, is_active: true },
  { key: "holiday_surcharge", label: "Holiday Premium", type: "percent", amount: 2000, is_active: false },
  { key: "wa_sales_tax", label: "Washington State Sales & Transit Tax", type: "percent", amount: 1025, is_active: true },
  { key: "default_gratuity", label: "Chauffeur Gratuity (Customer Adjustable)", type: "percent", amount: 2000, is_active: true },
];

export function getVehicleRateCard(vehicleKeyOrSlug?: string): VehicleRateData {
  if (!vehicleKeyOrSlug) return DEFAULT_VEHICLES[1]; // default S-Class
  const clean = vehicleKeyOrSlug.toLowerCase();
  const matched = DEFAULT_VEHICLES.find(
    (v) => v.vehicle_slug === clean || v.display_name.toLowerCase().includes(clean)
  );
  return matched || DEFAULT_VEHICLES[1];
}

export function verifyQuoteToken(token: string) {
  // Synchronously or decode payload check
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      return payload;
    }
  } catch {}
  return null;
}

/**
 * Calculates cumulative mileage charges across distance tiers.
 * e.g. 22 miles with tiers [0-10 @ $6.50, 10-30 @ $5.25]
 * = (10 mi * $6.50) + (12 mi * $5.25) = $65.00 + $63.00 = $128.00
 */
export function calculateCumulativeMileageCents(
  distanceMiles: number,
  tiers: MileageTier[],
  fallbackPerMileCents: number
): { totalMileageCents: number; tierBreakdowns: LineItem[] } {
  if (distanceMiles <= 0) {
    return { totalMileageCents: 0, tierBreakdowns: [] };
  }

  if (!tiers || tiers.length === 0) {
    const amount = Math.round(distanceMiles * fallbackPerMileCents);
    return {
      totalMileageCents: amount,
      tierBreakdowns: [
        {
          id: "mileage_flat",
          label: `Distance Charge (${distanceMiles.toFixed(1)} miles @ $${(fallbackPerMileCents / 100).toFixed(2)}/mi)`,
          amount_cents: amount,
        },
      ],
    };
  }

  // Sort tiers by from_mile
  const sortedTiers = [...tiers].sort((a, b) => a.from_mile - b.from_mile);
  let remainingMiles = distanceMiles;
  let totalMileageCents = 0;
  const tierBreakdowns: LineItem[] = [];

  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    if (distanceMiles <= tier.from_mile) {
      break;
    }

    const tierStart = tier.from_mile;
    const tierEnd = tier.to_mile !== undefined && tier.to_mile !== null ? tier.to_mile : Infinity;
    const tierSpan = tierEnd - tierStart;

    const milesInThisTier = Math.min(remainingMiles, tierSpan);
    if (milesInThisTier > 0) {
      const tierChargeCents = Math.round(milesInThisTier * tier.per_mile_cents);
      totalMileageCents += tierChargeCents;
      remainingMiles -= milesInThisTier;

      tierBreakdowns.push({
        id: `mileage_tier_${i + 1}`,
        label: `Mileage Tier ${i + 1} (${tierStart}–${tierEnd === Infinity ? "+" : tierEnd} mi): ${milesInThisTier.toFixed(1)} mi @ $${(tier.per_mile_cents / 100).toFixed(2)}/mi`,
        amount_cents: tierChargeCents,
      });
    }

    if (remainingMiles <= 0) break;
  }

  return { totalMileageCents, tierBreakdowns };
}

/**
 * Rounds hours up to nearest 15-minute increment (0.25h).
 */
export function roundHourlyToQuarterHour(hours: number): number {
  if (hours <= 0) return 0;
  return Math.ceil(hours * 4) / 4;
}

/**
 * Checks if a UTC timestamp falls into the Seattle local after-hours window (11:00 PM - 5:00 AM).
 */
export function isSeattleAfterHours(timestampUtc: number): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    });
    const hour = parseInt(formatter.format(new Date(timestampUtc)), 10);
    return hour >= 23 || hour < 5;
  } catch {
    return false;
  }
}

/**
 * Pure, framework-free pricing calculation function.
 * Returns exact line-item breakdown with integer cents.
 */
export function calculateTripQuote(params: TripQuoteParams): PricingQuoteResult {
  const line_items: LineItem[] = [];
  const {
    trip_type,
    vehicle_class,
    distance_miles,
    duration_minutes,
    hourly_hours = 0,
    pickup_datetime,
    pickup_datetime_utc = pickup_datetime ? new Date(pickup_datetime).getTime() : Date.now(),
    is_airport_pickup = false,
    is_airport_dropoff = false,
    meet_and_greet = false,
    child_seats = 0,
    child_seats_count = child_seats,
    extra_stops = 0,
    extra_stops_count = extra_stops,
    gratuity_percent = 20,
    discount_code,
    discount_amount_cents = 0,
    optional_services = [],
    active_surcharges = DEFAULT_SURCHARGES,
    rate_card_version = 1,
  } = params;

  const vehicle = params.vehicle || getVehicleRateCard(vehicle_class || "s-class");

  let baseFareCents = 0;
  let mileageChargeCents = 0;
  let timeChargeCents = 0;
  let surchargesTotalCents = 0;

  // Round trip multiplier
  const tripMultiplier = trip_type === "round_trip" ? 2 : 1;
  const effectiveDistanceMiles = distance_miles * tripMultiplier;
  const effectiveDurationMinutes = duration_minutes * tripMultiplier;

  if (trip_type === "hourly") {
    // Hourly charter calculation
    const effectiveHours = Math.max(
      roundHourlyToQuarterHour(hourly_hours),
      vehicle.hourly_minimum_hours
    );
    const hourlyChargeCents = Math.round(effectiveHours * vehicle.hourly_rate_cents);
    baseFareCents = hourlyChargeCents;

    line_items.push({
      id: "hourly_base",
      label: `${vehicle.display_name} Private Charter (${effectiveHours} hrs @ $${(vehicle.hourly_rate_cents / 100).toFixed(2)}/hr)`,
      amount_cents: hourlyChargeCents,
    });
  } else {
    // Point-to-point, Round-trip, Airport transfer, or Custom
    // 1. Base flag drop fare
    if (vehicle.base_fare_cents > 0) {
      const totalBaseFare = vehicle.base_fare_cents * tripMultiplier;
      baseFareCents = totalBaseFare;
      line_items.push({
        id: "base_fare",
        label: trip_type === "round_trip"
          ? `${vehicle.display_name} Base Fare (Round Trip)`
          : `${vehicle.display_name} Base Fare`,
        amount_cents: totalBaseFare,
      });
    }

    // 2. Cumulative mileage tiers
    const { totalMileageCents, tierBreakdowns } = calculateCumulativeMileageCents(
      effectiveDistanceMiles,
      vehicle.tiers,
      vehicle.per_mile_cents
    );
    mileageChargeCents = totalMileageCents;
    line_items.push(...tierBreakdowns);

    // 3. Duration / Traffic time charge (if per_minute_cents configured)
    if (vehicle.per_minute_cents > 0 && effectiveDurationMinutes > 0) {
      const timeCharge = Math.round(effectiveDurationMinutes * vehicle.per_minute_cents);
      timeChargeCents = timeCharge;
      line_items.push({
        id: "time_charge",
        label: `Estimated Travel Time (${Math.round(effectiveDurationMinutes)} mins @ $${(vehicle.per_minute_cents / 100).toFixed(2)}/min)`,
        amount_cents: timeCharge,
      });
    }
  }

  let runningSubtotalCents = baseFareCents + mileageChargeCents + timeChargeCents;

  // 4. Flat Surcharges
  const surchargesByKey = new Map(active_surcharges.map((s) => [s.key, s]));

  // Sea-Tac Airport Pickup
  if ((trip_type === "airport" || is_airport_pickup) && surchargesByKey.has("airport_pickup_fee")) {
    const s = surchargesByKey.get("airport_pickup_fee")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      surchargesTotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Sea-Tac Airport Dropoff
  if (is_airport_dropoff && surchargesByKey.has("airport_dropoff_fee")) {
    const s = surchargesByKey.get("airport_dropoff_fee")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      surchargesTotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Meet and Greet
  if (meet_and_greet && surchargesByKey.has("meet_and_greet")) {
    const s = surchargesByKey.get("meet_and_greet")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      surchargesTotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Child Safety Seats
  if (child_seats_count > 0 && surchargesByKey.has("child_seat")) {
    const s = surchargesByKey.get("child_seat")!;
    if (s.is_active && s.amount > 0) {
      const amount = s.amount * child_seats_count;
      runningSubtotalCents += amount;
      surchargesTotalCents += amount;
      line_items.push({
        id: s.key,
        label: `${s.label} (×${child_seats_count})`,
        amount_cents: amount,
      });
    }
  }

  // Extra Intermediate Stops
  if (extra_stops_count > 0 && surchargesByKey.has("extra_stop")) {
    const s = surchargesByKey.get("extra_stop")!;
    if (s.is_active && s.amount > 0) {
      const amount = s.amount * extra_stops_count;
      runningSubtotalCents += amount;
      surchargesTotalCents += amount;
      line_items.push({
        id: s.key,
        label: `${s.label} (×${extra_stops_count})`,
        amount_cents: amount,
      });
    }
  }

  // Optional Add-on Services
  if (optional_services && optional_services.length > 0) {
    for (const opt of optional_services) {
      if (opt.price_cents > 0) {
        runningSubtotalCents += opt.price_cents;
        surchargesTotalCents += opt.price_cents;
        line_items.push({
          id: `opt_${opt.id}`,
          label: opt.name,
          amount_cents: opt.price_cents,
        });
      }
    }
  }

  // After-Hours Service (11:00 PM - 5:00 AM)
  if (isSeattleAfterHours(pickup_datetime_utc) && surchargesByKey.has("after_hours")) {
    const s = surchargesByKey.get("after_hours")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      surchargesTotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // 5. Percentage Surcharges (e.g. Weekend / Holiday)
  for (const s of active_surcharges) {
    if (s.type === "percent" && s.is_active && s.key !== "wa_sales_tax" && s.key !== "default_gratuity") {
      const percentCharge = Math.round(runningSubtotalCents * (s.amount / 10000));
      if (percentCharge > 0) {
        runningSubtotalCents += percentCharge;
        surchargesTotalCents += percentCharge;
        line_items.push({
          id: s.key,
          label: `${s.label} (${(s.amount / 100).toFixed(1)}%)`,
          amount_cents: percentCharge,
        });
      }
    }
  }

  // 6. Minimum Fare Floor Enforcement
  const effectiveMinFareCents = vehicle.minimum_fare_cents * tripMultiplier;
  if (effectiveMinFareCents > 0 && runningSubtotalCents < effectiveMinFareCents) {
    const diff = effectiveMinFareCents - runningSubtotalCents;
    runningSubtotalCents = effectiveMinFareCents;
    line_items.push({
      id: "min_fare_adjustment",
      label: `Minimum Fare Adjustment (Floor: $${(effectiveMinFareCents / 100).toFixed(2)})`,
      amount_cents: diff,
    });
  }

  // 7. Promotional Discount Deductions
  let discountCents = 0;
  if (discount_amount_cents > 0) {
    discountCents = Math.min(discount_amount_cents, runningSubtotalCents);
    runningSubtotalCents -= discountCents;
    line_items.push({
      id: "promo_discount",
      label: `Promotional Discount (${discount_code || "PROMO"})`,
      amount_cents: -discountCents,
    });
  }

  const subtotal_cents = Math.max(0, runningSubtotalCents);

  // 8. Gratuity (customer-adjustable percentage on subtotal)
  const safeGratuityPercent = Math.max(0, Math.min(100, gratuity_percent));
  const gratuity_cents = Math.round(subtotal_cents * (safeGratuityPercent / 100));
  if (gratuity_cents > 0) {
    line_items.push({
      id: "gratuity",
      label: `Chauffeur Gratuity (${safeGratuityPercent}%)`,
      amount_cents: gratuity_cents,
    });
  }

  // 9. Washington State Sales & Transit Tax
  const taxSurcharge = surchargesByKey.get("wa_sales_tax");
  const taxRateBasisPoints = taxSurcharge && taxSurcharge.is_active ? taxSurcharge.amount : 1025; // 10.25%
  const tax_rate_percent = taxRateBasisPoints / 100;
  const tax_cents = Math.round(subtotal_cents * (taxRateBasisPoints / 10000));
  if (tax_cents > 0) {
    line_items.push({
      id: "wa_sales_tax",
      label: `Washington State Sales Tax (${tax_rate_percent.toFixed(2)}%)`,
      amount_cents: tax_cents,
    });
  }

  // Final Total in Integer Cents
  const total_cents = subtotal_cents + gratuity_cents + tax_cents;
  const final_amount_dollars = Math.round((total_cents / 100) * 100) / 100;

  const now = Date.now();
  const expires_at = now + 15 * 60 * 1000; // 15-minute quote lock

  return {
    vehicle_slug: vehicle.vehicle_slug,
    display_name: vehicle.display_name,
    trip_type,
    rate_card_version,
    distance_miles: effectiveDistanceMiles,
    duration_minutes: effectiveDurationMinutes,
    line_items,
    base_fare_cents: baseFareCents,
    mileage_charge_cents: mileageChargeCents,
    time_charge_cents: timeChargeCents,
    surcharges_total_cents: surchargesTotalCents,
    discount_cents: discountCents,
    discount_code,
    subtotal_cents,
    gratuity_cents,
    gratuity_percent: safeGratuityPercent,
    tax_cents,
    tax_rate_percent,
    total_cents,
    final_amount_dollars,
    currency: "USD",
    created_at: now,
    expires_at,
  };
}
