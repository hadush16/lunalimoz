"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Navigation,
  Clock,
  Gauge,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  DollarSign,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GenerateInvoiceButton } from "@/components/admin/GenerateInvoiceButton";
import { RideMap } from "@/components/admin/ride-map";
import { formatTime } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.rideId as Id<"rides">;

  const ride = useQuery(api.rides.getById, { id: rideId });
  const payment = useQuery(api.payments.getByRideId, { rideId });
  const updateStatus = useMutation(api.rides.updateStatus);
  const assignChauffeur = useMutation(api.rides.assignChauffeur);
  const cancelReservation = useMutation(api.rides.cancelReservation);
  const markNoShow = useMutation(api.rides.markNoShow);
  const addNote = useMutation(api.rides.addNote);
  const processRefund = useAction(api.payments_actions.processStripeRefund);

  const [noteText, setNoteText] = useState("");

  // Modals state
  const [showChauffeurModal, setShowChauffeurModal] = useState(false);
  const [chauffeurForm, setChauffeurForm] = useState({ name: "", phone: "", vehiclePlate: "" });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Client requested cancellation");
  const [customFee, setCustomFee] = useState<number | undefined>(undefined);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("Customer refund requested");
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState("");

  if (!ride) {
    return (
      <div className="p-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
        Loading reservation details...
      </div>
    );
  }

  const isHourly = ride.serviceType === "hourly";

  const handleStatusChange = async (status: any) => {
    await updateStatus({ id: rideId, status, adminEmail: "admin@lunalimoz.com" });
  };

  const handleAssignChauffeur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chauffeurForm.name.trim()) return;

    await assignChauffeur({
      id: rideId,
      name: chauffeurForm.name,
      phone: chauffeurForm.phone || "(206) 327-4411",
      vehiclePlate: chauffeurForm.vehiclePlate || "LUNA-VIP",
      adminEmail: "admin@lunalimoz.com",
    });

    setShowChauffeurModal(false);
  };

  const handleProcessCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    await cancelReservation({
      id: rideId,
      reason: cancelReason,
      customCancellationFee: customFee,
      adminEmail: "admin@lunalimoz.com",
    });
    setShowCancelModal(false);
  };

  const handleMarkNoShow = async () => {
    if (!confirm("Confirm marking this reservation as NO-SHOW? 100% cancellation fee will apply.")) return;
    await markNoShow({
      id: rideId,
      adminEmail: "admin@lunalimoz.com",
    });
  };

  const handleProcessStripeRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0) return;
    setIsRefunding(true);
    setRefundFeedback("");

    try {
      const res = await processRefund({
        rideId,
        amount: refundAmount,
        reason: refundReason,
        adminEmail: "admin@lunalimoz.com",
      });
      setRefundFeedback("Refund processed successfully!");
      setTimeout(() => {
        setShowRefundModal(false);
        setRefundFeedback("");
      }, 2000);
    } catch (err: any) {
      setRefundFeedback(err.message || "Failed to process refund");
    } finally {
      setIsRefunding(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote({ id: rideId, note: noteText });
    setNoteText("");
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24 bg-background text-foreground transition-colors duration-200">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reservations
      </button>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Reservation <span className="text-gold">Details</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            {ride.customerName} &middot; {ride.pickupDate} &middot; {ride.carTypeName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${
              ride.status === "confirmed"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : ride.status === "cancelled" || ride.status === "no_show"
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-gold/10 text-gold border-gold/30"
            }`}
          >
            {ride.status.replace("_", " ")}
          </span>

          <span
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${
              ride.paymentStatus === "paid"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : ride.paymentStatus === "refunded" || ride.paymentStatus === "partially_refunded"
                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            }`}
          >
            Payment: {ride.paymentStatus || "unpaid"}
          </span>

          <GenerateInvoiceButton ride={ride} />
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content (Left 2 cols) */}
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
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">PICKUP LOCATION</p>
                <p className="text-foreground font-bold text-sm">{ride.pickupAddress}</p>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-6 bg-gold/30" />
              </div>
              <div className="bg-secondary/50 p-4 border border-border">
                <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">DESTINATION</p>
                <p className="text-foreground font-bold text-sm">
                  {isHourly ? `${ride.hourlyDuration || 2}-Hour Private Charter` : ride.destinationAddress}
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 border border-border">
                  <Gauge className="h-4 w-4 text-gold" />
                  <span className="text-foreground text-xs font-bold">{ride.distance?.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 border border-border">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="text-foreground text-xs font-bold">{ride.duration?.toFixed(0)} min</span>
                </div>
              </div>
            </div>
          </section>

          {/* Itemized Price Snapshot */}
          <section className="bg-card border border-border shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Immutable Price Snapshot (Recorded at Quote)
              </h2>
              {ride.priceSnapshot?.pricingVersion && (
                <span className="text-[9px] font-mono font-bold text-muted-foreground">
                  {ride.priceSnapshot.pricingVersion}
                </span>
              )}
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-border">
                <div className="p-3 bg-secondary/40 border border-border">
                  <span className="text-[8px] font-black uppercase text-muted-foreground block">Base Fare</span>
                  <span className="font-bold text-foreground">${ride.priceSnapshot?.baseFare?.toFixed(2) || "35.00"}</span>
                </div>
                <div className="p-3 bg-secondary/40 border border-border">
                  <span className="text-[8px] font-black uppercase text-muted-foreground block">Mileage Rate</span>
                  <span className="font-bold text-foreground">${ride.priceSnapshot?.perMileRate?.toFixed(2) || "4.50"}/mi</span>
                </div>
                <div className="p-3 bg-secondary/40 border border-border">
                  <span className="text-[8px] font-black uppercase text-muted-foreground block">Mileage Charge</span>
                  <span className="font-bold text-foreground">${ride.priceSnapshot?.mileageCharge?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="p-3 bg-secondary/40 border border-border">
                  <span className="text-[8px] font-black uppercase text-muted-foreground block">Airport Surcharge</span>
                  <span className="font-bold text-foreground">${ride.priceSnapshot?.airportFee?.toFixed(2) || "0.00"}</span>
                </div>
              </div>

              {/* Optional services */}
              {ride.optionalServices && ride.optionalServices.length > 0 && (
                <div className="space-y-1.5 pb-4 border-b border-border">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">Selected Amenities</span>
                  {ride.optionalServices.map((service: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>&bull; {service.name}</span>
                      <span className="text-foreground font-bold">+{formatPrice(service.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount / Taxes / Total */}
              <div className="space-y-2 pt-2">
                {ride.discountAmount ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied ({ride.discountCode || "PROMO"})</span>
                    <span>-{formatPrice(ride.discountAmount)}</span>
                  </div>
                ) : null}

                {ride.priceSnapshot?.taxAmount ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes &amp; WA Transportation Fee ({ride.priceSnapshot.taxRatePercent}%)</span>
                    <span className="text-foreground font-bold">+{formatPrice(ride.priceSnapshot.taxAmount)}</span>
                  </div>
                ) : null}

                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="font-serif text-base font-black italic uppercase text-foreground">Total Paid Fare</span>
                  <span className="font-serif text-2xl font-black italic text-gold">{formatPrice(ride.price)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Internal Notes */}
          <section className="bg-card border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Operational Staff Notes
            </h2>
            {ride.notes && (
              <div className="text-xs text-foreground whitespace-pre-wrap font-medium border-l-2 border-gold pl-4 py-2 bg-secondary/30">
                {ride.notes}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add operational notes..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 bg-secondary border border-border px-4 py-3 text-xs text-foreground focus:border-gold outline-none"
              />
              <Button onClick={handleAddNote} className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[9px] font-black uppercase px-6">
                Add Note
              </Button>
            </div>
          </section>
        </div>

        {/* Sidebar Controls (Right 1 col) */}
        <div className="space-y-8">
          {/* Customer Profile Card */}
          <section className="bg-card border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Customer Contact</h2>
            <div className="space-y-3">
              <p className="text-foreground font-serif text-lg font-black italic">{ride.customerName}</p>
              <p className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="h-3.5 w-3.5 text-gold" /> {ride.customerEmail}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground text-xs">
                <Phone className="h-3.5 w-3.5 text-gold" /> {ride.customerPhone}
              </p>
              {ride.flightNumber && (
                <p className="text-xs text-gold font-bold uppercase tracking-wider">
                  Flight: {ride.flightNumber}
                </p>
              )}
            </div>
          </section>

          {/* Chauffeur Assignment Card */}
          <section className="bg-card border border-border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" /> Chauffeur Assignment
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowChauffeurModal(true)}
                className="text-[9px] font-black uppercase border-border"
              >
                {ride.chauffeur ? "Reassign" : "Assign"}
              </Button>
            </div>

            {ride.chauffeur ? (
              <div className="p-4 bg-secondary/50 border border-border space-y-1.5 text-xs">
                <p className="font-bold text-foreground font-serif text-sm">{ride.chauffeur.name}</p>
                <p className="text-muted-foreground">Phone: {ride.chauffeur.phone}</p>
                <p className="text-gold font-bold uppercase tracking-wider">Plate: {ride.chauffeur.vehiclePlate}</p>
              </div>
            ) : (
              <div className="p-4 bg-secondary/30 border border-dashed border-border text-center text-xs text-muted-foreground font-bold uppercase">
                No chauffeur assigned yet.
              </div>
            )}
          </section>

          {/* Administrative Actions & Cancellation */}
          <section className="bg-card border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Reservation Actions</h2>
            <div className="space-y-2.5">
              {ride.status !== "confirmed" && ride.status !== "cancelled" && ride.status !== "no_show" && (
                <Button
                  onClick={() => handleStatusChange("confirmed")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-none py-4 text-[9px] font-black uppercase tracking-widest"
                >
                  Confirm Reservation
                </Button>
              )}

              {ride.status !== "cancelled" && ride.status !== "no_show" && (
                <>
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 rounded-none py-4 text-[9px] font-black uppercase tracking-widest"
                  >
                    Cancel with Policy Fee
                  </Button>
                  <Button
                    onClick={handleMarkNoShow}
                    variant="outline"
                    className="w-full border-border text-muted-foreground hover:text-foreground rounded-none py-4 text-[9px] font-black uppercase tracking-widest"
                  >
                    Mark as No-Show
                  </Button>
                </>
              )}

              {/* Stripe Refund Button */}
              {ride.paymentStatus === "paid" && (
                <Button
                  onClick={() => {
                    setRefundAmount(ride.price);
                    setShowRefundModal(true);
                  }}
                  variant="outline"
                  className="w-full border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground rounded-none py-4 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Process Stripe Refund
                </Button>
              )}
            </div>

            {/* Policy Acceptance Badge */}
            <div className="pt-2 border-t border-border text-[9px] text-muted-foreground space-y-1">
              <p className="flex items-center gap-1 font-bold text-foreground">
                <CheckCircle2 className="h-3 w-3 text-gold" /> Cancellation Policy v{ride.policyVersion || "1.0"} Agreed
              </p>
              {ride.policyAcceptedAt && (
                <p>Accepted at: {new Date(ride.policyAcceptedAt).toLocaleString()}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Chauffeur Assignment Modal */}
      {showChauffeurModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Assign Chauffeur
              </h3>
              <button onClick={() => setShowChauffeurModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignChauffeur} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Chauffeur Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={chauffeurForm.name}
                  onChange={(e) => setChauffeurForm({ ...chauffeurForm, name: e.target.value })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Chauffeur Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="(206) 555-0188"
                  value={chauffeurForm.phone}
                  onChange={(e) => setChauffeurForm({ ...chauffeurForm, phone: e.target.value })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Vehicle License Plate
                </label>
                <input
                  type="text"
                  placeholder="LUNA-01"
                  value={chauffeurForm.vehiclePlate}
                  onChange={(e) => setChauffeurForm({ ...chauffeurForm, vehiclePlate: e.target.value.toUpperCase() })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold uppercase outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChauffeurModal(false)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Cancel Reservation
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessCancel} className="space-y-4 text-xs">
              <div className="p-3 bg-secondary/50 border border-border text-muted-foreground">
                <p>Total Fare Paid: <strong className="text-foreground">${ride.price?.toFixed(2)}</strong></p>
                <p className="mt-1">Standard policy: 24h+ = 0% fee; &lt;24h = 50% fee; &lt;2h / dispatched = 100% fee.</p>
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Cancellation Reason *
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Override Cancellation Fee ($) — Optional
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max={ride.price}
                  placeholder="Leave empty for automated policy fee"
                  value={customFee ?? ""}
                  onChange={(e) => setCustomFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="bg-destructive hover:bg-destructive/80 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stripe Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-gold" /> Process Stripe Refund
              </h3>
              <button onClick={() => setShowRefundModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessStripeRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Refund Amount ($) (Max ${ride.price?.toFixed(2)}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={ride.price}
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Refund Reason *
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              {refundFeedback && (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  {refundFeedback}
                </p>
              )}

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRefundModal(false)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRefunding}
                  className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  {isRefunding ? "Processing Refund..." : `Issue $${refundAmount.toFixed(2)} Refund`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
