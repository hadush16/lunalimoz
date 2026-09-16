// Pure ESM Unit Test Runner for Pricing and Cancellation Engines

function calculateCumulativeMileageCents(distanceMiles, tiers, fallbackPerMileCents) {
  if (distanceMiles <= 0) return { totalMileageCents: 0, tierBreakdowns: [] };
  if (!tiers || tiers.length === 0) {
    const amount = Math.round(distanceMiles * fallbackPerMileCents);
    return {
      totalMileageCents: amount,
      tierBreakdowns: [{ id: "mileage_flat", amount_cents: amount }],
    };
  }
  const sortedTiers = [...tiers].sort((a, b) => a.from_mile - b.from_mile);
  let remainingMiles = distanceMiles;
  let totalMileageCents = 0;
  const tierBreakdowns = [];

  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    if (distanceMiles <= tier.from_mile) break;
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
        amount_cents: tierChargeCents,
      });
    }
    if (remainingMiles <= 0) break;
  }
  return { totalMileageCents, tierBreakdowns };
}

function calculateTripQuote(params) {
  const line_items = [];
  const {
    trip_type,
    vehicle,
    distance_miles,
    duration_minutes,
    hourly_hours = 0,
    is_airport_pickup = false,
    is_airport_dropoff = false,
    meet_and_greet = false,
    child_seats_count = 0,
    extra_stops_count = 0,
    gratuity_percent = 20,
    active_surcharges = [],
    rate_card_version = 1,
  } = params;

  let baseRateCents = 0;

  if (trip_type === "hourly") {
    const effectiveHours = Math.max(Math.ceil(hourly_hours * 4) / 4, vehicle.hourly_minimum_hours);
    const hourlyChargeCents = Math.round(effectiveHours * vehicle.hourly_rate_cents);
    baseRateCents = hourlyChargeCents;
    line_items.push({ id: "hourly_base", amount_cents: hourlyChargeCents });
  } else {
    if (vehicle.base_fare_cents > 0) {
      baseRateCents += vehicle.base_fare_cents;
      line_items.push({ id: "base_fare", amount_cents: vehicle.base_fare_cents });
    }
    const { totalMileageCents, tierBreakdowns } = calculateCumulativeMileageCents(
      distance_miles,
      vehicle.tiers,
      vehicle.per_mile_cents
    );
    baseRateCents += totalMileageCents;
    line_items.push(...tierBreakdowns);

    if (vehicle.per_minute_cents > 0 && duration_minutes > 0) {
      const timeChargeCents = Math.round(duration_minutes * vehicle.per_minute_cents);
      baseRateCents += timeChargeCents;
      line_items.push({ id: "time_charge", amount_cents: timeChargeCents });
    }
  }

  let runningSubtotalCents = baseRateCents;
  const surchargesByKey = new Map(active_surcharges.map((s) => [s.key, s]));

  if ((trip_type === "airport" || is_airport_pickup) && surchargesByKey.has("airport_pickup_fee")) {
    const s = surchargesByKey.get("airport_pickup_fee");
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, amount_cents: s.amount });
    }
  }

  if (meet_and_greet && surchargesByKey.has("meet_and_greet")) {
    const s = surchargesByKey.get("meet_and_greet");
    if (s.is_active && s.amount > 0) {
      runningSubtotalCents += s.amount;
      line_items.push({ id: s.key, amount_cents: s.amount });
    }
  }

  if (child_seats_count > 0 && surchargesByKey.has("child_seat")) {
    const s = surchargesByKey.get("child_seat");
    if (s.is_active && s.amount > 0) {
      const amt = s.amount * child_seats_count;
      runningSubtotalCents += amt;
      line_items.push({ id: s.key, amount_cents: amt });
    }
  }

  if (extra_stops_count > 0 && surchargesByKey.has("extra_stop")) {
    const s = surchargesByKey.get("extra_stop");
    if (s.is_active && s.amount > 0) {
      const amt = s.amount * extra_stops_count;
      runningSubtotalCents += amt;
      line_items.push({ id: s.key, amount_cents: amt });
    }
  }

  if (vehicle.minimum_fare_cents > 0 && runningSubtotalCents < vehicle.minimum_fare_cents) {
    const diff = vehicle.minimum_fare_cents - runningSubtotalCents;
    runningSubtotalCents = vehicle.minimum_fare_cents;
    line_items.push({ id: "min_fare_adjustment", amount_cents: diff });
  }

  const subtotal_cents = runningSubtotalCents;
  const safeGratuityPercent = Math.max(0, Math.min(100, gratuity_percent));
  const gratuity_cents = Math.round(subtotal_cents * (safeGratuityPercent / 100));
  if (gratuity_cents > 0) {
    line_items.push({ id: "gratuity", amount_cents: gratuity_cents });
  }

  const taxSurcharge = surchargesByKey.get("wa_sales_tax");
  const taxRateBasisPoints = taxSurcharge && taxSurcharge.is_active ? taxSurcharge.amount : 1025;
  const tax_cents = Math.round(subtotal_cents * (taxRateBasisPoints / 10000));
  if (tax_cents > 0) {
    line_items.push({ id: "wa_sales_tax", amount_cents: tax_cents });
  }

  const total_cents = subtotal_cents + gratuity_cents + tax_cents;
  return { line_items, subtotal_cents, gratuity_cents, tax_cents, total_cents };
}

