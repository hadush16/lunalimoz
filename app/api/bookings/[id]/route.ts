import { NextResponse } from "next/server";
import { getBookingById } from "@/lib/bookings-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch booking status" }, { status: 500 });
  }
}
