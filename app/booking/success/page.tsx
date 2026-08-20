import SuccessContent from "./success-content";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto" />
          <h2 className="font-serif text-3xl font-black italic uppercase">
            Processing <span className="text-gold">Payment</span>
          </h2>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
            Please wait while we confirm your booking...
          </p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
