import { NextResponse } from "next/server";
import { getAllBookings, saveBooking } from "@/lib/bookings-store";

export async function GET() {
  try {
    const bookings = getAllBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json({ success: false, error: "Missing required passenger details" }, { status: 400 });
    }

    const booking = saveBooking({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      flightDetails: body.flightDetails || "",
      pickupAddress: body.pickupAddress || "Seattle-Tacoma Intl Airport (SEA)",
      destinationAddress: body.destinationAddress || "Downtown Seattle Waterfront",
      pickupDate: body.pickupDate || new Date().toISOString().split("T")[0],
      pickupTime: body.pickupTime || "12:00",
      carTypeName: body.carTypeName || "Executive Sedan",
      price: Number(body.price) || 185.00,
      passengers: Number(body.passengers) || 1,
      luggage: Number(body.luggage) || 1,
      serviceType: body.serviceType || "point_to_point",
      hourlyDuration: body.hourlyDuration ? Number(body.hourlyDuration) : undefined,
      distance: Number(body.distance) || 18.5,
      duration: Number(body.duration) || 25,
      status: "pending_approval",
      paymentStatus: "unpaid",
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ success: false, error: "Failed to submit reservation" }, { status: 500 });
  }
}
