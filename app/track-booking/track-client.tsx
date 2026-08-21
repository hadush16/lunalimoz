"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  User, 
  CreditCard, 
  Loader2,
  ArrowRight,
  Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/pricing";

interface BookingData {
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
  status: "pending_approval" | "approved" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  adminNotes?: string;
  createdAt: number;
}

export default function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") || "";

  const [bookingIdInput, setBookingIdInput] = React.useState(initialId);
  const [booking, setBooking] = React.useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchBooking = React.useCallback(async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setBooking(data.booking);
      } else {
        setBooking(null);
        setError(data.error || "Reservation not found. Please check your booking reference code.");
      }
    } catch {
      setBooking(null);
      setError("Network error. Could not retrieve booking status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialId) {
      fetchBooking(initialId);
    }
  }, [initialId, fetchBooking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingIdInput.trim()) {
      router.push(`/track-booking?id=${encodeURIComponent(bookingIdInput.trim())}`);
      fetchBooking(bookingIdInput);
    }
  };

  const handleCompletePayment = async () => {
    if (!booking) return;
    setIsProcessingPayment(true);
    try {
      // Simulate payment processing or call Stripe checkout
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed", paymentStatus: "paid" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBooking(data.booking);
      } else {
        setError(data.error || "Payment verification failed.");
      }
    } catch {
      setError("Failed to process payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: BookingData["status"], paymentStatus: BookingData["paymentStatus"]) => {
    if (status === "confirmed" || paymentStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 text-[10px] font-black uppercase tracking-[0.2em]">
          <CheckCircle className="h-3.5 w-3.5" />
          Confirmed & Paid
        </span>
      );
    }
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black uppercase tracking-[0.2em]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approved - Payment Ready
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950 text-red-400 border border-red-800 text-[10px] font-black uppercase tracking-[0.2em]">
          <XCircle className="h-3.5 w-3.5" />
          Reservation Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-black uppercase tracking-[0.2em]">
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        Pending Admin Approval
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans py-12 px-4 sm:px-6">
      <main className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Lookup Bar */}
        <section className="text-center space-y-6">
          <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Luna Concierge Portal</h3>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white">
            Reservation <span className="text-gold">Status</span>
          </h1>
          
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Enter Booking Reference (e.g. LUNA-84920)"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 pl-11 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-gold transition-colors uppercase placeholder:normal-case placeholder:text-neutral-600"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-gold hover:bg-gold-dark text-white rounded-none px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 border-gold-dark">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
            </Button>
          </form>

          {error && (
            <div className="bg-red-950/40 border border-red-900 text-red-400 text-xs font-bold p-4 max-w-md mx-auto text-center">
              {error}
            </div>
          )}
        </section>

        {/* Detailed Booking Display */}
        {booking && (
          <Card className="bg-neutral-900 border border-neutral-800 p-6 sm:p-10 rounded-none shadow-2xl space-y-8 animate-fade-in">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-800">
              <div>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Booking Reference</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-gold">{booking.id}</h2>
              </div>
              <div>{getStatusBadge(booking.status, booking.paymentStatus)}</div>
            </div>

            {/* Workflow Notice Box */}
            {booking.status === "pending_approval" && (
              <div className="bg-amber-950/20 border border-amber-900/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4" /> Concierge Review in Progress
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                  Your reservation details have been received and are currently under dispatch review. Payment instructions will unlock automatically once our team confirms vehicle availability for your scheduled time.
                </p>
              </div>
            )}

            {booking.status === "approved" && booking.paymentStatus !== "paid" && (
              <div className="bg-emerald-950/20 border border-emerald-800/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" /> Reservation Approved
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed font-medium">
                  Great news! Your trip request has been verified and approved by our dispatch manager. Please click below to complete your payment and secure your private chauffeur.
                </p>
              </div>
            )}

            {/* Trip Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-black p-5 border border-neutral-800 space-y-4">
                <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Itinerary Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Pickup Location</p>
                    <p className="font-bold text-white mt-0.5">{booking.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Destination</p>
                    <p className="font-bold text-white mt-0.5">{booking.destinationAddress}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-800">
                    <div>
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Date & Time</p>
                      <p className="font-bold text-white mt-0.5">{booking.pickupDate} at {booking.pickupTime}</p>
                    </div>
                    {booking.serviceType === "hourly" && (
                      <div className="text-right">
                        <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Duration</p>
                        <p className="font-bold text-gold mt-0.5">{booking.hourlyDuration} Hours</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-black p-5 border border-neutral-800 space-y-4">
                <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="h-4 w-4" /> Passenger & Vehicle
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Passenger</p>
                      <p className="font-bold text-white mt-0.5">{booking.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Vehicle Class</p>
                      <p className="font-bold text-white italic mt-0.5">{booking.carTypeName}</p>
                    </div>
                  </div>
                  {booking.flightDetails && (
                    <div className="pt-2 border-t border-neutral-800">
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1">
                        <Plane className="h-3 w-3 text-gold" /> Flight Info
                      </p>
                      <p className="font-bold text-white mt-0.5">{booking.flightDetails}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-neutral-800">
                    <div>
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Email</p>
                      <p className="font-bold text-neutral-300 mt-0.5">{booking.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 font-bold uppercase text-[9px] tracking-widest">Phone</p>
                      <p className="font-bold text-neutral-300 mt-0.5">{booking.customerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary & Payment Action */}
            <div className="bg-black p-6 border border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Service Fare</p>
                <p className="font-serif font-black italic text-4xl text-gold">{formatPrice(booking.price)}</p>
              </div>

              <div className="w-full sm:w-auto">
                {booking.status === "approved" && booking.paymentStatus !== "paid" ? (
                  <Button
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-10 py-7 text-xs font-black uppercase tracking-[0.2em] border-b-4 border-gold-dark shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" /> Complete Payment & Confirm Ride
                      </>
                    )}
                  </Button>
                ) : booking.status === "pending_approval" ? (
                  <Button disabled className="w-full sm:w-auto bg-neutral-800 text-neutral-500 border border-neutral-700 rounded-none px-8 py-6 text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                    Payment Locked (Awaiting Admin Approval)
                  </Button>
                ) : booking.status === "confirmed" || booking.paymentStatus === "paid" ? (
                  <div className="text-right">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Payment Complete
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" /> Cancelled
                    </span>
                  </div>
                )}
              </div>
            </div>

          </Card>
        )}

      </main>
    </div>
  );
}
