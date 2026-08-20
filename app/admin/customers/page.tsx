"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Crown, Calendar, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface CustomerStats {
  name?: string;
  email?: string;
  phone?: string;
  totalRides: number;
  totalSpend: number;
  lastRideDate: number;
}

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const customersData = useQuery(api.stats.getCustomerList);
  const customers: CustomerStats[] | undefined = customersData as any;

  const displayedCustomers = useMemo(() => {
    if (!customers) return [];
    
    let result = [...customers];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => 
        (c.name?.toLowerCase().includes(q)) || 
        (c.email?.toLowerCase().includes(q)) ||
        (c.phone?.toLowerCase().includes(q))
      );
    }
    
    // Sort by total spend descending
    return result.sort((a,b) => b.totalSpend - a.totalSpend);
  }, [customers, searchQuery]);

  if (customers === undefined) {
    return (
      <div className="p-12 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs h-[80vh] flex items-center justify-center">
        Loading Client Roster...
      </div>
    );
  }

  const vipThreshold = 500; // Anyone who spent over $500 is a VIP
  const vipCount = customers.filter((c) => c.totalSpend >= vipThreshold).length;

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          Client <span className="text-gold">Roster</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Manage and analyze your customer base
        </p>
      </header>

      {/* Aggregate Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <Users className="h-6 w-6 text-gold" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-serif text-3xl font-black italic">{customers.length}</h3>
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">Total Unique Clients</p>
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-serif text-3xl font-black italic">{vipCount}</h3>
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">VIP Clients (&gt;$500 Spend)</p>
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <Calendar className="h-6 w-6 text-gold" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-serif text-3xl font-black italic">
              {customers.length > 0 
                ? (customers.reduce((acc, c) => acc + c.totalRides, 0) / customers.length).toFixed(1) 
                : "0"}
            </h3>
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">Average Rides per Client</p>
          </div>
        </div>
      </section>

      {/* Roster Feed */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
               <Users className="h-4 w-4" /> 
               Client Database
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-2 text-xs text-white focus:border-gold outline-none"
              />
            </div>
        </div>

        <div className="divide-y divide-neutral-800">
          {displayedCustomers.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
               No clients found
             </div>
          ) : (
            displayedCustomers.map((customer) => {
              const isVIP = customer.totalSpend >= vipThreshold;
              
              return (
              <div key={customer.email} className="p-6 hover:bg-neutral-800/20 transition-colors flex flex-col md:flex-row md:items-center gap-6">
                 
                 <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                       <h3 className="text-white font-serif text-xl font-black italic uppercase tracking-tighter truncate">{customer.name || "Unknown"}</h3>
                       {isVIP && (
                         <span className="bg-amber-950 text-amber-500 border border-amber-900 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                           <Crown className="w-2.5 h-2.5" /> VIP
                         </span>
                       )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-bold text-neutral-400">
                       <p className="flex items-center gap-1.5 border-r border-neutral-800 pr-4">
                         <span className="text-neutral-600 uppercase tracking-widest text-[8px]">EMAIL</span>
                         <span className="text-white truncate max-w-[200px]">{customer.email}</span>
                       </p>
                       <p className="flex items-center gap-1.5 border-r border-neutral-800 pr-4">
                         <span className="text-neutral-600 uppercase tracking-widest text-[8px]">PHONE</span>
                         <span className="text-white">{customer.phone || "Not Provided"}</span>
                       </p>
                       <p className="flex items-center gap-1.5">
                         <span className="text-neutral-600 uppercase tracking-widest text-[8px]">LAST RIDE</span>
                         <span className="text-white">{new Date(customer.lastRideDate).toLocaleDateString()}</span>
                       </p>
                    </div>
                 </div>
                 
                 <div className="shrink-0 flex items-center gap-6 bg-black p-4 border border-neutral-800">
                    <div className="text-center pr-6 border-r border-neutral-800">
                      <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest mb-1">TOTAL RIDES</p>
                      <p className="text-white font-serif text-2xl font-black italic">{customer.totalRides}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest mb-1">CUMULATIVE SPEND</p>
                      <p className="text-gold font-serif text-2xl font-black italic">${customer.totalSpend.toFixed(0)}</p>
                    </div>
                 </div>
              </div>
            )})
          )}
        </div>
      </section>
    </div>
  );
}
