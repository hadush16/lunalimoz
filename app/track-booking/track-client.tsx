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
  User, 
  CreditCard, 
  Loader2,
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
        setError(data.error || "Reservation not found. Please verify your reference code.");
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-[0.2em]">
          <CheckCircle className="h-3.5 w-3.5" />
          Confirmed &amp; Paid
        </span>
      );
    }
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 text-[10px] font-black uppercase tracking-[0.2em]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approved — Payment Ready
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 text-[10px] font-black uppercase tracking-[0.2em]">
          <XCircle className="h-3.5 w-3.5" />
          Reservation Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground border border-border text-[10px] font-black uppercase tracking-[0.2em]">
        <Clock className="h-3.5 w-3.5 animate-pulse text-gold" />
        Pending Dispatch Review
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-12 px-4 sm:px-6 transition-colors duration-200">
      <main className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Lookup Bar */}
        <section className="text-center space-y-4">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Luna Concierge Portal</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-foreground">
            Reservation <span className="text-gold">Status</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Track your itinerary details, review dispatch approval status, and manage payment options.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Reference Code (e.g. LUNA-84920)"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                className="w-full bg-secondary border border-border pl-11 pr-4 py-3.5 text-xs font-bold text-foreground outline-none focus:border-gold transition-colors uppercase placeholder:normal-case placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-md">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
            </Button>
          </form>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold p-3 max-w-md mx-auto text-center">
              {error}
            </div>
          )}
        </section>

        {/* Detailed Booking Display */}
        {booking && (
          <Card className="bg-card border border-border p-6 sm:p-8 rounded-none shadow-xl space-y-6 animate-fade-in">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
              <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Booking Reference</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-gold">{booking.id}</h2>
              </div>
              <div>{getStatusBadge(booking.status, booking.paymentStatus)}</div>
            </div>

            {/* Workflow Notice Box */}
            {booking.status === "pending_approval" && (
              <div className="bg-gold/10 border border-gold/30 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4" /> Concierge Dispatch Review in Progress
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Your reservation details have been received and are currently under dispatch review. Payment instructions will unlock automatically once our team confirms vehicle availability.
                </p>
              </div>
            )}

            {booking.status === "approved" && booking.paymentStatus !== "paid" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" /> Reservation Approved
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Great news! Your trip request has been verified and approved by dispatch. Please click below to complete your payment and finalize your private chauffeur.
                </p>
              </div>
            )}

            {/* Trip Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-secondary/40 p-5 border border-border space-y-4">
                <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Itinerary Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Pickup Location</p>
                    <p className="font-bold text-foreground mt-0.5">{booking.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Destination</p>
                    <p className="font-bold text-foreground mt-0.5">{booking.destinationAddress}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Date &amp; Time</p>
                      <p className="font-bold text-foreground mt-0.5">{booking.pickupDate} at {booking.pickupTime}</p>
                    </div>
                    {booking.serviceType === "hourly" && (
                      <div className="text-right">
                        <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Duration</p>
                        <p className="font-bold text-gold mt-0.5">{booking.hourlyDuration} Hours</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-secondary/40 p-5 border border-border space-y-4">
                <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="h-4 w-4" /> Passenger &amp; Vehicle
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Passenger</p>
                      <p className="font-bold text-foreground mt-0.5">{booking.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Vehicle Class</p>
                      <p className="font-bold text-foreground italic mt-0.5">{booking.carTypeName}</p>
                    </div>
                  </div>
                  {booking.flightDetails && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest flex items-center gap-1">
                        <Plane className="h-3 w-3 text-gold" /> Flight Info
                      </p>
                      <p className="font-bold text-foreground mt-0.5">{booking.flightDetails}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Email</p>
                      <p className="font-bold text-foreground mt-0.5 truncate max-w-[140px]">{booking.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Phone</p>
                      <p className="font-bold text-foreground mt-0.5">{booking.customerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary & Payment Action */}
            <div className="bg-secondary/50 p-6 border border-border flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Total Service Fare</p>
                <p className="font-serif font-black italic text-3xl sm:text-4xl text-gold">{formatPrice(booking.price)}</p>
              </div>

              <div className="w-full sm:w-auto">
                {booking.status === "approved" && booking.paymentStatus !== "paid" ? (
                  <Button
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" /> Complete Payment &amp; Confirm Ride
                      </>
                    )}
                  </Button>
                ) : booking.status === "pending_approval" ? (
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3 bg-secondary border border-border inline-block">
                      Payment Locked (Awaiting Dispatch Approval)
                    </span>
                  </div>
                ) : booking.status === "confirmed" || booking.paymentStatus === "paid" ? (
                  <div className="text-right">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Payment Complete
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-destructive text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
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
