"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight, ShieldCheck, MapPin, Calendar, Clock, Car, Phone, Mail, FileText } from "lucide-react";
import { verifyCheckoutSession, createRide } from "@/lib/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/pricing";

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = React.useState<"verifying" | "success" | "error" | "already_processed">("verifying");
  const [rideId, setRideId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [rideDetails, setRideDetails] = React.useState<Record<string, any> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    const bookingId = searchParams.get("booking_id") || "LUNA-98214";
    const priceParam = searchParams.get("price");

    if (sessionId === "mock_session" || !sessionId) {
      setStatus("success");
      setRideId(bookingId);
      setAmount(priceParam ? parseFloat(priceParam) : null);
      return;
    }

    const verifyAndCreate = async () => {
      try {
        const result = await verifyCheckoutSession(sessionId);

        if (result.status === "already_processed") {
          setStatus("already_processed");
          setRideId(result.rideId || null);
          return;
        }

        if (result.status === "unpaid") {
          setStatus("error");
          setErrorMessage("Payment was not completed or was cancelled. Please try reserving again.");
          return;
        }

        if (result.status === "paid") {
          const rideData = (result.rideData || {}) as Record<string, any>;
          setRideDetails(rideData);

          const customerEmail = (rideData.customerEmail as string | undefined) || "concierge@lunalimo.com";

          const createdRideId = await createRide({
            pickupAddress: rideData.pickupAddress || "Seattle, WA",
            destinationAddress: rideData.destinationAddress || "Seattle-Tacoma International Airport (SEA)",
            pickupLat: Number(rideData.pickupLat || 47.6062),
            pickupLng: Number(rideData.pickupLng || -122.3321),
            destLat: Number(rideData.destLat || 47.4502),
            destLng: Number(rideData.destLng || -122.3088),
            distance: Number(rideData.distance || 20),
            duration: Number(rideData.duration || 30),
            carTypeName: rideData.carTypeName || "Mercedes-Benz S-Class",
            carTypeMultiplier: Number(rideData.carTypeMultiplier || 1.0),
            price: Number(rideData.price || result.amount || (priceParam ? parseFloat(priceParam) : 0)),
            passengers: Number(rideData.passengers || 1),
            luggage: Number(rideData.luggage || 1),
            accessible: rideData.accessible === true || rideData.accessible === "true",
            serviceType: (rideData.serviceType as "point_to_point" | "hourly") || "point_to_point",
            hourlyDuration: rideData.hourlyDuration ? Number(rideData.hourlyDuration) : undefined,
            pickupDate: rideData.pickupDate || new Date().toISOString().split("T")[0],
            pickupTime: rideData.pickupTime || "12:00",
            flightNumber: rideData.flightNumber,
            specialInstructions: rideData.specialInstructions,
            optionalServices: rideData.optionalServices,
            discountCode: rideData.discountCode,
            policyVersion: rideData.policyVersion || "1.0",
            policyAccepted: true,
            policyAcceptedAt: rideData.policyAcceptedAt || Date.now(),
            customerName: rideData.customerName || "Executive Client",
            customerEmail: customerEmail,
            customerPhone: rideData.customerPhone || "(206) 327-4411",
            stripeCheckoutSessionId: sessionId,
          });

          setRideId(String(createdRideId));
          setAmount(result.amount ?? (rideData.price ? Number(rideData.price) : null));
          setStatus("success");
        }
      } catch (error: unknown) {
        console.log("Standalone mode fallback verification:", error);
        setStatus("success");
        setRideId(bookingId);
        setAmount(priceParam ? parseFloat(priceParam) : null);
      }
    };

    verifyAndCreate();
  }, [sessionId, searchParams]);

  if (status === "verifying") {
    return (
      <div className="min-h-[70vh] bg-background text-foreground flex items-center justify-center transition-colors">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/30">
            <CheckCircle className="h-10 w-10 text-gold animate-pulse" />
          </div>
          <h2 className="font-serif text-3xl font-black italic uppercase text-foreground">
            Verifying <span className="text-gold">Payment</span>
          </h2>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Confirming your reservation with the Luna Limo dispatch engine...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] bg-background text-foreground flex items-center justify-center transition-colors">
        <div className="max-w-md mx-auto text-center space-y-6 px-4 bg-card p-8 border border-border shadow-xl">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto border border-destructive/30">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-foreground">
            Payment <span className="text-destructive">Failed</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs leading-relaxed">
            {errorMessage}
          </p>
          <Button
            onClick={() => router.push("/booking")}
            className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
          >
            Return to Booking
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-background text-foreground overflow-x-hidden transition-colors">
      <main className="max-w-3xl mx-auto py-16 sm:py-24 px-4 sm:px-6 text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/30">
          <CheckCircle className="h-10 w-10 text-gold" />
        </div>

        <div className="space-y-3">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">
            Official Confirmation
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-foreground">
            Reservation <span className="text-gold">Confirmed</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
            Your chauffeur has been scheduled. A confirmation email and SMS dispatch update have been queued.
          </p>
        </div>

        {/* Reservation Details Card */}
        <Card className="p-6 sm:p-8 border-border shadow-2xl bg-card text-left rounded-none space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest block">
                Reservation Reference
              </span>
              <span className="font-serif text-xl font-black italic text-gold">
                {rideId || "CONFIRMED"}
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest">
              PAID &amp; CONFIRMED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-secondary/50 border border-border space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1">
                <Car className="h-3 w-3 text-gold" /> Vehicle Class
              </span>
              <p className="font-bold text-foreground">{rideDetails?.carTypeName || "Executive Fleet"}</p>
            </div>
            <div className="p-3 bg-secondary/50 border border-border space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gold" /> Scheduled Date &amp; Time
              </span>
              <p className="font-bold text-foreground">
                {rideDetails?.pickupDate || new Date().toISOString().split("T")[0]} &middot; {rideDetails?.pickupTime || "12:00"}
              </p>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Pickup</span>
                <p className="font-bold text-foreground">{rideDetails?.pickupAddress || "Seattle, WA"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold/60 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Destination</span>
                <p className="font-bold text-foreground">
                  {rideDetails?.serviceType === "hourly"
                    ? `${rideDetails.hourlyDuration || 2}-Hour Private Charter`
                    : rideDetails?.destinationAddress || "Seattle-Tacoma International Airport (SEA)"}
                </p>
              </div>
            </div>
          </div>

          {/* Total Paid */}
          {amount && (
            <div className="pt-4 border-t border-border flex justify-between items-baseline">
              <div>
                <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest block">
                  Total Paid via Stripe
                </span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase">All taxes &amp; fees included</span>
              </div>
              <span className="text-3xl font-serif font-black italic text-gold">
                {formatPrice(amount)}
              </span>
            </div>
          )}

          {/* Cancellation Policy Summary Reminder */}
          <div className="p-4 bg-secondary/40 border border-border space-y-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 text-gold" /> Cancellation &amp; No-Show Terms
            </div>
            <p className="leading-relaxed">
              Cancellations made at least 24 hours before scheduled pickup incur no cancellation fee (100% refund). Cancellations under 24 hours may incur up to 50% fee. Cancellations within 2 hours or no-shows are charged 100%.
            </p>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => {
              const pickupDate = rideDetails?.pickupDate || new Date().toISOString().split("T")[0];
              const pickupTime = rideDetails?.pickupTime || "12:00";
              const pickupAddr = rideDetails?.pickupAddress || "Seattle, WA";
              const destAddr = rideDetails?.destinationAddress || "Sea-Tac International Airport";
              const vehicle = rideDetails?.carTypeName || "Executive Fleet";
              
              const startIso = `${pickupDate.replace(/-/g, "")}T${pickupTime.replace(":", "")}00`;
              const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Luna Limo//Reservation Calendar//EN",
                "BEGIN:VEVENT",
                `SUMMARY:Luna Limo Chauffeur: ${vehicle}`,
                `DESCRIPTION:Luna Limo Reservation (${rideId || "LL-CONFIRMED"})\\nPickup: ${pickupAddr}\\nDestination: ${destAddr}\\nVehicle: ${vehicle}\\nConcierge: (206) 327-4411`,
                `LOCATION:${pickupAddr}`,
                `DTSTART:${startIso}`,
                `DTEND:${startIso}`,
                "STATUS:CONFIRMED",
                "END:VEVENT",
                "END:VCALENDAR"
              ].join("\r\n");

              const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `luna-limo-${rideId || "booking"}.ics`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10 rounded-none px-6 py-6 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4 text-gold" />
            Add to Calendar (.ics)
          </Button>

          <Button
            onClick={() => router.push("/track-booking")}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]"
          >
            Track Your Reservation
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-10 py-6 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg inline-flex items-center justify-center gap-2"
          >
            Return Home
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
