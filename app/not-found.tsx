import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background text-foreground px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 sm:p-12 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold">
          <Compass className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">
            Error 404
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black italic uppercase text-foreground">
            Page <span className="text-gold">Not Found</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium leading-relaxed">
            The itinerary or concierge page you requested does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-6 py-5 text-xs font-black uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/booking">
            <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">
              Book A Ride
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
