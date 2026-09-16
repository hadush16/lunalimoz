import { NextRequest, NextResponse } from "next/server";
import { stripe, isLiveStripeConfigured } from "@/lib/stripe/server";
import { saveBookingRecord } from "@/lib/bookings/storage";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const priceInDollars = Number(data.price || 185.0);
    const unitAmountCents = Math.round(priceInDollars * 100);

    if (isLiveStripeConfigured()) {
      try {
        const lineItemDescription =
          data.serviceType === "hourly"
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
            serviceType: data.serviceType || "point_to_point",
            hourlyDuration: String(data.hourlyDuration || ""),
            flightNumber: data.flightNumber || "",
            price: String(priceInDollars),
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeErr: any) {
        console.error("Stripe Checkout Session creation error:", stripeErr);
        return NextResponse.json(
          { error: stripeErr.message || "Failed to create Stripe Checkout session." },
          { status: 400 }
        );
      }
    }

    // In production, require STRIPE_SECRET_KEY
    const isProduction =
      process.env.NODE_ENV === "production" ||
      origin.includes("lunalimoz.com");

    if (isProduction) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY is not configured on the production server. Please add your Stripe Secret Key to your hosting environment variables.",
        },
        { status: 500 }
      );
    }

    // Development / Mock mode
    return NextResponse.json({
      url: `/booking/success?session_id=mock_session_${Date.now()}&price=${priceInDollars}`,
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
        price: 185.0,
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
        amount: 185.0,
        currency: "usd",
        paymentMethod: "card",
        rideId: mockRecord.id,
        rideData: mockRecord,
      });
    }

    if (!isLiveStripeConfigured()) {
      return NextResponse.json({
        status: "paid",
        amount: 185.0,
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
      distance: 20,
      duration: 30,
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent as string | undefined,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      status: "paid",
      amount,
      currency: session.currency ?? "usd",
      paymentMethod: session.payment_method_types?.[0] ?? "card",
      stripePaymentIntentId: session.payment_intent as string | null,
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
