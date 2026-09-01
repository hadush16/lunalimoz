"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MessageSquare, Phone, Mail, Navigation, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GenerateInvoiceButton } from "@/components/admin/GenerateInvoiceButton";
import { RideMap } from "@/components/admin/ride-map";
import { formatTime } from "@/lib/utils";

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.rideId as Id<"rides">;
  
  const ride = useQuery(api.rides.getById, { id: rideId });
  const updateStatus = useMutation(api.rides.updateStatus);
  const addNote = useMutation(api.rides.addNote);
  
  const [noteText, setNoteText] = useState("");

  if (!ride) {
    return (
      <div className="p-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
        Loading ride details...
      </div>
    );
  }

  const handleStatusChange = async (status: "pending" | "confirmed" | "cancelled") => {
    await updateStatus({ id: rideId, status });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote({ id: rideId, note: noteText });
    setNoteText("");
  };

  const isHourly = ride.serviceType === "hourly";

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24 bg-background text-foreground transition-colors duration-200">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </button>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Ride <span className="text-gold">Details</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            {ride.customerName} &middot; {ride.pickupDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
            ride.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
            : ride.status === "confirmed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
            : "bg-destructive/10 text-destructive border border-destructive/30"
          }`}>
            {ride.status.replace("_", " ")}
          </span>
          <GenerateInvoiceButton ride={ride} />
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Interactive Map */}
          <RideMap
            pickup={{ lat: ride.pickupLat, lng: ride.pickupLng, address: ride.pickupAddress }}
            destination={isHourly ? null : { lat: ride.destLat, lng: ride.destLng, address: ride.destinationAddress }}
            isHourly={isHourly}
          />

          {/* Route Summary */}
          <section className="bg-card border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Route Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">PICKUP</p>
                <p className="text-foreground font-bold text-sm">{ride.pickupAddress}</p>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-8 bg-gold/30" />
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">DESTINATION</p>
                <p className="text-foreground font-bold text-sm">{ride.destinationAddress}</p>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 border border-border">
                  <Gauge className="h-4 w-4 text-gold" />
                  <span className="text-foreground text-xs font-bold">{ride.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 border border-border">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="text-foreground text-xs font-bold">{ride.duration.toFixed(0)} min</span>
                </div>
              </div>
            </div>
          </section>

          {/* Ride Information */}
          <section className="bg-card border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Ride Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">DATE</p>
                <p className="text-foreground font-bold text-sm">{ride.pickupDate}</p>
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">TIME</p>
                <p className="text-foreground font-bold text-sm">{formatTime(ride.pickupTime || "")}</p>
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">VEHICLE</p>
                <p className="text-foreground font-bold text-sm">{ride.carTypeName}</p>
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">SERVICE</p>
                <p className="text-foreground font-bold text-sm">{isHourly ? "Hourly" : "Point-to-Point"}</p>
              </div>
              {isHourly && ride.hourlyDuration && (
                <div className="bg-secondary/50 p-4 border border-border">
                  <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">HOURS</p>
                  <p className="text-gold font-bold text-sm">{ride.hourlyDuration}h</p>
                </div>
              )}
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">PASSENGERS</p>
                <p className="text-foreground font-bold text-sm">{ride.passengers}</p>
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">LUGGAGE</p>
                <p className="text-foreground font-bold text-sm">{ride.luggage}</p>
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">PRICE</p>
                <p className="text-gold font-serif text-lg font-black italic">${ride.price.toFixed(2)}</p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-card border border-border p-6 shadow-sm">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Internal Notes
            </h2>
            {ride.notes && (
              <div className="text-sm text-foreground whitespace-pre-wrap font-medium border-l-2 border-gold pl-4 py-2 mb-4">
                {ride.notes}
              </div>
            )}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add internal staff note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 bg-secondary border border-border px-4 py-3 text-xs text-foreground focus:border-gold outline-none"
              />
              <Button onClick={handleAddNote} className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[9px] font-black uppercase px-6 shadow-md">
                Add
              </Button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-card border border-border p-6 shadow-sm">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6">Customer</h2>
            <div className="space-y-4">
              <p className="text-foreground font-serif text-lg font-black italic">{ride.customerName}</p>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Mail className="h-3 w-3 text-muted-foreground/60" /> {ride.customerEmail}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Phone className="h-3 w-3 text-muted-foreground/60" /> {ride.customerPhone}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="bg-card border border-border p-6 shadow-sm">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6">Actions</h2>
            <div className="space-y-2">
              {ride.status === "pending" && (
                <>
                  <Button onClick={() => handleStatusChange("confirmed")} className="w-full bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-800 hover:bg-emerald-900 hover:text-white rounded-none py-4 text-[9px] font-black uppercase tracking-widest">
                    Confirm Booking
                  </Button>
                  <Button onClick={() => handleStatusChange("cancelled")} className="w-full bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 rounded-none py-4 text-[9px] font-black uppercase tracking-widest">
                    Decline
                  </Button>
                </>
              )}
              {ride.status === "confirmed" && (
                <Button onClick={() => handleStatusChange("cancelled")} className="w-full bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 rounded-none py-4 text-[9px] font-black uppercase tracking-widest">
                  Cancel Booking
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
