import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & No-Show Policy | Luna Limo Seattle",
  description:
    "Official Cancellation and No-Show Policy for Luna Limo luxury chauffeur services in Seattle, Sea-Tac Airport, and Washington State.",
};

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200 pt-28 pb-24">
      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6 text-center">
        <span className="text-gold text-[11px] font-black tracking-[0.3em] uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/30 inline-block">
          Official Reservation Terms
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-foreground uppercase">
          Cancellation & <span className="text-gold">No-Show Policy</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          At Luna Limo, we are committed to providing exceptional, reliable, and professional luxury transportation services. Each reservation requires dedicated scheduling of a professional chauffeur and vehicle.
        </p>
      </section>

      {/* Quick Summary Infographic */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-6 rounded-none space-y-3 relative overflow-hidden group hover:border-gold/50 transition-colors">
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg rounded-none">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-foreground font-serif text-lg font-bold">24+ Hours Notice</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cancellations made at least 24 hours prior to scheduled pickup incur <strong className="text-foreground font-bold">0% fee</strong> with a full refund or authorization release.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">100% Refund</div>
          </div>

          <div className="bg-card border border-border p-6 rounded-none space-y-3 relative overflow-hidden group hover:border-gold/50 transition-colors">
            <div className="h-10 w-10 bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg rounded-none">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-foreground font-serif text-lg font-bold">2 to 24 Hours Notice</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cancellations made less than 24 hours prior to scheduled pickup may be subject to a fee of <strong className="text-foreground font-bold">up to 50%</strong>.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">Up to 50% Fee</div>
          </div>

          <div className="bg-card border border-border p-6 rounded-none space-y-3 relative overflow-hidden group hover:border-gold/50 transition-colors">
            <div className="h-10 w-10 bg-destructive/10 text-destructive flex items-center justify-center font-bold text-lg rounded-none">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-foreground font-serif text-lg font-bold">&lt; 2 Hours or Dispatched</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cancellations within 2 hours, after chauffeur dispatch, or passenger no-shows are charged <strong className="text-foreground font-bold">100%</strong> of the reservation.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-destructive">100% Charge</div>
          </div>
        </div>
      </section>

      {/* Verbatim Policy Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12">
        <div className="bg-card border border-border p-6 sm:p-10 md:p-12 space-y-8 text-foreground shadow-sm">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              Cancellation Policy
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Cancellations made at least 24 hours before the scheduled pickup time may be canceled without a cancellation fee.
              </p>
              <p>
                Cancellations made less than 24 hours before the scheduled pickup time may be subject to a cancellation fee of up to 50% of the total reservation amount.
              </p>
              <p>
                Cancellations made within 2 hours of the scheduled pickup time, or after the chauffeur has been dispatched, may be charged 100% of the total reservation amount.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              No-Show Policy
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                A reservation will be considered a no-show when the chauffeur arrives at the confirmed pickup location and the passenger does not appear, cannot be contacted after reasonable attempts, or chooses not to use the transportation service.
              </p>
              <p>
                No-shows may be charged 100% of the total reservation amount.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              Waiting Time
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Passengers are expected to be ready at the confirmed pickup time. Additional waiting time beyond any complimentary waiting period included with the reservation may result in additional charges.
              </p>
              <p>
                For airport pickups, flight delays will be handled according to the reservation terms and available flight information.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              Reservation Changes
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Changes to the pickup time, pickup location, destination, number of passengers, vehicle type, or itinerary are subject to availability and may result in additional charges.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              Special Events & Hourly Reservations
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Reservations for weddings, proms, concerts, sporting events, corporate events, and other special occasions may have separate cancellation requirements. Deposits or advance payments for certain reservations may be non-refundable when disclosed at the time of booking.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-serif text-2xl font-black italic text-gold uppercase tracking-tight">
              Agreement
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                By confirming a reservation with Luna Limo, the customer acknowledges and agrees to this Cancellation & No-Show Policy.
              </p>
              <p className="italic text-foreground font-semibold">
                Luna Limo reserves the right to review exceptional circumstances on a case-by-case basis.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span>Questions regarding your reservation? Call (206) 538-4220</span>
            </div>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-gold text-primary-foreground font-bold px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold/90 transition-colors"
            >
              <span>Book a Reservation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
