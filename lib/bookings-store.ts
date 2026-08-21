import fs from "fs";
import path from "path";

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
  updatedAt: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "bookings.json");

const SEED_BOOKINGS: BookingRecord[] = [
  {
    id: "LUNA-84920",
    customerName: "Alexander Wright",
    customerEmail: "alexander.wright@example.com",
    customerPhone: "(206) 555-0192",
    flightDetails: "DL 1482 - SEA Airport",
    pickupAddress: "Seattle-Tacoma Intl Airport (SEA)",
    destinationAddress: "Four Seasons Hotel Seattle",
    pickupDate: "2026-08-22",
    pickupTime: "14:30",
    carTypeName: "Executive Sedan",
    price: 185.00,
    passengers: 2,
    luggage: 2,
    serviceType: "point_to_point",
    distance: 23.4,
    duration: 28,
    status: "pending_approval",
    paymentStatus: "unpaid",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "LUNA-73915",
    customerName: "Sophia Martinez",
    customerEmail: "sophia.m@example.com",
    customerPhone: "(206) 555-0841",
    pickupAddress: "Downtown Seattle Waterfront",
    destinationAddress: "Bellevue Club Hotel",
    pickupDate: "2026-08-22",
    pickupTime: "18:00",
    carTypeName: "Luxury SUV",
    price: 290.00,
    passengers: 4,
    luggage: 4,
    serviceType: "point_to_point",
    distance: 18.2,
    duration: 22,
    status: "approved",
    paymentStatus: "unpaid",
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: "LUNA-62841",
    customerName: "Marcus Vance",
    customerEmail: "m.vance@vancetech.com",
    customerPhone: "(425) 555-0133",
    pickupAddress: "Bellevue Corporate Center",
    destinationAddress: "Microsoft Campus Building 92",
    pickupDate: "2026-08-21",
    pickupTime: "09:00",
    carTypeName: "Executive Van",
    price: 420.00,
    passengers: 8,
    luggage: 6,
    serviceType: "hourly",
    hourlyDuration: 4,
    distance: 35.0,
    duration: 60,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
  }
];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(SEED_BOOKINGS, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error initializing bookings store:", err);
  }
}

export function getAllBookings(): BookingRecord[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    const bookings = JSON.parse(data) as BookingRecord[];
    return bookings.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return SEED_BOOKINGS;
  }
}

export function getBookingById(id: string): BookingRecord | null {
  const bookings = getAllBookings();
  return bookings.find(b => b.id.toLowerCase() === id.toLowerCase()) || null;
}

export function saveBooking(booking: Omit<BookingRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): BookingRecord {
  ensureDataFile();
  const bookings = getAllBookings();
  const id = booking.id || `LUNA-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = Date.now();

  const newBooking: BookingRecord = {
    ...booking,
    id,
    status: booking.status || "pending_approval",
    paymentStatus: booking.paymentStatus || "unpaid",
    createdAt: now,
    updatedAt: now,
  };

  const updatedBookings = [newBooking, ...bookings.filter(b => b.id !== id)];
  fs.writeFileSync(FILE_PATH, JSON.stringify(updatedBookings, null, 2), "utf8");
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: "pending_approval" | "approved" | "confirmed" | "cancelled",
  paymentStatus?: "unpaid" | "paid",
  adminNotes?: string
): BookingRecord | null {
  ensureDataFile();
  const bookings = getAllBookings();
  const index = bookings.findIndex(b => b.id.toLowerCase() === id.toLowerCase());
  
  if (index === -1) return null;

  const target = bookings[index];
  target.status = status;
  if (paymentStatus) {
    target.paymentStatus = paymentStatus;
  }
  if (adminNotes !== undefined) {
    target.adminNotes = adminNotes;
  }
  target.updatedAt = Date.now();

  bookings[index] = target;
  fs.writeFileSync(FILE_PATH, JSON.stringify(bookings, null, 2), "utf8");
  return target;
}
