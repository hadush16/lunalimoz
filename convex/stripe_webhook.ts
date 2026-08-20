import { httpActionGeneric } from "convex/server";
import { internal } from "./_generated/api";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest(path: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: options.method || "GET",
    headers: options.headers,
    body: options.body,
  });
  return response.json();
}

export const stripeWebhookHandler = httpActionGeneric(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  const rawBody = await request.clone().text();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

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
    return new Response("Invalid signature", { status: 400 });
  }

  const timestamp = parseInt(timestampMatch[1], 10);
  if (Math.abs(Date.now() - timestamp * 1000) > 300000) {
    return new Response("Timestamp too old", { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const sessionId = session.id as string;
      const paymentIntentId = session.payment_intent as string | null;

      const existing = await ctx.runQuery(internal.payments.getByStripeSessionId, {
        stripeCheckoutSessionId: sessionId,
      });
      if (existing) break;

      const metadata = (session.metadata || {}) as Record<string, string>;
      const rideData = JSON.parse(metadata.rideData || "{}");
      if (!rideData.customerName) break;

      const rideId = await ctx.runMutation(internal.rides.createFromWebhook, {
        ...rideData,
        stripeCheckoutSessionId: sessionId,
      });

      if (rideId) {
        await ctx.runMutation(internal.payments.createPaymentRecord, {
          rideId,
          stripeCheckoutSessionId: sessionId,
          stripePaymentIntentId: paymentIntentId ?? undefined,
          amount: ((session.amount_total as number) ?? 0) / 100,
          currency: (session.currency as string) ?? "usd",
          status: "succeeded",
          paymentMethod: ((session.payment_method_types as string[])?.[0]) ?? "card",
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
          refundAmount: (charge.amount_refunded as number) / 100,
        });
      }
      break;
    }
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
