import { calculateTripQuote, calculateCumulativeMileageCents, roundHourlyToQuarterHour } from "../engine";
import { VehicleRateData, SurchargeData } from "../types";
import { createSignedQuoteToken, verifySignedQuoteToken } from "../quoteToken";

const testEscalade: VehicleRateData = {
  vehicle_slug: "escalade-esv",
  display_name: "Cadillac Escalade ESV",
  base_fare_cents: 4000, // $40.00
  per_mile_cents: 450,
  per_minute_cents: 80, // $0.80/min
  hourly_rate_cents: 18000, // $180.00/hr
  hourly_minimum_hours: 2,
  minimum_fare_cents: 12000, // $120.00
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
};

const testSurcharges: SurchargeData[] = [
  { key: "airport_pickup_fee", label: "Airport Pickup", type: "flat", amount: 2500, is_active: true },
  { key: "meet_and_greet", label: "Meet and Greet", type: "flat", amount: 3500, is_active: true },
  { key: "child_seat", label: "Child Seat", type: "flat", amount: 2500, is_active: true },
  { key: "extra_stop", label: "Extra Stop", type: "flat", amount: 3000, is_active: true },
  { key: "wa_sales_tax", label: "WA Sales Tax", type: "percent", amount: 1025, is_active: true }, // 10.25%
  { key: "default_gratuity", label: "Gratuity", type: "percent", amount: 2000, is_active: true }, // 20%
];

