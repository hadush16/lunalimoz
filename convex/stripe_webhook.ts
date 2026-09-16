import { httpActionGeneric } from "convex/server";
import { internal } from "./_generated/api";

export const stripeWebhookHandler = httpActionGeneric(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature header provided", { status: 400 });
  }

  const rawBody = await request.clone().text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("STRIPE_WEBHOOK_SECRET is not configured. Skipping signature verification in test mode.");
  } else {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const computedSig = "v1=" + Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");

      const timestampMatch = sig.match(/t=(\d+)/);
      const v1Match = sig.match(/v1=([a-f0-9]+)/);

      if (!timestampMatch || !v1Match) {
        return new Response("Invalid signature format", { status: 400 });
      }

      if (v1Match[1] !== computedSig.slice(2)) {
        return new Response("Invalid webhook signature", { status: 400 });
      }

      const timestamp = parseInt(timestampMatch[1], 10);
      if (Math.abs(Date.now() - timestamp * 1000) > 300000) {
        return new Response("Webhook timestamp expired", { status: 400 });
      }
    } catch (err: any) {
      return new Response(`Signature verification failed: ${err.message}`, { status: 400 });
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const sessionId = session.id as string;
      const paymentIntentId = (session.payment_intent as string) || undefined;

      // Check for existing payment to ensure idempotency
      const existingPayment = await ctx.runQuery(internal.payments.getByStripeSessionId, {
        stripeCheckoutSessionId: sessionId,
      });

      if (existingPayment) {
        console.log(`Duplicate webhook event for session ${sessionId}, skipping.`);
        break;
      }

      const metadata = (session.metadata || {}) as Record<string, string>;
      let rideDataStr = metadata.rideData || "{}";
      if (metadata.isChunked === "true") {
        rideDataStr = "";
        for (let i = 0; i < 50; i++) {
          const chunk = metadata[`rideData_${i}`];
          if (!chunk) break;
          rideDataStr += chunk;
        }
      }

      let rideData: Record<string, any> = {};
      try {
        rideData = JSON.parse(rideDataStr);
      } catch (err) {
        console.error("Failed to parse metadata rideData:", err);
      }

      if (!rideData.customerName) {
        console.warn("No valid customer data in session metadata");
        break;
      }

      const rideId = await ctx.runMutation(internal.rides.createFromWebhook, {
        customerName: rideData.customerName,
        customerEmail: rideData.customerEmail,
        customerPhone: rideData.customerPhone || "(206) 327-4411",
        pickupAddress: rideData.pickupAddress,
        destinationAddress: rideData.destinationAddress,
        pickupLat: rideData.pickupLat || 47.6062,
        pickupLng: rideData.pickupLng || -122.3321,
        destLat: rideData.destLat || 47.4502,
        destLng: rideData.destLng || -122.3088,
        distance: rideData.distance || 20,
        duration: rideData.duration || 30,
        carTypeName: rideData.carTypeName || "Executive Sedan",
        carTypeMultiplier: rideData.carTypeMultiplier || 1.0,
        price: ((session.amount_total as number) ?? 0) / 100,
        passengers: rideData.passengers || 1,
        luggage: rideData.luggage || 1,
        accessible: rideData.accessible || false,
        serviceType: rideData.serviceType || "point_to_point",
        hourlyDuration: rideData.hourlyDuration,
        pickupDate: rideData.pickupDate || new Date().toISOString().split("T")[0],
        pickupTime: rideData.pickupTime || "12:00",
        stripeCheckoutSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
        priceSnapshot: rideData.priceSnapshot,
        policyVersion: rideData.policyVersion,
        policyAccepted: rideData.policyAccepted,
        policyAcceptedAt: rideData.policyAcceptedAt,
      });

      if (rideId) {
        await ctx.runMutation(internal.payments.createPaymentRecord, {
          rideId,
          stripeCheckoutSessionId: sessionId,
          stripePaymentIntentId: paymentIntentId,
          amount: ((session.amount_total as number) ?? 0) / 100,
          currency: ((session.currency as string) ?? "usd").toUpperCase(),
          status: "paid",
          paymentMethod: ((session.payment_method_types as string[])?.[0]) ?? "card",
        });

        await ctx.runMutation(internal.audit.logInternal, {
          adminEmail: "stripe_webhook@system",
          action: "STRIPE_PAYMENT_CONFIRMED",
          entity: "rides",
          entityId: rideId,
          metadata: JSON.stringify({
            sessionId,
            paymentIntentId,
            amount: ((session.amount_total as number) ?? 0) / 100,
          }),
        });

        await ctx.runMutation(internal.notifications.create, {
          type: "new_booking",
          title: "Payment Confirmed (Stripe)",
          message: `Payment of $${(((session.amount_total as number) ?? 0) / 100).toFixed(2)} received for ${rideData.customerName}.`,
          link: `/admin/bookings/${rideId}`,
        });
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent as string | null;
      if (paymentIntentId) {
        await ctx.runMutation(internal.payments.markRefunded, {
          stripePaymentIntentId: paymentIntentId,
          refundAmount: ((charge.amount_refunded as number) ?? 0) / 100,
        });

        await ctx.runMutation(internal.audit.logInternal, {
          adminEmail: "stripe_webhook@system",
          action: "STRIPE_CHARGE_REFUNDED",
          entity: "payments",
          entityId: paymentIntentId,
          metadata: JSON.stringify({
            refundAmount: ((charge.amount_refunded as number) ?? 0) / 100,
          }),
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const piId = paymentIntent.id as string;
      console.warn(`Payment failed for PaymentIntent ${piId}`);
      break;
    }

    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
