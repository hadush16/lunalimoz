"use client";

import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Search, Download, MessageSquare, ChevronRight, CheckCircle, XCircle, ShieldCheck, Eye, X, Plane, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightDetails?: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  carTypeName: string;
  price: number;
  passengers: number;
  luggage: number;
  serviceType: "point_to_point" | "hourly";
  hourlyDuration?: number;
  distance: number;
  duration: number;
  status: "pending_approval" | "approved" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  adminNotes?: string;
  createdAt: number;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingRecord["status"]) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBookings();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(data.booking);
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) return;
    const headers = ["ID", "Status", "Payment", "Customer", "Email", "Phone", "Flight", "Pickup Date", "Pickup Time", "Pickup", "Destination", "Vehicle", "Price"];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.status,
      b.paymentStatus,
      `"${b.customerName.replace(/"/g, '""')}"`,
      b.customerEmail,
      b.customerPhone,
      `"${(b.flightDetails || "").replace(/"/g, '""')}"`,
      b.pickupDate,
      b.pickupTime,
      `"${b.pickupAddress.replace(/"/g, '""')}"`,
      `"${b.destinationAddress.replace(/"/g, '""')}"`,
      b.carTypeName,
      b.price.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-limo-reservations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          Reservation <span className="text-gold">Management</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Review, approve, and manage executive journeys
        </p>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search by customer name, email or reference..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-3 text-xs text-white focus:border-gold outline-none"
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-neutral-800 px-4 py-3 text-xs text-white uppercase tracking-widest font-bold focus:border-gold outline-none"
          >
            <option value="all">ALL STATUSES</option>
            <option value="pending_approval">PENDING APPROVAL</option>
            <option value="approved">APPROVED</option>
            <option value="confirmed">CONFIRMED & PAID</option>
            <option value="cancelled">CANCELLED</option>
          </select>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-black border-neutral-800 text-neutral-400 hover:text-white rounded-none text-[9px] uppercase tracking-widest px-4">
            <Download className="h-3 w-3 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
               <CalendarDays className="h-4 w-4" /> 
               Active Reservations ({filteredBookings.length})
            </h2>
        </div>

        <div className="divide-y divide-neutral-800">
          {filteredBookings.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
               No matching reservations found
             </div>
          ) : (
             filteredBookings.map((ride) => (
              <div key={ride.id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-neutral-800/20 transition-colors">
                
                {/* Information Column */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${
                        ride.status === "pending_approval" ? "bg-amber-950 text-amber-400 border border-amber-800" 
                        : ride.status === "approved" ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : ride.status === "confirmed" ? "bg-blue-950 text-blue-400 border border-blue-800" 
                        : "bg-red-950 text-red-400 border border-red-800"
                      }`}>
                       {ride.status.replace("_", " ")}
                     </span>

                     <span className="text-gold font-serif text-sm font-black italic">{ride.id}</span>
                     <p className="text-white font-bold text-xs">{ride.customerName}</p>
                     {ride.flightDetails && (
                       <span className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 font-bold flex items-center gap-1">
                         <Plane className="h-3 w-3 text-gold" /> {ride.flightDetails}
                       </span>
                     )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-black p-3 border border-neutral-800 space-y-1">
                      <p className="text-neutral-400 text-[11px] font-bold truncate">
                        <MapPin className="h-3 w-3 text-gold inline mr-1" />
                        {ride.pickupAddress}
                      </p>
                      <p className="text-neutral-500 text-[11px] font-bold truncate pl-4">
                        To {ride.destinationAddress}
                      </p>
                    </div>

                    <div className="bg-black p-3 border border-neutral-800 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500 text-[9px] uppercase font-bold">Schedule:</span>
                        <span className="text-white text-[11px] font-bold">{ride.pickupDate} at {ride.pickupTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 text-[9px] uppercase font-bold">Class:</span>
                        <span className="text-gold text-[11px] font-bold italic">{ride.carTypeName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & Price Column */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 lg:w-44 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-800">
                  <div className="text-left lg:text-right">
                    <p className="text-gold font-serif text-xl font-black italic">${ride.price.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                      {ride.paymentStatus === "paid" ? "PAID" : "UNPAID"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full">
                    {ride.status === "pending_approval" && (
                      <Button
                        onClick={() => handleStatusChange(ride.id, "approved")}
                        disabled={isUpdating === ride.id}
                        className="flex-1 bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 rounded-none text-[9px] font-black uppercase tracking-widest h-8"
                      >
                        Approve
                      </Button>
                    )}

                    {ride.status !== "cancelled" && (
                      <Button
                        onClick={() => handleStatusChange(ride.id, "cancelled")}
                        disabled={isUpdating === ride.id}
                        variant="outline"
                        className="flex-1 bg-red-950/40 text-red-400 border border-red-900 hover:bg-red-900 rounded-none text-[9px] font-black uppercase tracking-widest h-8"
                      >
                        Reject
                      </Button>
                    )}

                    <Button
                      onClick={() => setSelectedBooking(ride)}
                      variant="outline"
                      className="bg-black border-neutral-700 text-white hover:border-gold rounded-none text-[9px] font-black uppercase tracking-widest h-8 px-3"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

              </div>
             ))
          )}
        </div>
      </section>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl p-6 sm:p-8 space-y-6 relative shadow-2xl animate-fade-in">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 text-neutral-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em]">Reservation Spec</span>
              <h3 className="font-serif text-2xl font-black italic uppercase text-white">{selectedBooking.id}</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-black p-4 border border-neutral-800 space-y-2">
                <p className="text-gold font-bold uppercase text-[9px] tracking-widest">Passenger Info</p>
                <p className="font-bold text-white flex items-center gap-2"><User className="h-3.5 w-3.5 text-neutral-500" /> {selectedBooking.customerName}</p>
                <p className="text-neutral-400 flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-neutral-500" /> {selectedBooking.customerEmail}</p>
                <p className="text-neutral-400 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-neutral-500" /> {selectedBooking.customerPhone}</p>
                {selectedBooking.flightDetails && (
                  <p className="text-gold font-bold flex items-center gap-2 pt-2 border-t border-neutral-800"><Plane className="h-3.5 w-3.5" /> Flight: {selectedBooking.flightDetails}</p>
                )}
              </div>

              <div className="bg-black p-4 border border-neutral-800 space-y-2">
                <p className="text-gold font-bold uppercase text-[9px] tracking-widest">Journey Info</p>
                <p className="text-neutral-400"><span className="text-neutral-600 font-bold uppercase text-[9px]">Pickup:</span> {selectedBooking.pickupAddress}</p>
                <p className="text-neutral-400"><span className="text-neutral-600 font-bold uppercase text-[9px]">Drop-off:</span> {selectedBooking.destinationAddress}</p>
                <p className="text-white font-bold pt-2 border-t border-neutral-800">{selectedBooking.pickupDate} at {selectedBooking.pickupTime}</p>
                <p className="text-gold font-bold italic">{selectedBooking.carTypeName} ({selectedBooking.passengers} Pax / {selectedBooking.luggage} Luggage)</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-black p-4 border border-neutral-800">
              <div>
                <p className="text-neutral-500 text-[9px] uppercase font-bold">Total Fare</p>
                <p className="font-serif text-2xl font-black italic text-gold">${selectedBooking.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                {selectedBooking.status === "pending_approval" && (
                  <Button
                    onClick={() => handleStatusChange(selectedBooking.id, "approved")}
                    className="bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold uppercase"
                  >
                    Approve Reservation
                  </Button>
                )}
                <Button onClick={() => setSelectedBooking(null)} className="bg-gold text-white text-xs font-bold uppercase">
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
