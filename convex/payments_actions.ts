import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest<T>(path: string, options: { method?: string; body?: URLSearchParams } = {}): Promise<T> {
  const { method = "POST", body } = options;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
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
  },
  handler: async (ctx, args) => {
    const carType = await ctx.runQuery(internal.carTypes.getByName, {
      name: args.carTypeName,
    });

    if (!carType) {
      throw new Error("Vehicle type not found");
    }

    let calculatedPrice: number;
    if (args.serviceType === "hourly") {
      const hours = args.hourlyDuration || 2;
      calculatedPrice = Math.round(
        hours * (carType.hourlyRate || 0) * carType.multiplier * 100
      ) / 100;
    } else {
      const baseFare = carType.baseFare;
      const distanceCharge = args.distance * carType.perKmRate * carType.multiplier;
      const timeCharge = args.duration * carType.perMinuteRate * carType.multiplier;
      calculatedPrice = Math.round((baseFare + distanceCharge + timeCharge) * 100) / 100;
    }

    const settings = await ctx.runQuery(internal.settings.getInternal);
    const minimumFare = settings?.minimumFare || 0;
    if (calculatedPrice < minimumFare) {
      calculatedPrice = minimumFare;
    }

    if (Math.abs(calculatedPrice - args.price) > 0.01) {
      console.log("Price mismatch:", { calculatedPrice, argsPrice: args.price });
      // throw new Error("Price has changed. Please refresh and try again.");
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[]", "card");
    params.set("customer_email", args.customerEmail);
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(calculatedPrice * 100)));
    params.set("line_items[0][price_data][product_data][name]", `Luna Limo - ${args.carTypeName}`);
    params.set(
      "line_items[0][price_data][product_data][description]",
      args.serviceType === "hourly"
        ? `${args.hourlyDuration} hour charter service`
        : `${args.pickupAddress} → ${args.destinationAddress}`
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

    const session = await stripeRequest<{ url: string | null }>("/checkout/sessions", { body: params });

    return { url: session.url };
  },
});

export const verifyCheckoutSession = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<
    | { status: "unpaid" }
    | { status: "already_processed"; rideId: string }
    | { status: "paid"; rideData: Record<string, unknown>; stripePaymentIntentId: string | null; amount: number; currency: string; paymentMethod: string }
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
