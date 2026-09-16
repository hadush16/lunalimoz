import {
  TripQuoteParams,
  PricingQuoteResult,
  LineItem,
  MileageTier,
} from "./types";

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
    vehicle,
    distance_miles,
    duration_minutes,
    hourly_hours = 0,
    pickup_datetime_utc,
    is_airport_pickup = false,
    is_airport_dropoff = false,
    meet_and_greet = false,
    child_seats_count = 0,
    extra_stops_count = 0,
    gratuity_percent = 20,
    active_surcharges = [],
    rate_card_version,
  } = params;

  let baseRateCents = 0;

  if (trip_type === "hourly") {
    // Hourly charter calculation
    const effectiveHours = Math.max(
      roundHourlyToQuarterHour(hourly_hours),
      vehicle.hourly_minimum_hours
    );
    const hourlyChargeCents = Math.round(effectiveHours * vehicle.hourly_rate_cents);
    baseRateCents = hourlyChargeCents;

    line_items.push({
      id: "hourly_base",
      label: `${vehicle.display_name} Charter (${effectiveHours} hrs @ $${(vehicle.hourly_rate_cents / 100).toFixed(2)}/hr)`,
      amount_cents: hourlyChargeCents,
    });
  } else {
    // Point-to-point or Airport transfer calculation
    // 1. Base fare
    if (vehicle.base_fare_cents > 0) {
      baseRateCents += vehicle.base_fare_cents;
      line_items.push({
        id: "base_fare",
        label: `${vehicle.display_name} Base Fare`,
        amount_cents: vehicle.base_fare_cents,
      });
    }

    // 2. Cumulative mileage tiers
    const { totalMileageCents, tierBreakdowns } = calculateCumulativeMileageCents(
      distance_miles,
      vehicle.tiers,
      vehicle.per_mile_cents
    );
    baseRateCents += totalMileageCents;
    line_items.push(...tierBreakdowns);

    // 3. Duration / Traffic time charge (if per_minute_cents configured)
    if (vehicle.per_minute_cents > 0 && duration_minutes > 0) {
      const timeChargeCents = Math.round(duration_minutes * vehicle.per_minute_cents);
      baseRateCents += timeChargeCents;
      line_items.push({
        id: "time_charge",
        label: `Estimated Travel Time (${Math.round(duration_minutes)} mins @ $${(vehicle.per_minute_cents / 100).toFixed(2)}/min)`,
        amount_cents: timeChargeCents,
      });
    }
  }

  let runningSubtotalCents = baseRateCents;

  // 4. Flat Surcharges
  const surchargesByKey = new Map(active_surcharges.map((s) => [s.key, s]));

  // Sea-Tac Airport Pickup
  if ((trip_type === "airport" || is_airport_pickup) && surchargesByKey.has("airport_pickup_fee")) {
    const s = surchargesByKey.get("airport_pickup_fee")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Sea-Tac Airport Dropoff
  if (is_airport_dropoff && surchargesByKey.has("airport_dropoff_fee")) {
    const s = surchargesByKey.get("airport_dropoff_fee")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Meet and Greet
  if (meet_and_greet && surchargesByKey.has("meet_and_greet")) {
    const s = surchargesByKey.get("meet_and_greet")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // Child Seats
  if (child_seats_count > 0 && surchargesByKey.has("child_seat")) {
    const s = surchargesByKey.get("child_seat")!;
    if (s.is_active && s.amount > 0) {
      const amount = s.amount * child_seats_count;
      runningSubtotalCents += amount;
      line_items.push({
        id: s.key,
        label: `${s.label} (×${child_seats_count})`,
        amount_cents: amount,
      });
    }
  }

  // Extra Stops
  if (extra_stops_count > 0 && surchargesByKey.has("extra_stop")) {
    const s = surchargesByKey.get("extra_stop")!;
    if (s.is_active && s.amount > 0) {
      const amount = s.amount * extra_stops_count;
      runningSubtotalCents += amount;
      line_items.push({
        id: s.key,
        label: `${s.label} (×${extra_stops_count})`,
        amount_cents: amount,
      });
    }
  }

  // After-Hours Service
  if (isSeattleAfterHours(pickup_datetime_utc) && surchargesByKey.has("after_hours")) {
    const s = surchargesByKey.get("after_hours")!;
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, label: s.label, amount_cents: s.amount });
    }
  }

  // 5. Percentage Surcharges (e.g. Holiday)
  for (const s of active_surcharges) {
    if (s.type === "percent" && s.is_active && s.key !== "wa_sales_tax" && s.key !== "default_gratuity") {
      const percentCharge = Math.round(runningSubtotalCents * (s.amount / 10000));
      if (percentCharge > 0) {
        runningSubtotalCents += percentCharge;
        line_items.push({
          id: s.key,
          label: `${s.label} (${(s.amount / 100).toFixed(1)}%)`,
          amount_cents: percentCharge,
        });
      }
    }
  }

  // 6. Minimum Fare Floor Enforcement
  if (vehicle.minimum_fare_cents > 0 && runningSubtotalCents < vehicle.minimum_fare_cents) {
    const diff = vehicle.minimum_fare_cents - runningSubtotalCents;
    runningSubtotalCents = vehicle.minimum_fare_cents;
    line_items.push({
      id: "min_fare_adjustment",
      label: `Minimum Fare Adjustment (Floor: $${(vehicle.minimum_fare_cents / 100).toFixed(2)})`,
      amount_cents: diff,
    });
  }

  const subtotal_cents = runningSubtotalCents;

  // 7. Gratuity (customer-adjustable percentage on subtotal)
  const safeGratuityPercent = Math.max(0, Math.min(100, gratuity_percent));
  const gratuity_cents = Math.round(subtotal_cents * (safeGratuityPercent / 100));
  if (gratuity_cents > 0) {
    line_items.push({
      id: "gratuity",
      label: `Chauffeur Gratuity (${safeGratuityPercent}%)`,
      amount_cents: gratuity_cents,
    });
  }

  // 8. Washington State Sales & Transit Tax
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

  const now = Date.now();
  const expires_at = now + 15 * 60 * 1000; // 15-minute quote lock

  return {
    vehicle_slug: vehicle.vehicle_slug,
    display_name: vehicle.display_name,
    trip_type,
    rate_card_version,
    distance_miles,
    duration_minutes,
    line_items,
    subtotal_cents,
    gratuity_cents,
    gratuity_percent: safeGratuityPercent,
    tax_cents,
    tax_rate_percent,
    total_cents,
    created_at: now,
    expires_at,
  };
}
