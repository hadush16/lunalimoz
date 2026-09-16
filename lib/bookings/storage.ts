export interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightDetails?: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  carTypeName: string;
  price: number;
  passengers: number;
  luggage: number;
  serviceType: "point_to_point" | "hourly";
  hourlyDuration?: number;
  distance: number;
  duration: number;
  status: "pending_approval" | "approved" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  adminNotes?: string;
  createdAt: number;
  stripePaymentIntentId?: string;
}

// Global server in-memory store preserved across hot reloads in Next.js
declare global {
  var __LUNA_BOOKINGS__: BookingRecord[] | undefined;
}

if (!global.__LUNA_BOOKINGS__) {
  global.__LUNA_BOOKINGS__ = [];
}

export function getStoredBookings(): BookingRecord[] {
  return global.__LUNA_BOOKINGS__ || [];
}

export function saveBookingRecord(record: BookingRecord): BookingRecord {
  if (!global.__LUNA_BOOKINGS__) {
    global.__LUNA_BOOKINGS__ = [];
  }
  
  const existingIdx = global.__LUNA_BOOKINGS__.findIndex((b) => b.id === record.id);
  if (existingIdx >= 0) {
    global.__LUNA_BOOKINGS__[existingIdx] = {
      ...global.__LUNA_BOOKINGS__[existingIdx],
      ...record,
    };
    return global.__LUNA_BOOKINGS__[existingIdx];
  }

  global.__LUNA_BOOKINGS__.unshift(record);
  return record;
}

export function updateBookingStatus(
  id: string,
  status: BookingRecord["status"]
): BookingRecord | null {
  if (!global.__LUNA_BOOKINGS__) return null;
  const booking = global.__LUNA_BOOKINGS__.find((b) => b.id === id);
  if (booking) {
    booking.status = status;
    return booking;
  }
  return null;
}
