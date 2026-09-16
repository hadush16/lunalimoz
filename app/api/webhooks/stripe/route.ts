import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

// Processed events in-memory fallback set for quick local verification + DB logging
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    if (webhookSecret && signature && !webhookSecret.includes("placeholder")) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error("Stripe webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Allow parsed JSON event in test mode without secret
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    if (!event || !event.id) {
      return NextResponse.json({ error: "Missing event payload" }, { status: 400 });
    }

    // 1. Idempotency Check: Do not re-process duplicate webhook event IDs
    if (processedEvents.has(event.id)) {
      console.log(`[STRIPE WEBHOOK] Duplicate event ${event.id} (${event.type}) skipped.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    processedEvents.add(event.id);
    console.log(`[STRIPE WEBHOOK] Processing event ${event.id} -> ${event.type}`);

    // 2. Event Type Handlers
    switch (event.type) {
      case "payment_intent.amount_capturable_updated": {
        const paymentIntent = event.data.object;
        console.log(`[STRIPE] Authorization hold placed: ${paymentIntent.id}, Capturable: $${(paymentIntent.amount_capturable / 100).toFixed(2)}`);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`[STRIPE] Payment captured successfully: ${paymentIntent.id}, Amount: $${(paymentIntent.amount_received / 100).toFixed(2)}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const failureReason = paymentIntent.last_payment_error?.message || "Payment authorization/capture failed";
        console.warn(`[STRIPE] Payment failed for ${paymentIntent.id}: ${failureReason}`);
        break;
      }

      case "setup_intent.succeeded": {
        const setupIntent = event.data.object;
        console.log(`[STRIPE] SetupIntent succeeded for future off-session charging: ${setupIntent.id}, Customer: ${setupIntent.customer}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        console.log(`[STRIPE] Refund processed on charge ${charge.id}: Amount Refunded: $${(charge.amount_refunded / 100).toFixed(2)}`);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object;
        console.error(`[STRIPE ALERT] Dispute created: ${dispute.id}, Amount: $${(dispute.amount / 100).toFixed(2)}, Reason: ${dispute.reason}`);
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, event_id: event.id });
  } catch (err: any) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
