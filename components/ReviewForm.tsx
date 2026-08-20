"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment?: string }) => void;
  isSubmitting?: boolean;
}

export function ReviewForm({ onSubmit, isSubmitting }: ReviewFormProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-6">
        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Select Your Experience
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="group relative focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 transition-all duration-300",
                  (hoveredRating || rating) >= star
                    ? "text-gold fill-gold scale-110"
                    : "text-neutral-800 fill-transparent hover:text-neutral-600"
                )}
              />
              {rating === star && (
                <span className="absolute inset-0 bg-gold/20 blur-xl rounded-full -z-10 animate-pulse" />
              )}
            </button>
          ))}
        </div>
        <p className="text-gold font-serif italic text-sm font-black uppercase tracking-widest min-h-[1.5em]">
          {rating === 1 && "Extremely Poor"}
          {rating === 2 && "Below Expectations"}
          {rating === 3 && "Average Service"}
          {rating === 4 && "Great Experience"}
          {rating === 5 && "Exemplary Excellence"}
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">
          Additional Comments <span className="text-neutral-700 italic font-medium">(Optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe your journey with Luna Limo..."
          className="w-full bg-neutral-950 border border-neutral-800 text-white p-6 text-sm font-medium focus:border-gold outline-none transition-all duration-300 h-32 resize-none placeholder:text-neutral-700 hover:border-neutral-700"
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className={cn(
          "w-full bg-gold hover:bg-gold-dark text-white rounded-none py-8 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 relative overflow-hidden group",
          (rating === 0 || isSubmitting) && "opacity-50 grayscale cursor-not-allowed"
        )}
      >
        <span className="relative z-10">
          {isSubmitting ? "Finalizing Review..." : "Submit to the Collection"}
        </span>
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </Button>
      
      <p className="text-center text-neutral-600 text-[9px] font-medium uppercase tracking-[0.1em]">
        By submitting, you help us maintain the Luna standard.
      </p>
    </form>
  );
}