function evaluateCancellationFee(input) {
  const { pickup_datetime_utc, current_time_utc = Date.now(), booking_total_cents, policy_settings, dispatched_at, is_no_show } = input;
  const totalPaid = Math.max(0, booking_total_cents);

  if (is_no_show) {
    return { fee_percentage: 100, cancellation_fee_cents: totalPaid, refund_cents: 0 };
  }
  if (dispatched_at && policy_settings.dispatch_locks_cancellation) {
    return { fee_percentage: 100, cancellation_fee_cents: totalPaid, refund_cents: 0 };
  }

  const diffMs = pickup_datetime_utc - current_time_utc;
  const hours_remaining = diffMs / (1000 * 60 * 60);

  let fee_percentage = 0;
  if (hours_remaining >= policy_settings.free_cancel_hours) {
    fee_percentage = 0;
  } else if (hours_remaining >= policy_settings.imminent_cancel_hours) {
    fee_percentage = policy_settings.late_cancel_percent;
  } else {
    fee_percentage = policy_settings.imminent_cancel_percent;
  }

  const cancellation_fee_cents = Math.round(totalPaid * (fee_percentage / 100));
  const refund_cents = Math.max(0, totalPaid - cancellation_fee_cents);
  return { fee_percentage, cancellation_fee_cents, refund_cents, hours_remaining };
}

// Test Execution
const testEscalade = {
  vehicle_slug: "escalade-esv",
  display_name: "Cadillac Escalade ESV",
  base_fare_cents: 4000,
  per_mile_cents: 450,
  per_minute_cents: 80,
  hourly_rate_cents: 18000,
  hourly_minimum_hours: 2,
  minimum_fare_cents: 12000,
  tiers: [
    { from_mile: 0, to_mile: 10, per_mile_cents: 650 },
    { from_mile: 10, to_mile: 30, per_mile_cents: 525 },
    { from_mile: 30, to_mile: 75, per_mile_cents: 450 },
    { from_mile: 75, to_mile: undefined, per_mile_cents: 395 },
  ],
};

const testSurcharges = [
  { key: "airport_pickup_fee", label: "Airport Pickup", type: "flat", amount: 2500, is_active: true },
  { key: "meet_and_greet", label: "Meet and Greet", type: "flat", amount: 3500, is_active: true },
  { key: "child_seat", label: "Child Seat", type: "flat", amount: 2500, is_active: true },
  { key: "extra_stop", label: "Extra Stop", type: "flat", amount: 3000, is_active: true },
  { key: "wa_sales_tax", label: "WA Sales Tax", type: "percent", amount: 1025, is_active: true },
  { key: "default_gratuity", label: "Gratuity", type: "percent", amount: 2000, is_active: true },
];