export async function runPricingUnitTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // Test 1: Cumulative Mileage Tier Walking (22 miles)
  try {
    const { totalMileageCents, tierBreakdowns } = calculateCumulativeMileageCents(22, testEscalade.tiers, 450);
    // 0-10 mi @ $6.50 = $65.00 (6500 cents)
    // 10-22 mi = 12 mi @ $5.25 = $63.00 (6300 cents)
    // Total = 12800 cents ($128.00)
    assert(totalMileageCents === 12800, `Expected 12800 cents, got ${totalMileageCents}`);
    assert(tierBreakdowns.length === 2, `Expected 2 tier line items, got ${tierBreakdowns.length}`);
    results.push({ name: "Cumulative Mileage Tiers (22 mi)", passed: true });
  } catch (err: any) {
    results.push({ name: "Cumulative Mileage Tiers (22 mi)", passed: false, error: err.message });
  }

  // Test 2: Tier Boundary at Exactly 10.0 Miles
  try {
    const { totalMileageCents, tierBreakdowns } = calculateCumulativeMileageCents(10, testEscalade.tiers, 450);
    // Exactly 10 mi @ $6.50 = 6500 cents ($65.00)
    assert(totalMileageCents === 6500, `Expected 6500 cents, got ${totalMileageCents}`);
    assert(tierBreakdowns.length === 1, `Expected 1 tier line item, got ${tierBreakdowns.length}`);
    results.push({ name: "Tier Boundary (10.0 mi)", passed: true });
  } catch (err: any) {
    results.push({ name: "Tier Boundary (10.0 mi)", passed: false, error: err.message });
  }

  // Test 3: Long Trip Across All 4 Tiers (100 miles)
  try {
    const { totalMileageCents } = calculateCumulativeMileageCents(100, testEscalade.tiers, 450);
    // 10 mi @ 650 = 6500
    // 20 mi @ 525 = 10500
    // 45 mi @ 450 = 20250
    // 25 mi @ 395 = 9875
    // Total = 47125 cents ($471.25)
    assert(totalMileageCents === 47125, `Expected 47125 cents, got ${totalMileageCents}`);
    results.push({ name: "Long Trip Across 4 Tiers (100 mi)", passed: true });
  } catch (err: any) {
    results.push({ name: "Long Trip Across 4 Tiers (100 mi)", passed: false, error: err.message });
  }

  // Test 4: Minimum Fare Enforcement on Short Trip (2 miles)
  try {
    const quote = calculateTripQuote({
      trip_type: "point_to_point",
      vehicle: testEscalade,
      distance_miles: 2,
      duration_minutes: 5,
      pickup_datetime_utc: new Date("2026-10-15T14:00:00Z").getTime(),
      gratuity_percent: 20,
      active_surcharges: testSurcharges,
      rate_card_version: 1,
    });
    // Base $40 (4000) + 2mi@$6.50 ($1300) + 5min@$0.80 ($400) = $57.00 subtotal (5700)
    // Floor is $120.00 (12000), so subtotal is raised to 12000
    assert(quote.subtotal_cents === 12000, `Expected subtotal to floor at 12000 cents, got ${quote.subtotal_cents}`);
    assert(quote.line_items.some((i) => i.id === "min_fare_adjustment"), "Missing min_fare_adjustment line item");
    results.push({ name: "Minimum Fare Floor Enforcement", passed: true });
  } catch (err: any) {
    results.push({ name: "Minimum Fare Floor Enforcement", passed: false, error: err.message });
  }

  // Test 5: Full 22-mile Sea-Tac Transfer with Line Items Summing Exactly to Total
  try {
    const quote = calculateTripQuote({
      trip_type: "airport",
      vehicle: testEscalade,
      distance_miles: 22,
      duration_minutes: 30,
      pickup_datetime_utc: new Date("2026-10-15T14:00:00Z").getTime(),
      is_airport_pickup: true,
      meet_and_greet: true,
      child_seats_count: 1,
      gratuity_percent: 20,
      active_surcharges: testSurcharges,
      rate_card_version: 1,
    });

    const sumOfLineItems = quote.line_items.reduce((acc, item) => acc + item.amount_cents, 0);
    assert(
      sumOfLineItems === quote.total_cents,
      `Sum of line items (${sumOfLineItems}) does not match total_cents (${quote.total_cents})`
    );
    assert(quote.total_cents > 0, "Total must be positive");
    results.push({ name: "Line Items Sum to Total Exactly (Zero Cent Drift)", passed: true });
  } catch (err: any) {
    results.push({ name: "Line Items Sum to Total Exactly", passed: false, error: err.message });
  }

  // Test 6: Hourly Charter with 15-Minute Rounding & 2h Minimum
  try {
    const effectiveH = roundHourlyToQuarterHour(1.2);
    assert(effectiveH === 1.25, `Expected 1.2h to round to 1.25h, got ${effectiveH}`);

    const quote = calculateTripQuote({
      trip_type: "hourly",
      vehicle: testEscalade,
      distance_miles: 0,
      duration_minutes: 0,
      hourly_hours: 1.25, // Less than minimum 2h
      pickup_datetime_utc: new Date("2026-10-15T14:00:00Z").getTime(),
      gratuity_percent: 20,
      active_surcharges: testSurcharges,
      rate_card_version: 1,
    });

    // 2 hrs @ $180 = $360.00 (36000 cents) subtotal
    assert(quote.subtotal_cents === 36000, `Expected 36000 cents, got ${quote.subtotal_cents}`);
    results.push({ name: "Hourly Charter 15-Min Rounding & 2h Minimum", passed: true });
  } catch (err: any) {
    results.push({ name: "Hourly Charter 15-Min Rounding", passed: false, error: err.message });
  }

  // Test 7: JWT Quote Token Signing & Verification
  try {
    const quote = calculateTripQuote({
      trip_type: "point_to_point",
      vehicle: testEscalade,
      distance_miles: 15,
      duration_minutes: 20,
      pickup_datetime_utc: new Date("2026-10-15T14:00:00Z").getTime(),
      gratuity_percent: 20,
      active_surcharges: testSurcharges,
      rate_card_version: 1,
    });

    const token = await createSignedQuoteToken(quote);
    assert(typeof token === "string" && token.split(".").length === 3, "Invalid token format");

    const verification = await verifySignedQuoteToken(token);
    assert(verification.valid === true, "Token verification failed");
    assert(verification.payload?.total_cents === quote.total_cents, "Token payload mismatch");

    results.push({ name: "Signed JWT Quote Token Creation & Verification", passed: true });
  } catch (err: any) {
    results.push({ name: "Signed JWT Quote Token", passed: false, error: err.message });
  }

  return results;
}
