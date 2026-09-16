export interface PolicySettingsInput {
  free_cancel_hours: number;
  late_cancel_hours: number;
  late_cancel_percent: number;
  imminent_cancel_hours: number;
  imminent_cancel_percent: number;
  no_show_percent: number;
  complimentary_wait_minutes_standard: number;
  complimentary_wait_minutes_airport: number;
  wait_charge_per_minute_cents: number;
  dispatch_locks_cancellation: boolean;
  special_event_deposit_percent: number;
  special_event_deposit_refundable: boolean;
}

export interface CancellationEvaluationInput {
  pickup_datetime_utc: number; // ms timestamp
  current_time_utc?: number; // ms timestamp, defaults to Date.now()
  booking_total_cents: number;
  policy_settings: PolicySettingsInput;
  dispatched_at?: number;
  is_no_show?: boolean;
  is_special_event?: boolean;
  special_event_deposit_cents?: number;
}

export interface CancellationEvaluationResult {
  fee_percentage: number;
  cancellation_fee_cents: number;
  refund_cents: number;
  reason: string;
  hours_remaining: number;
  is_dispatched: boolean;
  is_no_show: boolean;
}

/**
 * Pure, framework-free cancellation fee evaluation engine.
 */
export function evaluateCancellationFee(
  input: CancellationEvaluationInput
): CancellationEvaluationResult {
  const {
    pickup_datetime_utc,
    current_time_utc = Date.now(),
    booking_total_cents,
    policy_settings,
    dispatched_at,
    is_no_show = false,
    is_special_event = false,
    special_event_deposit_cents = 0,
  } = input;

  const totalPaid = Math.max(0, booking_total_cents);

  // 1. No-Show Scenario
  if (is_no_show) {
    const feePct = policy_settings.no_show_percent ?? 100;
    const feeCents = Math.round(totalPaid * (feePct / 100));
    const refundCents = Math.max(0, totalPaid - feeCents);
    return {
      fee_percentage: feePct,
      cancellation_fee_cents: feeCents,
      refund_cents: refundCents,
      reason: "Passenger No-Show: Confirmed arrival with no passenger contact (100% policy fee).",
      hours_remaining: 0,
      is_dispatched: !!dispatched_at,
      is_no_show: true,
    };
  }

  // 2. Chauffeur Dispatched Lock
  if (dispatched_at && policy_settings.dispatch_locks_cancellation) {
    return {
      fee_percentage: 100,
      cancellation_fee_cents: totalPaid,
      refund_cents: 0,
      reason: "Chauffeur Dispatched: Chauffeur is in transit or on location (100% reservation fee).",
      hours_remaining: 0,
      is_dispatched: true,
      is_no_show: false,
    };
  }

  // 3. Special Event Non-Refundable Deposit
  if (is_special_event && !policy_settings.special_event_deposit_refundable && special_event_deposit_cents > 0) {
    const depositFee = Math.min(totalPaid, special_event_deposit_cents);
    const refundCents = Math.max(0, totalPaid - depositFee);
    return {
      fee_percentage: Math.round((depositFee / totalPaid) * 100),
      cancellation_fee_cents: depositFee,
      refund_cents: refundCents,
      reason: "Special Event / Wedding: Non-refundable deposit retained pursuant to event terms.",
      hours_remaining: 0,
      is_dispatched: false,
      is_no_show: false,
    };
  }

  // 4. Timing-based evaluation
  const diffMs = pickup_datetime_utc - current_time_utc;
  const hours_remaining = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  let fee_percentage = 0;
  let reason = "";

  if (hours_remaining >= policy_settings.free_cancel_hours) {
    // Free cancellation (24+ hours)
    fee_percentage = 0;
    reason = `Advance Notice (${hours_remaining} hrs prior): Full refund / authorization release (0% cancellation fee).`;
  } else if (hours_remaining >= policy_settings.imminent_cancel_hours) {
    // Late cancellation (2h to 24h)
    fee_percentage = policy_settings.late_cancel_percent;
    reason = `Late Cancellation (${hours_remaining} hrs prior, <${policy_settings.late_cancel_hours}h notice): Up to ${fee_percentage}% cancellation fee applies.`;
  } else {
    // Imminent cancellation (< 2 hours)
    fee_percentage = policy_settings.imminent_cancel_percent;
    reason = `Imminent Cancellation (${hours_remaining} hrs prior, <${policy_settings.imminent_cancel_hours}h notice): 100% reservation charge applies.`;
  }

  const cancellation_fee_cents = Math.round(totalPaid * (fee_percentage / 100));
  const refund_cents = Math.max(0, totalPaid - cancellation_fee_cents);

  return {
    fee_percentage,
    cancellation_fee_cents,
    refund_cents,
    reason,
    hours_remaining,
    is_dispatched: !!dispatched_at,
    is_no_show: false,
  };
}

/**
 * Calculates excess wait time fee beyond complimentary period.
 */
export function calculateWaitTimeFee(
  totalWaitMinutes: number,
  isAirport: boolean,
  policy: PolicySettingsInput
): { billableMinutes: number; waitTimeChargeCents: number } {
  const complimentaryMinutes = isAirport
    ? policy.complimentary_wait_minutes_airport
    : policy.complimentary_wait_minutes_standard;

  const billableMinutes = Math.max(0, totalWaitMinutes - complimentaryMinutes);
  const waitTimeChargeCents = billableMinutes * policy.wait_charge_per_minute_cents;

  return { billableMinutes, waitTimeChargeCents };
}