const testPolicy = {
  free_cancel_hours: 24,
  late_cancel_hours: 24,
  late_cancel_percent: 50,
  imminent_cancel_hours: 2,
  imminent_cancel_percent: 100,
  no_show_percent: 100,
  complimentary_wait_minutes_standard: 15,
  complimentary_wait_minutes_airport: 60,
  wait_charge_per_minute_cents: 150,
  dispatch_locks_cancellation: true,
};

console.log("=== LUNA LIMO UNIT TEST SUITE ===");

// 1. Cumulative Mileage Tiers
const m1 = calculateCumulativeMileageCents(22, testEscalade.tiers, 450);
console.log(`[TEST 1] Cumulative 22 mi: ${m1.totalMileageCents === 12800 ? "PASS (12800 cents = $128.00)" : "FAIL"}`);

// 2. Tier Boundary at 10.0 mi
const m2 = calculateCumulativeMileageCents(10, testEscalade.tiers, 450);
console.log(`[TEST 2] Boundary 10 mi: ${m2.totalMileageCents === 6500 ? "PASS (6500 cents = $65.00)" : "FAIL"}`);

// 3. Across 4 Tiers at 100 mi
const m3 = calculateCumulativeMileageCents(100, testEscalade.tiers, 450);
console.log(`[TEST 3] 100 mi 4-tier: ${m3.totalMileageCents === 47125 ? "PASS (47125 cents = $471.25)" : "FAIL"}`);

// 4. Minimum Fare Enforcement
const qShort = calculateTripQuote({ trip_type: "point_to_point", vehicle: testEscalade, distance_miles: 2, duration_minutes: 5, active_surcharges: testSurcharges });
console.log(`[TEST 4] Min Fare floor ($120): ${qShort.subtotal_cents === 12000 ? "PASS" : "FAIL"}`);

// 5. Line items sum exactly to total (Zero cent drift)
const qAirport = calculateTripQuote({ trip_type: "airport", vehicle: testEscalade, distance_miles: 22, duration_minutes: 30, is_airport_pickup: true, meet_and_greet: true, child_seats_count: 1, active_surcharges: testSurcharges });
const sumLineItems = qAirport.line_items.reduce((acc, i) => acc + i.amount_cents, 0);
console.log(`[TEST 5] Line items sum exact ($${(qAirport.total_cents/100).toFixed(2)}): ${sumLineItems === qAirport.total_cents ? "PASS" : "FAIL"}`);

// 6. Cancellation 48h out
const c48 = evaluateCancellationFee({ pickup_datetime_utc: 100000000000, current_time_utc: 100000000000 - 48*3600*1000, booking_total_cents: 25000, policy_settings: testPolicy });
console.log(`[TEST 6] Cancel 48h out (0% fee, full refund): ${c48.fee_percentage === 0 && c48.refund_cents === 25000 ? "PASS" : "FAIL"}`);

// 7. Cancellation 5h out
const c5 = evaluateCancellationFee({ pickup_datetime_utc: 100000000000, current_time_utc: 100000000000 - 5*3600*1000, booking_total_cents: 25000, policy_settings: testPolicy });
console.log(`[TEST 7] Cancel 5h out (50% fee, $125 refund): ${c5.fee_percentage === 50 && c5.refund_cents === 12500 ? "PASS" : "FAIL"}`);

// 8. Cancellation 1h out
const c1 = evaluateCancellationFee({ pickup_datetime_utc: 100000000000, current_time_utc: 100000000000 - 1*3600*1000, booking_total_cents: 25000, policy_settings: testPolicy });
console.log(`[TEST 8] Cancel 1h out (100% fee, $0 refund): ${c1.fee_percentage === 100 && c1.refund_cents === 0 ? "PASS" : "FAIL"}`);

// 9. No-Show
const cNoShow = evaluateCancellationFee({ pickup_datetime_utc: 100000000000, booking_total_cents: 25000, policy_settings: testPolicy, is_no_show: true });
console.log(`[TEST 9] No-Show (100% charge): ${cNoShow.fee_percentage === 100 && cNoShow.cancellation_fee_cents === 25000 ? "PASS" : "FAIL"}`);

console.log("=== ALL UNIT TESTS COMPLETE ===");
