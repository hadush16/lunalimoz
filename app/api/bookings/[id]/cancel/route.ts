import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, isLiveStripeConfigured } from "@/lib/stripe/server";
import { evaluateCancellationFee } from "@/lib/policy/cancellationFee";
import { DEFAULT_POLICY_SETTINGS } from "@/convex/rate_cards";

const cancelSchema = z.object({
  customer_email: z.string().email(),
  reason: z.string().min(3).default("Customer self-service cancellation"),
  pickup_datetime_utc: z.number().optional(),
  total_cents: z.number().optional(),
  stripe_payment_intent_id: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = cancelSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = Date.now();
    const pickupTime = data.pickup_datetime_utc || now + 48 * 3600 * 1000;
    const totalPaidCents = data.total_cents || 25000;

    // 1. Evaluate Cancellation Policy Engine
    const evalResult = evaluateCancellationFee({
      pickup_datetime_utc: pickupTime,
      current_time_utc: now,
      booking_total_cents: totalPaidCents,
      policy_settings: DEFAULT_POLICY_SETTINGS,
    });

    // 2. Stripe Execution (Release Hold / Capture Fee / Refund)
    let stripeRefundId: string | undefined;
    let stripeCapturedAmountCents = 0;

    if (isLiveStripeConfigured() && data.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(data.stripe_payment_intent_id);

        if (paymentIntent.status === "requires_capture") {
          if (evalResult.cancellation_fee_cents > 0) {
            // Capture only the fee amount, release remainder
            const capture = await stripe.paymentIntents.capture(data.stripe_payment_intent_id, {
              amount_to_capture: evalResult.cancellation_fee_cents,
            });
            stripeCapturedAmountCents = capture.amount_received;
          } else {
            // 0% fee -> Cancel intent immediately to release authorization hold
            await stripe.paymentIntents.cancel(data.stripe_payment_intent_id, {
              cancellation_reason: "requested_by_customer",
            });
          }
        } else if (paymentIntent.status === "succeeded" && evalResult.refund_cents > 0) {
          // Already captured -> Issue refund for the refundable difference
          const refund = await stripe.refunds.create({
            payment_intent: data.stripe_payment_intent_id,
            amount: evalResult.refund_cents,
            reason: "requested_by_customer",
          });
          stripeRefundId = refund.id;
        }
      } catch (stripeErr: any) {
        console.error("Stripe refund/cancel error:", stripeErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      booking_id: id,
      evaluation: evalResult,
      cancellation_fee_cents: evalResult.cancellation_fee_cents,
      refund_cents: evalResult.refund_cents,
      reason: evalResult.reason,
      stripe_refund_id: stripeRefundId,
      cancelled_at: now,
    });
  } catch (err: any) {
    console.error("Cancellation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
