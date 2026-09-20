import { NextRequest, NextResponse } from "next/server";
import { stripe, isLiveStripeConfigured } from "@/lib/stripe/server";
import { saveBookingRecord } from "@/lib/bookings/storage";
import { calculateTripQuote, verifyQuoteToken } from "@/lib/pricing/engine";
import { SupportedTripType } from "@/lib/pricing/types";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // 1. Authoritative Server Calculation
    const vehicleKey = (data.carTypeName || "Mercedes-Benz S-Class").toLowerCase();
    const distanceMiles = Number(data.distanceMiles || (Number(data.distance || 15) * 0.621371) || 15.0);
    const durationMinutes = Number(data.durationMinutes || data.duration || 25);
    const serviceType = (data.serviceType as SupportedTripType) || "point_to_point";

    let calculatedQuote = calculateTripQuote({
      vehicle_class: vehicleKey.includes("escalade")
        ? "escalade-esv"
        : vehicleKey.includes("navigator")
        ? "navigator-l"
        : vehicleKey.includes("sprinter")
        ? "sprinter"
        : "s-class",
      trip_type: serviceType,
      distance_miles: distanceMiles,
      duration_minutes: durationMinutes,
      hourly_hours: data.hourlyDuration ? Number(data.hourlyDuration) : undefined,
      pickup_datetime: `${data.pickupDate || new Date().toISOString().split("T")[0]}T${data.pickupTime || "12:00"}:00`,
      pickup_address: data.pickupAddress || "",
      dropoff_address: data.destinationAddress || "",
      is_airport_pickup: (data.pickupAddress || "").toLowerCase().includes("sea") || (data.pickupAddress || "").toLowerCase().includes("airport"),
      is_airport_dropoff: (data.destinationAddress || "").toLowerCase().includes("sea") || (data.destinationAddress || "").toLowerCase().includes("airport"),
      meet_and_greet: Boolean(data.optionalServices?.some((s: any) => s.id === "meet_greet")),
      child_seats: data.optionalServices?.some((s: any) => s.id === "child_seat") ? 1 : 0,
      extra_stops: data.optionalServices?.some((s: any) => s.id === "extra_stop") ? 1 : 0,
      discount_code: data.discountCode,
    });

    // Check if a valid signed quote token was provided
    if (data.signedQuoteToken) {
      const verified = verifyQuoteToken(data.signedQuoteToken);
      if (verified && verified.total_cents > 0) {
        calculatedQuote = verified;
      }
    }

    const unitAmountCents = calculatedQuote.total_cents;
    const priceInDollars = calculatedQuote.total_cents / 100;

    if (isLiveStripeConfigured()) {
      try {
        const lineItemDescription =
          serviceType === "hourly"
            ? `${data.hourlyDuration || 2}-Hour Private Luxury Charter (Seattle)`
            : `${(data.pickupAddress || "Seattle, WA").slice(0, 40)}... → ${(data.destinationAddress || "Sea-Tac Airport").slice(0, 40)}...`;

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: data.customerEmail || undefined,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: unitAmountCents,
                product_data: {
                  name: `Luna Limo — ${data.carTypeName || "Executive Fleet"}`,
                  description: lineItemDescription,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/booking`,
          metadata: {
            customerName: data.customerName || "",
            customerEmail: data.customerEmail || "",
            customerPhone: data.customerPhone || "",
            pickupAddress: data.pickupAddress || "",
            destinationAddress: data.destinationAddress || "",
            pickupDate: data.pickupDate || "",
            pickupTime: data.pickupTime || "12:00",
            carTypeName: data.carTypeName || "",
            passengers: String(data.passengers || 1),
            luggage: String(data.luggage || 1),
            serviceType: serviceType,
            hourlyDuration: String(data.hourlyDuration || ""),
            flightNumber: data.flightNumber || "",
            price: String(priceInDollars),
            distanceMiles: String(distanceMiles),
            durationMinutes: String(durationMinutes),
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeErr: any) {
        console.warn("Stripe Checkout Session creation failed (graceful fallback):", stripeErr.message);
        const bookingCode = `LL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        saveBookingRecord({
          id: bookingCode,
          customerName: data.customerName || "Executive Client",
          customerEmail: data.customerEmail || "concierge@lunalimoz.com",
          customerPhone: data.customerPhone || "(206) 327-4411",
          flightDetails: data.flightNumber || undefined,
          pickupAddress: data.pickupAddress || "Seattle, WA",
          destinationAddress: data.destinationAddress || "Seattle-Tacoma International Airport (SEA)",
          pickupDate: data.pickupDate || new Date().toISOString().split("T")[0],
          pickupTime: data.pickupTime || "12:00",
          carTypeName: data.carTypeName || "Executive Fleet",
          price: priceInDollars,
          passengers: Number(data.passengers || 1),
          luggage: Number(data.luggage || 1),
          serviceType: (serviceType as "point_to_point" | "hourly") || "point_to_point",
          hourlyDuration: data.hourlyDuration ? Number(data.hourlyDuration) : undefined,
          distance: distanceMiles,
          duration: durationMinutes,
          status: "pending_approval",
          paymentStatus: "unpaid",
          createdAt: Date.now(),
        });

        return NextResponse.json({
          url: `/booking/success?booking_id=${bookingCode}&price=${priceInDollars}`,
        });
      }
    }

    // Direct Booking Fallback when secret key is not configured (saves to Admin portal)
    const bookingCode = `LL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    saveBookingRecord({
      id: bookingCode,
      customerName: data.customerName || "Executive Client",
      customerEmail: data.customerEmail || "concierge@lunalimoz.com",
      customerPhone: data.customerPhone || "(206) 327-4411",
      flightDetails: data.flightNumber || undefined,
      pickupAddress: data.pickupAddress || "Seattle, WA",
      destinationAddress: data.destinationAddress || "Seattle-Tacoma International Airport (SEA)",
      pickupDate: data.pickupDate || new Date().toISOString().split("T")[0],
      pickupTime: data.pickupTime || "12:00",
      carTypeName: data.carTypeName || "Executive Fleet",
      price: priceInDollars,
      passengers: Number(data.passengers || 1),
      luggage: Number(data.luggage || 1),
      serviceType: (serviceType as "point_to_point" | "hourly") || "point_to_point",
      hourlyDuration: data.hourlyDuration ? Number(data.hourlyDuration) : undefined,
      distance: distanceMiles,
      duration: durationMinutes,
      status: "pending_approval",
      paymentStatus: "unpaid",
      createdAt: Date.now(),
    });

    return NextResponse.json({
      url: `/booking/success?booking_id=${bookingCode}&price=${priceInDollars}`,
    });
  } catch (err: any) {
    console.error("Next.js Checkout Session API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    if (sessionId.startsWith("mock_") || sessionId === "mock_session") {
      const mockRecord = saveBookingRecord({
        id: `LL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        customerName: "Executive Client",
        customerEmail: "client@example.com",
        customerPhone: "(206) 555-0199",
        pickupAddress: "Seattle, WA",
        destinationAddress: "Seattle-Tacoma International Airport (SEA)",
        pickupDate: new Date().toISOString().split("T")[0],
        pickupTime: "12:00",
        carTypeName: "Cadillac Escalade ESV",
        price: 165.0,
        passengers: 4,
        luggage: 4,
        serviceType: "point_to_point",
        distance: 20,
        duration: 30,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: Date.now(),
      });

      return NextResponse.json({
        status: "paid",
        amount: mockRecord.price,
        currency: "usd",
        paymentMethod: "card",
        rideId: mockRecord.id,
        rideData: mockRecord,
      });
    }

    if (!isLiveStripeConfigured()) {
      return NextResponse.json({
        status: "paid",
        amount: 165.0,
        currency: "usd",
        paymentMethod: "card",
        rideData: {},
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ status: "unpaid" });
    }

    const meta = session.metadata || {};
    const amount = (session.amount_total ?? 0) / 100;
    const bookingCode = `LL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const saved = saveBookingRecord({
      id: bookingCode,
      customerName: meta.customerName || session.customer_details?.name || "Executive Client",
      customerEmail: meta.customerEmail || session.customer_details?.email || "concierge@lunalimoz.com",
      customerPhone: meta.customerPhone || session.customer_details?.phone || "(206) 327-4411",
      flightDetails: meta.flightNumber || undefined,
      pickupAddress: meta.pickupAddress || "Seattle, WA",
      destinationAddress: meta.destinationAddress || "Seattle-Tacoma International Airport (SEA)",
      pickupDate: meta.pickupDate || new Date().toISOString().split("T")[0],
      pickupTime: meta.pickupTime || "12:00",
      carTypeName: meta.carTypeName || "Executive Fleet",
      price: amount,
      passengers: Number(meta.passengers || 1),
      luggage: Number(meta.luggage || 1),
      serviceType: (meta.serviceType as "point_to_point" | "hourly") || "point_to_point",
      hourlyDuration: meta.hourlyDuration ? Number(meta.hourlyDuration) : undefined,
      distance: Number(meta.distanceMiles || 20),
      duration: Number(meta.durationMinutes || 30),
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      status: "paid",
      amount,
      currency: session.currency ?? "usd",
      paymentMethod: session.payment_method_types?.[0] ?? "card",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      rideId: saved.id,
      rideData: {
        ...meta,
        customerName: saved.customerName,
        customerEmail: saved.customerEmail,
        customerPhone: saved.customerPhone,
        pickupAddress: saved.pickupAddress,
        destinationAddress: saved.destinationAddress,
        pickupDate: saved.pickupDate,
        pickupTime: saved.pickupTime,
        carTypeName: saved.carTypeName,
        price: saved.price,
      },
    });
  } catch (err: any) {
    console.error("Session verification API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
