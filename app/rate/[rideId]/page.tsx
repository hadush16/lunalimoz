"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useSearchParams } from "next/navigation";
import { ReviewForm } from "@/components/ReviewForm";
import { ShieldCheck, Calendar, Car, MapPin, CheckCircle2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import * as React from "react";

export default function RateRidePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const rideId = params.rideId as Id<"rides">;
  const token = searchParams.get("token") || "";

  const validation = useQuery(api.reviews.getByRideToken, { rideId, token });
  const submitReview = useMutation(api.reviews.submit);

  const [isSuccess, setIsSuccess] = React.useState(false);

  if (validation === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Validating Security Token...
        </div>
      </div>
    );
  }

  if (!validation.isValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="inline-block p-4 rounded-full bg-red-950/30 border border-red-900/50 mb-4">
            <ShieldCheck className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="font-serif text-3xl font-black italic uppercase text-white">Invalid Link</h1>
          <p className="text-neutral-500 text-xs font-medium">
            This review link is either incorrect or expired. Please check your invitation or contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess || validation.hasReviewed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="inline-block p-4 rounded-full bg-gold/10 border border-gold/30 mb-4 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-gold" />
          </div>
          <h1 className="font-serif text-4xl font-black italic uppercase text-white tracking-tight">
            Review <span className="text-gold">Received</span>
          </h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
            Your feedback has been committed to our archives. Thank you for choosing Luna Limo.
          </p>
          <div className="pt-8">
            <a 
              href="https://lunalimoz.com" 
              className="text-gold text-[10px] font-black uppercase tracking-[0.4em] border-b border-gold/30 pb-2 hover:border-gold transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = async (data: { rating: number; comment?: string }) => {
    try {
      await submitReview({
        rideId,
        token,
        rating: data.rating,
        comment: data.comment,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-gold/30">
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-32">
        <header className="mb-16 space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/20 bg-gold/5 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-[8px] font-black uppercase tracking-widest italic">Service Feedback</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-tight">
            How was your <br />
            <span className="text-gold">Journey?</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
             <div className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800">
               <Calendar className="h-4 w-4 text-gold" />
               <div className="text-left">
                 <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest">Date</p>
                 <p className="text-[10px] font-bold uppercase">{validation.ride?.pickupDate}</p>
               </div>
             </div>
             <div className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800">
               <Car className="h-4 w-4 text-gold" />
               <div className="text-left">
                 <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest">Vehicle Class</p>
                 <p className="text-[10px] font-bold uppercase">{validation.ride?.carTypeName}</p>
               </div>
             </div>
          </div>
        </header>

        <section className="bg-neutral-900/30 border border-neutral-800 p-8 sm:p-12 relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 h-64 w-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-colors duration-1000" />
           <ReviewForm onSubmit={handleReviewSubmit} />
        </section>
      </div>
    </main>
  );
}
