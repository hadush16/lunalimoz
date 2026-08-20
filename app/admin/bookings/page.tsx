"use client";

import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CalendarDays, MapPin, Search, Download, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GenerateInvoiceButton } from "@/components/admin/GenerateInvoiceButton";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeNoteId, setActiveNoteId] = useState<Id<"rides"> | null>(null);
  const [noteText, setNoteText] = useState("");

  const { results: paginatedRides, status: paginationStatus, loadMore } = usePaginatedQuery(
    api.rides.listPaginated,
    { status: statusFilter !== "all" ? statusFilter : undefined },
    { initialNumItems: 20 }
  );
  
  const ridesWithDateFilter = useQuery(api.rides.list, { 
    status: statusFilter !== "all" ? statusFilter : undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined
  });
  
  const searchResults = useQuery(api.rides.search, { query: searchQuery });
  
  const updateStatus = useMutation(api.rides.updateStatus);
  const addNote = useMutation(api.rides.addNote);

  const hasDateFilter = dateRange.start || dateRange.end;
  const displayedRides = searchQuery ? searchResults : hasDateFilter ? ridesWithDateFilter : paginatedRides;

  const handleStatusChange = async (id: Id<"rides">, status: "pending" | "confirmed" | "cancelled") => {
    try {
      await updateStatus({ id, status });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddNote = async (id: Id<"rides">) => {
    if (!noteText.trim()) return;
    try {
      await addNote({ id, note: noteText });
      setNoteText("");
      setActiveNoteId(null);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleExportCSV = () => {
    if (!displayedRides || displayedRides.length === 0) return;
    
    const headers = ["Status", "Service Type", "Hours", "Customer", "Email", "Phone", "Pickup Date", "Pickup Time", "Pickup Address", "Destination", "Vehicle", "Price", "Distance (km)", "Passengers", "Luggage", "Notes"];
    const rows = displayedRides.map((ride) => [
      ride.status,
      ride.serviceType || "point_to_point",
      ride.hourlyDuration?.toString() || "",
      `"${(ride.customerName || "").replace(/"/g, '""')}"`,
      ride.customerEmail,
      ride.customerPhone,
      ride.pickupDate,
      formatTime(ride.pickupTime || ""),
      `"${(ride.pickupAddress || "").replace(/"/g, '""')}"`,
      `"${(ride.destinationAddress || "").replace(/"/g, '""')}"`,
      ride.carTypeName,
      ride.price.toFixed(2),
      ride.distance.toFixed(1),
      ride.passengers,
      ride.luggage,
      `"${(ride.notes || "").replace(/"/g, '""')}"`
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-limo-bookings-${new Date().toISOString().split("T")[0]}.csv`;
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
          Review and process all upcoming journeys
        </p>
      </header>

      {/* Filters Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col xl:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by customer name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-3 text-xs text-white focus:border-gold outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border border-neutral-800 px-4 py-3 text-xs text-white uppercase tracking-widest font-bold focus:border-gold outline-none"
            >
              <option value="all">ALL STATUS</option>
              <option value="pending">PENDING</option>
              <option value="confirmed">CONFIRMED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="bg-black border border-neutral-800 px-3 py-3 text-xs text-white focus:border-gold outline-none [color-scheme:dark]"
            />
            <span className="text-neutral-500">to</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="bg-black border border-neutral-800 px-3 py-3 text-xs text-white focus:border-gold outline-none [color-scheme:dark]"
            />
        </div>
      </div>

      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
               <CalendarDays className="h-4 w-4" /> 
               {searchQuery ? "Search Results" : "Filtered Reservations"}
            </h2>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-transparent border-neutral-700 text-neutral-400 hover:text-white rounded-none text-[9px] uppercase tracking-widest h-8 hidden sm:flex">
              <Download className="h-3 w-3 mr-2" /> Export CSV
            </Button>
        </div>

        <div className="divide-y divide-neutral-800">
          {displayedRides === undefined ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
               Loading reservations...
             </div>
          ) : displayedRides.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
               No reservations found
             </div>
          ) : (
             displayedRides.map((ride) => (
              <div key={ride._id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:bg-neutral-800/20 transition-colors">
                
                {/* Info */}
                <div className="space-y-4 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${
                        ride.status === "pending" ? "bg-amber-950 text-amber-500" 
                        : ride.status === "confirmed" ? "bg-blue-950 text-blue-500" 
                        : "bg-red-950 text-red-500"
                      }`}>
                       {ride.status.replace("_", " ")}
                     </span>
                      <p className="text-white font-bold text-xs md:text-sm whitespace-nowrap">{ride.pickupDate} at {formatTime(ride.pickupTime || "")}</p>
                     <div className="hidden md:block h-4 w-px bg-neutral-800" />
                     <Link href={`/admin/bookings/${ride._id}`} className="text-gold font-serif text-lg md:text-xl font-black italic uppercase tracking-tighter truncate hover:underline flex items-center gap-1">
                       {ride.customerName}
                       <ChevronRight className="h-4 w-4" />
                     </Link>
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-auto md:ml-0 bg-neutral-900 border border-neutral-800 px-2 py-1">{ride.carTypeName}</p>
                      {ride.serviceType === "hourly" && (
                        <span className="px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] bg-purple-950 text-purple-500 border border-purple-900 whitespace-nowrap">
                          {ride.hourlyDuration}h Hourly
                        </span>
                      )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-bold text-neutral-400">
                     <p className="flex items-center gap-1.5 border-r border-neutral-800 pr-4">
                       <span className="text-neutral-600 uppercase tracking-widest text-[8px]">EMAIL</span>
                       <span className="text-white truncate max-w-[150px] md:max-w-none">{ride.customerEmail}</span>
                     </p>
                     <p className="flex items-center gap-1.5 p-1 bg-neutral-900/50 border border-neutral-800/50">
                       <span className="text-neutral-600 uppercase tracking-widest text-[8px]">PHONE</span>
                       <span className="text-white">{ride.customerPhone}</span>
                     </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-black p-3 border border-neutral-800">
                      <div className="flex items-start gap-2 text-neutral-400 text-[11px] md:text-xs font-bold">
                         <MapPin className="h-3 w-3 text-gold mt-0.5 shrink-0" />
                         <span className="truncate">{ride.pickupAddress}</span>
                      </div>
                      <div className="flex items-start gap-2 text-neutral-400 text-[11px] md:text-xs font-bold pl-1 pt-2 border-t border-neutral-800 ml-1">
                         <span className="h-1 w-1 bg-neutral-600 rounded-full mt-1.5 shrink-0 ml-[2px]" />
                         <span className="truncate">{ride.destinationAddress}</span>
                      </div>
                    </div>
                    
                    <div className="bg-black p-3 border border-neutral-800 space-y-2">
                       <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <p className="text-neutral-600 uppercase tracking-widest text-[8px] font-bold">TOTAL PRICE</p>
                          <p className="text-gold font-serif text-lg font-black italic">${ride.price.toFixed(2)}</p>
                       </div>
                       <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest text-right">
                         {ride.passengers} Pax • {ride.luggage} Lgg • {ride.distance.toFixed(1)} km
                       </p>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-neutral-900/50 border border-neutral-800 p-3 mt-2">
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                           <MessageSquare className="h-3 w-3" /> Internal Notes
                        </p>
                        <button 
                          onClick={() => setActiveNoteId(activeNoteId === ride._id ? null : ride._id)}
                          className="text-gold text-[9px] uppercase tracking-widest font-bold hover:text-white"
                        >
                          {activeNoteId === ride._id ? "Cancel" : "+ Add Note"}
                        </button>
                     </div>
                     {ride.notes && (
                       <div className="text-xs text-neutral-300 whitespace-pre-wrap font-medium border-l-2 border-gold/30 pl-3 py-1 mb-2">
                         {ride.notes}
                       </div>
                     )}
                     {activeNoteId === ride._id && (
                       <div className="flex gap-2 mt-2">
                         <input 
                           type="text"
                           placeholder="Add internal staff note..."
                           value={noteText}
                           onChange={(e) => setNoteText(e.target.value)}
                           className="flex-1 bg-black border border-neutral-800 px-3 py-2 text-xs text-white focus:border-gold outline-none"
                         />
                         <Button onClick={() => handleAddNote(ride._id)} size="sm" className="bg-gold hover:bg-gold-dark text-white rounded-none text-[9px] font-black uppercase">
                           Save
                         </Button>
                       </div>
                     )}
                  </div>
                </div>

                {/* Actions */}
                 <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end lg:w-32 shrink-0">
                    {ride.status === "pending" && (
                       <>
                         <Button 
                           onClick={() => handleStatusChange(ride._id, "confirmed")}
                           variant="outline" 
                           size="sm" 
                           className="flex-1 lg:flex-none w-full bg-emerald-950/20 text-emerald-500 border-emerald-900/50 hover:bg-emerald-900 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest h-10 lg:h-8"
                         >
                           Confirm
                         </Button>
                         <Button 
                           onClick={() => handleStatusChange(ride._id, "cancelled")}
                           variant="outline" 
                           size="sm" 
                           className="flex-1 lg:flex-none w-full bg-red-950/20 text-red-500 border-red-900/50 hover:bg-red-900 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest h-10 lg:h-8"
                         >
                           Decline
                         </Button>
                       </>
                    )}
                    {ride.status === "confirmed" && (
                       <Button 
                         onClick={() => handleStatusChange(ride._id, "cancelled")}
                         variant="outline" 
                         size="sm" 
                         className="w-full bg-red-950/20 text-red-500 border-red-900/50 hover:bg-red-900 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest h-10 lg:h-8"
                       >
                         Cancel
                       </Button>
                    )}
                     <GenerateInvoiceButton ride={ride} />
                 </div>
              </div>
            ))
          )}
        </div>
        
        {!searchQuery && !hasDateFilter && paginationStatus === "CanLoadMore" && (
          <div className="p-6 border-t border-neutral-800 flex justify-center">
            <Button 
              onClick={() => loadMore(20)}
              variant="outline"
              className="bg-transparent border-neutral-700 text-neutral-400 hover:text-gold hover:border-gold/30 rounded-none text-[10px] font-black uppercase tracking-widest px-8 py-4"
            >
              Load More
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
