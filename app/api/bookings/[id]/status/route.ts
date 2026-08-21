import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/bookings-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, paymentStatus, adminNotes } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "Missing status field" }, { status: 400 });
    }

    const updated = updateBookingStatus(id, status, paymentStatus, adminNotes);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update booking status" }, { status: 500 });
  }
}
