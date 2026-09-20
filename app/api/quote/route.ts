import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateTripQuote } from "@/lib/pricing/engine";
import { createSignedQuoteToken } from "@/lib/pricing/quoteToken";
import { DEFAULT_VEHICLES, DEFAULT_SURCHARGES } from "@/convex/rate_cards";

const quoteSchema = z.object({
  vehicle_slug: z.string().default("escalade-esv"),
  trip_type: z.enum(["point_to_point", "round_trip", "hourly", "airport", "custom"]).default("point_to_point"),
  distance_miles: z.number().min(0).default(0),
  duration_minutes: z.number().min(0).default(0),
  hourly_hours: z.number().min(0).optional(),
  pickup_datetime_utc: z.number().default(() => Date.now() + 24 * 3600 * 1000),
  is_airport_pickup: z.boolean().default(false),
  is_airport_dropoff: z.boolean().default(false),
  meet_and_greet: z.boolean().default(false),
  child_seats_count: z.number().min(0).default(0),
  extra_stops_count: z.number().min(0).default(0),
  gratuity_percent: z.number().min(0).max(100).default(20),
  discount_code: z.string().optional(),
  discount_amount_cents: z.number().min(0).optional(),
  optional_services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price_cents: z.number(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = quoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Find vehicle definition
    const vehicle = DEFAULT_VEHICLES.find((v) => v.vehicle_slug === data.vehicle_slug) || DEFAULT_VEHICLES[0];

    const quote = calculateTripQuote({
      trip_type: data.trip_type,
      vehicle,
      distance_miles: data.distance_miles,
      duration_minutes: data.duration_minutes,
      hourly_hours: data.hourly_hours,
      pickup_datetime_utc: data.pickup_datetime_utc,
      is_airport_pickup: data.is_airport_pickup || data.trip_type === "airport",
      is_airport_dropoff: data.is_airport_dropoff,
      meet_and_greet: data.meet_and_greet,
      child_seats_count: data.child_seats_count,
      extra_stops_count: data.extra_stops_count,
      gratuity_percent: data.gratuity_percent,
      discount_code: data.discount_code,
      discount_amount_cents: data.discount_amount_cents || 0,
      optional_services: data.optional_services || [],
      active_surcharges: DEFAULT_SURCHARGES,
      rate_card_version: 1,
    });

    const quote_token = await createSignedQuoteToken(quote);

    return NextResponse.json({
      success: true,
      quote,
      quote_token,
    });
  } catch (err: any) {
    console.error("Quote calculation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate quote" },
      { status: 500 }
    );
  }
}
