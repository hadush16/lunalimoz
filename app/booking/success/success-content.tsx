"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
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
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("No session ID provided.");
      return;
    }

    const verifyAndCreate = async () => {
      try {
        const result = await verifyCheckoutSession(sessionId);
        console.log("verifyCheckoutSession result:", result);

        if (result.status === "already_processed") {
          setStatus("already_processed");
          setRideId(result.rideId);
          return;
        }

        if (result.status === "unpaid") {
          setStatus("error");
          setErrorMessage("Payment was not completed. Please try booking again.");
          return;
        }

        if (result.status === "paid") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rideData = result.rideData as Record<string, any>;
          console.log("Creating ride with rideData:", rideData);

          const customerEmail = (rideData.customerEmail as string | undefined) || "noemail@lunalimo.com";

          const createdRideId = await createRide({
            pickupAddress: rideData.pickupAddress,
            destinationAddress: rideData.destinationAddress,
            pickupLat: Number(rideData.pickupLat),
            pickupLng: Number(rideData.pickupLng),
            destLat: Number(rideData.destLat),
            destLng: Number(rideData.destLng),
            distance: Number(rideData.distance),
            duration: Number(rideData.duration),
            carTypeName: rideData.carTypeName,
            carTypeMultiplier: Number(rideData.carTypeMultiplier),
            price: Number(rideData.price),
            passengers: Number(rideData.passengers),
            luggage: Number(rideData.luggage),
            accessible: rideData.accessible === true || rideData.accessible === "true",
            serviceType: rideData.serviceType as "point_to_point" | "hourly",
            hourlyDuration: rideData.hourlyDuration ? Number(rideData.hourlyDuration) : undefined,
            pickupDate: rideData.pickupDate,
            pickupTime: rideData.pickupTime,
            customerName: rideData.customerName,
            customerEmail: customerEmail,
            customerPhone: rideData.customerPhone,
            stripeCheckoutSessionId: sessionId,
          });

          console.log("Ride created successfully, id:", createdRideId);
          setRideId(String(createdRideId));
          setAmount(result.amount);
          setStatus("success");
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Error in verifyAndCreate:", msg, error);
        setStatus("error");
        setErrorMessage(`Failed to process your booking: ${msg}. Contact support if your payment was successful.`);
      }
    };

    verifyAndCreate();
  }, [sessionId]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/20">
            <CheckCircle className="h-12 w-12 text-gold" />
          </div>
          <h2 className="font-serif text-3xl font-black italic uppercase">
            Processing <span className="text-gold">Payment</span>
          </h2>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
            Please wait while we confirm your booking...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-8 px-4">
          <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center mx-auto border border-red-800">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="font-serif text-3xl font-black italic uppercase">
            Payment <span className="text-red-400">Failed</span>
          </h2>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
            {errorMessage}
          </p>
          <Button
            onClick={() => router.push("/booking")}
            className="bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg"
          >
            Return to Booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "already_processed") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-8 px-4">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/20">
            <CheckCircle className="h-12 w-12 text-gold" />
          </div>
          <h2 className="font-serif text-3xl font-black italic uppercase">
            Booking <span className="text-gold">Confirmed</span>
          </h2>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
            Your booking has already been processed. Our concierge will contact you shortly.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg"
          >
            Return Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <main className="max-w-4xl mx-auto py-20 px-4 sm:px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8 border border-gold/20">
          <CheckCircle className="h-12 w-12 text-gold" />
        </div>
        <h2 className="font-serif text-4xl md:text-6xl font-black italic uppercase mb-4 text-white">
          Booking <span className="text-gold">Confirmed</span>
        </h2>
        <p className="text-neutral-400 mb-12 font-bold uppercase tracking-widest text-xs">
          Payment successful. Your luxury ride has been reserved. Our concierge will contact you shortly.
        </p>

        <Card className="max-w-md mx-auto p-8 mb-12 border-neutral-800 shadow-2xl bg-neutral-900 text-left rounded-none">
          <h3 className="font-serif font-black italic uppercase text-xl mb-6 pb-2 border-b border-neutral-800 text-gold">Booking Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Status</span>
              <span className="text-sm font-bold text-gold">PAID</span>
            </div>
            {rideId && (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Booking ID</span>
                <span className="text-sm font-bold text-gold">{rideId}</span>
              </div>
            )}
            {amount && (
              <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-500 font-black uppercase text-[11px] tracking-widest">Total Paid</span>
                <span className="text-2xl font-serif font-black italic text-gold">
                  {formatPrice(amount)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Button
          onClick={() => router.push("/")}
          className="bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg"
        >
          Return Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}
