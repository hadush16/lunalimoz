import { evaluateCancellationFee, calculateWaitTimeFee, PolicySettingsInput } from "../cancellationFee";

const defaultTestPolicy: PolicySettingsInput = {
  free_cancel_hours: 24,
  late_cancel_hours: 24,
  late_cancel_percent: 50,
  imminent_cancel_hours: 2,
  imminent_cancel_percent: 100,
  no_show_percent: 100,
  complimentary_wait_minutes_standard: 15,
  complimentary_wait_minutes_airport: 60,
  wait_charge_per_minute_cents: 150, // $1.50/min
  dispatch_locks_cancellation: true,
  special_event_deposit_percent: 25,
  special_event_deposit_refundable: false,
};

export function runCancellationUnitTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  const basePickupTime = new Date("2026-10-20T18:00:00Z").getTime();
  const totalCents = 25000; // $250.00

  // Test 1: 48h Out (Free Cancel)
  try {
    const res = evaluateCancellationFee({
      pickup_datetime_utc: basePickupTime,
      current_time_utc: basePickupTime - 48 * 60 * 60 * 1000,
      booking_total_cents: totalCents,
      policy_settings: defaultTestPolicy,
    });
    assert(res.fee_percentage === 0, `Expected 0% fee, got ${res.fee_percentage}%`);
    assert(res.cancellation_fee_cents === 0, `Expected $0 fee, got ${res.cancellation_fee_cents}`);
    assert(res.refund_cents === totalCents, `Expected full refund of $250, got ${res.refund_cents}`);
    results.push({ name: "Cancellation 48h Out (0% Fee, 100% Refund)", passed: true });
  } catch (err: any) {
    results.push({ name: "Cancellation 48h Out", passed: false, error: err.message });
  }

  // Test 2: 5h Out (50% Late Fee)
  try {
    const res = evaluateCancellationFee({
      pickup_datetime_utc: basePickupTime,
      current_time_utc: basePickupTime - 5 * 60 * 60 * 1000,
      booking_total_cents: totalCents,
      policy_settings: defaultTestPolicy,
    });
    assert(res.fee_percentage === 50, `Expected 50% fee, got ${res.fee_percentage}%`);
    assert(res.cancellation_fee_cents === 12500, `Expected $125 fee, got ${res.cancellation_fee_cents}`);
    assert(res.refund_cents === 12500, `Expected $125 refund, got ${res.refund_cents}`);
    results.push({ name: "Cancellation 5h Out (50% Fee, 50% Refund)", passed: true });
  } catch (err: any) {
    results.push({ name: "Cancellation 5h Out", passed: false, error: err.message });
  }

  // Test 3: 1h Out (< 2h Imminent Fee)
  try {
    const res = evaluateCancellationFee({
      pickup_datetime_utc: basePickupTime,
      current_time_utc: basePickupTime - 1 * 60 * 60 * 1000,
      booking_total_cents: totalCents,
      policy_settings: defaultTestPolicy,
    });
    assert(res.fee_percentage === 100, `Expected 100% fee, got ${res.fee_percentage}%`);
    assert(res.cancellation_fee_cents === totalCents, `Expected $250 fee, got ${res.cancellation_fee_cents}`);
    assert(res.refund_cents === 0, `Expected $0 refund, got ${res.refund_cents}`);
    results.push({ name: "Cancellation 1h Out (100% Fee, 0% Refund)", passed: true });
  } catch (err: any) {
    results.push({ name: "Cancellation 1h Out", passed: false, error: err.message });
  }

  // Test 4: Chauffeur Dispatched Lock
  try {
    const res = evaluateCancellationFee({
      pickup_datetime_utc: basePickupTime,
      current_time_utc: basePickupTime - 30 * 60 * 60 * 1000, // 30h out, normally free
      booking_total_cents: totalCents,
      policy_settings: defaultTestPolicy,
      dispatched_at: Date.now() - 5000, // But chauffeur dispatched
    });
    assert(res.fee_percentage === 100, `Expected 100% fee when dispatched, got ${res.fee_percentage}%`);
    assert(res.cancellation_fee_cents === totalCents, `Expected full fee when dispatched, got ${res.cancellation_fee_cents}`);
    assert(res.refund_cents === 0, "Refund must be 0 when chauffeur is dispatched");
    results.push({ name: "Dispatched Chauffeur Lock (100% Fee)", passed: true });
  } catch (err: any) {
    results.push({ name: "Dispatched Chauffeur Lock", passed: false, error: err.message });
  }

  // Test 5: Passenger No-Show
  try {
    const res = evaluateCancellationFee({
      pickup_datetime_utc: basePickupTime,
      booking_total_cents: totalCents,
      policy_settings: defaultTestPolicy,
      is_no_show: true,
    });
    assert(res.fee_percentage === 100, `Expected 100% fee on no-show, got ${res.fee_percentage}%`);
    assert(res.cancellation_fee_cents === totalCents, `Expected full charge on no-show, got ${res.cancellation_fee_cents}`);
    results.push({ name: "Passenger No-Show (100% Charge)", passed: true });
  } catch (err: any) {
    results.push({ name: "Passenger No-Show", passed: false, error: err.message });
  }

  // Test 6: Complimentary Wait Time & Overage Charge
  try {
    // Standard: 15 min free, 35 min total wait = 20 billable mins @ $1.50/min = $30.00 (3000 cents)
    const stdWait = calculateWaitTimeFee(35, false, defaultTestPolicy);
    assert(stdWait.billableMinutes === 20, `Expected 20 billable mins, got ${stdWait.billableMinutes}`);
    assert(stdWait.waitTimeChargeCents === 3000, `Expected 3000 cents, got ${stdWait.waitTimeChargeCents}`);

    // Airport: 60 min free, 45 min total wait = 0 billable mins ($0)
    const aptWait = calculateWaitTimeFee(45, true, defaultTestPolicy);
    assert(aptWait.billableMinutes === 0, `Expected 0 billable mins, got ${aptWait.billableMinutes}`);
    assert(aptWait.waitTimeChargeCents === 0, `Expected 0 cents, got ${aptWait.waitTimeChargeCents}`);

    results.push({ name: "Complimentary Wait Time & Overage Calculation", passed: true });
  } catch (err: any) {
    results.push({ name: "Complimentary Wait Time", passed: false, error: err.message });
  }

  return results;
}
