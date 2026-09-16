import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest<T>(
  path: string,
  options: { method?: string; body?: URLSearchParams } = {}
): Promise<T> {
  const { method = "POST", body } = options;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    // Development / fallback mock response when Stripe key is not yet set
    console.warn("STRIPE_SECRET_KEY is not configured in Convex environment.");
    if (path === "/checkout/sessions") {
      return { url: "/booking/success?session_id=mock_session" } as T;
    }
    if (path.startsWith("/checkout/sessions/")) {
      return {
        payment_status: "paid",
        payment_intent: "pi_mock_12345",
        amount_total: 18500,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {},
      } as T;
    }
    if (path === "/refunds") {
      return { id: "re_mock_12345", status: "succeeded" } as T;
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeSecretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    body: body ? body.toString() : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Stripe API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const createCheckoutSession = action({
  args: {
    carTypeName: v.string(),
    distance: v.number(),
    duration: v.number(),
    serviceType: v.union(v.literal("point_to_point"), v.literal("hourly")),
    hourlyDuration: v.optional(v.number()),
    carTypeMultiplier: v.number(),
    price: v.number(),
    customerEmail: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    pickupAddress: v.string(),
    destinationAddress: v.string(),
    pickupLat: v.number(),
    pickupLng: v.number(),
    destLat: v.number(),
    destLng: v.number(),
    passengers: v.number(),
    luggage: v.number(),
    accessible: v.boolean(),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    optionalServices: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          price: v.number(),
        })
      )
    ),
    discountCode: v.optional(v.string()),
    policyAccepted: v.optional(v.boolean()),
    policyVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authoritative server-side price computation
    const quote = await ctx.runQuery(internal.pricing.calculateQuoteInternal, {
      carTypeName: args.carTypeName,
      distanceKm: args.distance,
      durationMinutes: args.duration,
      serviceType: args.serviceType,
      hourlyDuration: args.hourlyDuration,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      pickupAddress: args.pickupAddress,
      destinationAddress: args.destinationAddress,
      selectedServiceIds: args.optionalServices?.map((s) => s.id),
      discountCode: args.discountCode,
    });

    const calculatedPrice = quote.finalAmount;

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[]", "card");
    params.set("customer_email", args.customerEmail);
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(Math.round(calculatedPrice * 100))
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      `Luna Limo — ${args.carTypeName}`
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      args.serviceType === "hourly"
        ? `${args.hourlyDuration || 2}-Hour Private Luxury Charter (Seattle)`
        : `${args.pickupAddress.slice(0, 40)}... → ${args.destinationAddress.slice(0, 40)}...`
    );
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/booking`);

    const rideData = {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      pickupAddress: args.pickupAddress,
      destinationAddress: args.destinationAddress,
      pickupLat: args.pickupLat,
      pickupLng: args.pickupLng,
      destLat: args.destLat,
      destLng: args.destLng,
      distance: args.distance,
      duration: args.duration,
      carTypeName: args.carTypeName,
      carTypeMultiplier: args.carTypeMultiplier,
      price: calculatedPrice,
      passengers: args.passengers,
      luggage: args.luggage,
      accessible: args.accessible,
      serviceType: args.serviceType,
      hourlyDuration: args.hourlyDuration,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      flightNumber: args.flightNumber,
      specialInstructions: args.specialInstructions,
      optionalServices: args.optionalServices,
      discountCode: args.discountCode,
      priceSnapshot: quote,
      policyVersion: args.policyVersion || "1.0",
      policyAccepted: args.policyAccepted ?? true,
      policyAcceptedAt: Date.now(),
    };

    const rideDataString = JSON.stringify(rideData);
    if (rideDataString.length > 500) {
      const chunks = rideDataString.match(/.{1,500}/g) || [];
      chunks.forEach((chunk, i) => {
        params.set(`metadata[rideData_${i}]`, chunk);
      });
      params.set("metadata[isChunked]", "true");
    } else {
      params.set("metadata[rideData]", rideDataString);
    }

    const session = await stripeRequest<{ url: string | null }>("/checkout/sessions", {
      body: params,
    });

    return { url: session.url };
  },
});

export const verifyCheckoutSession = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { status: "unpaid" }
    | { status: "already_processed"; rideId: string }
    | {
        status: "paid";
        rideData: Record<string, unknown>;
        stripePaymentIntentId: string | null;
        amount: number;
        currency: string;
        paymentMethod: string;
      }
  > => {
    const session = await stripeRequest<{
      payment_status: string;
      metadata?: Record<string, string>;
      payment_intent: string | null;
      amount_total: number | null;
      currency: string | null;
      payment_method_types?: string[];
    }>(`/checkout/sessions/${args.sessionId}`, { method: "GET" });

    if (session.payment_status !== "paid") {
      return { status: "unpaid" };
    }

    const existingRide = await ctx.runQuery(internal.rides.getByStripeSessionId, {
      stripeCheckoutSessionId: args.sessionId,
    });

    if (existingRide) {
      return { status: "already_processed", rideId: existingRide._id };
    }

    let rideDataStr = session.metadata?.rideData || "{}";
    if (session.metadata?.isChunked === "true") {
      rideDataStr = "";
      for (let i = 0; i < 50; i++) {
        const chunk = session.metadata[`rideData_${i}`];
        if (!chunk) break;
        rideDataStr += chunk;
      }
    }

    let rideData = {};
    try {
      rideData = JSON.parse(rideDataStr);
    } catch (e) {
      console.error("Failed to parse rideData from metadata:", rideDataStr);
    }

    return {
      status: "paid",
      rideData,
      stripePaymentIntentId: session.payment_intent as string | null,
      amount: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "usd",
      paymentMethod: session.payment_method_types?.[0] ?? "card",
    };
  },
});

export const processStripeRefund = action({
  args: {
    rideId: v.id("rides"),
    amount: v.number(),
    reason: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.runQuery(internal.payments.getByRideIdInternal, {
      rideId: args.rideId,
    });

    if (!payment || !payment.stripePaymentIntentId) {
      // Record internal manual refund record if no live Stripe payment intent
      await ctx.runMutation(internal.payments.recordRefundInternal, {
        rideId: args.rideId,
        amount: args.amount,
        currency: "USD",
        reason: args.reason,
        initiatedBy: args.adminEmail,
      });

      await ctx.runMutation(internal.audit.logInternal, {
        adminEmail: args.adminEmail,
        action: "PROCESS_MANUAL_REFUND",
        entity: "rides",
        entityId: args.rideId,
        metadata: JSON.stringify({ amount: args.amount, reason: args.reason }),
      });

      return { success: true, message: "Manual refund recorded successfully." };
    }

    const params = new URLSearchParams();
    params.set("payment_intent", payment.stripePaymentIntentId);
    params.set("amount", String(Math.round(args.amount * 100)));
    params.set("reason", "requested_by_customer");

    const refundRes = await stripeRequest<{ id: string; status: string }>("/refunds", {
      body: params,
    });

    await ctx.runMutation(internal.payments.recordRefundInternal, {
      rideId: args.rideId,
      stripeRefundId: refundRes.id,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      amount: args.amount,
      currency: payment.currency || "USD",
      reason: args.reason,
      initiatedBy: args.adminEmail,
    });

    await ctx.runMutation(internal.audit.logInternal, {
      adminEmail: args.adminEmail,
      action: "PROCESS_STRIPE_REFUND",
      entity: "rides",
      entityId: args.rideId,
      metadata: JSON.stringify({
        amount: args.amount,
        reason: args.reason,
        stripeRefundId: refundRes.id,
      }),
    });

    return { success: true, refundId: refundRes.id };
  },
});
