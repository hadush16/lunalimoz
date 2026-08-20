"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star, MessageSquareQuote } from "lucide-react";

export default function AdminReviewsPage() {
  const reviews = useQuery(api.reviews.listWithRides, { limit: 100 });
  const stats = useQuery(api.reviews.getStats);

  if (reviews === undefined || stats === undefined) {
    return (
      <div className="p-12 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs h-[80vh] flex items-center justify-center">
        Loading Review Intelligence...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          Client <span className="text-gold">Feedback</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Monitor and analyze customer satisfaction
        </p>
      </header>

      {/* Aggregate Stats */}
      <section className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
        <div className="flex flex-col items-center justify-center md:border-r border-neutral-800 md:pr-12">
          <h2 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Overall Score</h2>
          <div className="flex items-end gap-2 text-white font-serif text-6xl font-black italic">
            {stats.average.toFixed(1)} <span className="text-2xl text-gold mb-2">/ 5</span>
          </div>
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-4">
            {stats.total} Total Reviews
          </p>
          <div className="flex gap-1 mt-4">
             {[1,2,3,4,5].map(i => (
                <Star key={i} className={`h-6 w-6 ${i <= Math.round(stats.average) ? "text-gold fill-gold" : "text-neutral-800 fill-neutral-800"}`} />
             ))}
          </div>
        </div>

        <div className="flex-1 w-full space-y-4 pt-4 md:pt-0">
          <h2 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center md:text-left">Rating Distribution</h2>
          <div className="space-y-3">
            {[5,4,3,2,1].map((stars, idx) => {
              const count = stats.distribution[5 - stars] || 0;
              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-4 text-xs font-bold">
                  <span className="w-12 text-gold flex items-center gap-1">{stars} <Star className="h-3 w-3 fill-gold" /></span>
                  <div className="flex-1 h-3 bg-neutral-800 relative">
                    <div className="absolute top-0 left-0 h-full bg-gold" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-neutral-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Feed */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
               <MessageSquareQuote className="h-4 w-4" /> 
               Recent Reviews
            </h2>
        </div>

        <div className="divide-y divide-neutral-800">
          {reviews.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
               No reviews collected yet
             </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-neutral-800/20 transition-colors flex flex-col md:flex-row gap-6">
                 <div className="md:w-64 space-y-3 border-b md:border-b-0 md:border-r border-neutral-800 pb-4 md:pb-0 md:pr-6 shrink-0">
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-4 w-4 ${i <= review.rating ? "text-gold fill-gold" : "text-neutral-800 fill-neutral-800"}`} />
                       ))}
                    </div>
                    <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                 </div>
                 
                 <div className="flex-1 space-y-4">
                    {review.comment ? (
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                    ) : (
                      <p className="text-neutral-600 text-sm font-medium italic">No written comment provided.</p>
                    )}
                    
                    {review.ride && (
                       <div className="bg-black border border-neutral-800 p-3 flex flex-wrap gap-4 items-center mt-4">
                          <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest border-r border-neutral-800 pr-4">
                             RIDE REF
                          </p>
                          <p className="text-gold font-serif text-sm italic font-black uppercase tracking-widest">{review.ride.customerName}</p>
                          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{review.ride.pickupDate}</p>
                          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{review.ride.carTypeName}</p>
                       </div>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
