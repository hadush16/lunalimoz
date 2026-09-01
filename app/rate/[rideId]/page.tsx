"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useSearchParams } from "next/navigation";
import { ReviewForm } from "@/components/ReviewForm";
import { ShieldCheck, Calendar, Car, CheckCircle2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import * as React from "react";
import Link from "next/link";

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
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-gold text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Validating Security Token...
        </div>
      </div>
    );
  }

  if (!validation.isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md space-y-4 bg-card border border-border p-8 shadow-xl">
          <div className="inline-block p-4 rounded-full bg-destructive/10 border border-destructive/30 mb-2">
            <ShieldCheck className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-foreground">Invalid Link</h1>
          <p className="text-muted-foreground text-xs font-medium leading-relaxed">
            This review link is either incorrect or expired. Please check your invitation or contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess || validation.hasReviewed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md space-y-6 bg-card border border-border p-8 sm:p-10 shadow-2xl">
          <div className="inline-block p-4 rounded-full bg-gold/10 border border-gold/30 mb-2 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-gold" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black italic uppercase text-foreground tracking-tight">
            Review <span className="text-gold">Received</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
            Your feedback has been committed to our archives. Thank you for choosing Luna Limo.
          </p>
          <div className="pt-4">
            <Link 
              href="/" 
              className="text-gold text-[10px] font-black uppercase tracking-[0.4em] border-b border-gold/30 pb-2 hover:border-gold transition-colors"
            >
              Return Home
            </Link>
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
    <main className="min-h-screen bg-background text-foreground transition-colors py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <header className="mb-12 space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30 bg-gold/10 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-[8px] font-black uppercase tracking-widest italic">Service Feedback</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl font-black italic uppercase tracking-tight leading-tight text-foreground">
            How was your <br />
            <span className="text-gold">Journey?</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
             <div className="flex items-center gap-3 p-4 bg-card border border-border shadow-sm">
               <Calendar className="h-4 w-4 text-gold" />
               <div className="text-left">
                 <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">Date</p>
                 <p className="text-xs font-bold uppercase text-foreground">{validation.ride?.pickupDate}</p>
               </div>
             </div>
             <div className="flex items-center gap-3 p-4 bg-card border border-border shadow-sm">
               <Car className="h-4 w-4 text-gold" />
               <div className="text-left">
                 <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">Vehicle Class</p>
                 <p className="text-xs font-bold uppercase text-foreground">{validation.ride?.carTypeName}</p>
               </div>
             </div>
          </div>
        </header>

        <section className="bg-card border border-border p-8 sm:p-12 relative overflow-hidden shadow-xl">
           <ReviewForm onSubmit={handleReviewSubmit} />
        </section>
      </div>
    </main>
  );
}
