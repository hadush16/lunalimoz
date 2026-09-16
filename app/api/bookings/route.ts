import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, isLiveStripeConfigured } from "@/lib/stripe/server";
import { calculateTripQuote } from "@/lib/pricing/engine";
import { verifySignedQuoteToken } from "@/lib/pricing/quoteToken";
import { DEFAULT_VEHICLES, DEFAULT_SURCHARGES } from "@/convex/rate_cards";

const bookingRequestSchema = z.object({
  quote_token: z.string().min(10),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7),
  pickup_address: z.string().min(3),
  dropoff_address: z.string().min(3),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
  pickup_datetime_utc: z.number(), // ms timestamp
  vehicle_slug: z.string(),
  passengers: z.number().min(1),
  bags: z.number().min(0),
  flight_number: z.string().optional(),
  trip_type: z.enum(["point_to_point", "hourly", "airport"]),
  hourly_hours: z.number().min(0).optional(),
  special_instructions: z.string().optional(),
  distance_meters: z.number().min(0),
  duration_seconds: z.number().min(0),
  meet_and_greet: z.boolean().default(false),
  child_seats_count: z.number().min(0).default(0),
  extra_stops_count: z.number().min(0).default(0),
  gratuity_percent: z.number().min(0).max(100).default(20),
  policy_accepted: z.literal(true),
  policy_version_hash: z.string().optional(),
});

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "LL-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bookingRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Verify Signed Quote Token
    const tokenCheck = await verifySignedQuoteToken(data.quote_token);
    if (!tokenCheck.valid || tokenCheck.expired) {
      return NextResponse.json(
        {
          success: false,
          expired: tokenCheck.expired,
          error: "Your quoted price lock has expired. Please review the updated quote before completing booking.",
        },
        { status: 409 }
      );
    }

    // 2. Authoritative Server-Side Recalculation (Zero Client Trust)
    const vehicle = DEFAULT_VEHICLES.find((v) => v.vehicle_slug === data.vehicle_slug) || DEFAULT_VEHICLES[0];
    const distance_miles = Math.round((data.distance_meters / 1609.344) * 10) / 10;
    const duration_minutes = Math.round(data.duration_seconds / 60);

    const recomputedQuote = calculateTripQuote({
      trip_type: data.trip_type,
      vehicle,
      distance_miles,
      duration_minutes,
      hourly_hours: data.hourly_hours,
      pickup_datetime_utc: data.pickup_datetime_utc,
      is_airport_pickup: data.trip_type === "airport",
      meet_and_greet: data.meet_and_greet,
      child_seats_count: data.child_seats_count,
      extra_stops_count: data.extra_stops_count,
      gratuity_percent: data.gratuity_percent,
      active_surcharges: DEFAULT_SURCHARGES,
      rate_card_version: 1,
    });

    const confirmation_code = generateConfirmationCode();
    const now = Date.now();
    const leadTimeMs = data.pickup_datetime_utc - now;
    const sixDaysMs = 6 * 24 * 60 * 60 * 1000;
    const isUnderSixDays = leadTimeMs <= sixDaysMs;

    let client_secret = "";
    let payment_mode: "payment" | "setup" = "payment";
    let stripe_payment_intent_id: string | undefined;
    let stripe_setup_intent_id: string | undefined;
    let stripe_customer_id: string | undefined;

    // 3. Stripe Intent Creation with Idempotency Key
    const idempotencyKey = `booking_${confirmation_code}_${data.pickup_datetime_utc}`;

    if (isLiveStripeConfigured()) {
      if (isUnderSixDays) {
        // Path A: Lead time <= 6 days -> PaymentIntent with capture_method: 'manual' (Authorization Hold)
        const paymentIntent = await stripe.paymentIntents.create(
          {
            amount: recomputedQuote.total_cents,
            currency: "usd",
            capture_method: "manual",
            receipt_email: data.customer_email,
            description: `Luna Limo ${vehicle.display_name} reservation (${confirmation_code})`,
            metadata: {
              confirmation_code,
              customer_name: data.customer_name,
              customer_phone: data.customer_phone,
              pickup_address: data.pickup_address,
              dropoff_address: data.dropoff_address,
              vehicle_slug: data.vehicle_slug,
              pickup_datetime: new Date(data.pickup_datetime_utc).toISOString(),
              total_cents: String(recomputedQuote.total_cents),
            },
          },
          { idempotencyKey }
        );

        client_secret = paymentIntent.client_secret || "";
        stripe_payment_intent_id = paymentIntent.id;
        payment_mode = "payment";
      } else {
        // Path B: Lead time > 6 days -> SetupIntent (Save card off-session for T-72h authorization)
        const customer = await stripe.customers.create(
          {
            email: data.customer_email,
            name: data.customer_name,
            phone: data.customer_phone,
            metadata: { confirmation_code },
          },
          { idempotencyKey: `cust_${idempotencyKey}` }
        );

        stripe_customer_id = customer.id;

        const setupIntent = await stripe.setupIntents.create(
          {
            customer: customer.id,
            usage: "off_session",
            description: `Card setup for future Luna Limo reservation (${confirmation_code})`,
            metadata: {
              confirmation_code,
              total_cents: String(recomputedQuote.total_cents),
            },
          },
          { idempotencyKey }
        );

        client_secret = setupIntent.client_secret || "";
        stripe_setup_intent_id = setupIntent.id;
        payment_mode = "setup";
      }
    } else {
      // Test mock secrets when developing without live keys
      client_secret = `mock_secret_${confirmation_code}`;
      payment_mode = isUnderSixDays ? "payment" : "setup";
      stripe_payment_intent_id = isUnderSixDays ? `pi_mock_${confirmation_code}` : undefined;
      stripe_setup_intent_id = !isUnderSixDays ? `seti_mock_${confirmation_code}` : undefined;
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    return NextResponse.json({
      success: true,
      confirmation_code,
      client_secret,
      mode: payment_mode,
      lead_time_days: Math.round((leadTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10,
      total_cents: recomputedQuote.total_cents,
      breakdown: recomputedQuote.line_items,
      quote: recomputedQuote,
    });
  } catch (err: any) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (
      rawConvexUrl &&
      rawConvexUrl.startsWith("https://") &&
      rawConvexUrl.includes(".convex.") &&
      !rawConvexUrl.includes("rapid-otter-123")
    ) {
      try {
        const response = await fetch(`${rawConvexUrl}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "rides:list", args: {} }),
        });
        const body = await response.json();
        if (response.ok && body.status !== "error" && Array.isArray(body.value)) {
          return NextResponse.json({
            success: true,
            bookings: body.value.map((r: any) => ({
              id: r._id,
              customerName: r.customerName,
              customerEmail: r.customerEmail,
              customerPhone: r.customerPhone,
              flightDetails: r.flightNumber,
              pickupAddress: r.pickupAddress,
              destinationAddress: r.destinationAddress,
              pickupDate: r.pickupDate,
              pickupTime: r.pickupTime || "12:00",
              carTypeName: r.carTypeName,
              price: r.price,
              passengers: r.passengers,
              luggage: r.luggage,
              serviceType: r.serviceType || "point_to_point",
              hourlyDuration: r.hourlyDuration,
              distance: r.distance,
              duration: r.duration,
              status: r.status === "confirmed" ? "confirmed" : r.status === "cancelled" ? "cancelled" : "pending_approval",
              paymentStatus: r.paymentStatus || "paid",
              createdAt: r.createdAt || Date.now(),
            })),
          });
        }
      } catch (err) {
        console.warn("Convex rides:list fetch failed, falling back to local store:", err);
      }
    }

    const { getStoredBookings } = await import("@/lib/bookings/storage");
    const bookings = getStoredBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    return NextResponse.json({ success: true, bookings: [] });
  }
}
