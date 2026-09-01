"use client";

import { useState, useEffect } from "react";
import { Car, Clock, CheckCircle, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  carTypeName: string;
  price: number;
  passengers: number;
  luggage: number;
  status: "pending_approval" | "approved" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  createdAt: number;
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

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

  const totalRevenue = bookings
    .filter(b => b.status === "confirmed" || b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.price, 0);

  const pendingApprovals = bookings.filter(b => b.status === "pending_approval").length;
  const approvedCount = bookings.filter(b => b.status === "approved").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  const totalBookingsCount = bookings.length || 1;
  const avgRideValue = totalBookingsCount > 0 ? (totalRevenue / (confirmedCount || 1)) || 185 : 185;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: `Avg. Confirmed Ride: $${avgRideValue.toFixed(0)}`, icon: DollarSign },
    { label: "Pending Approvals", value: pendingApprovals, sub: "Requires Dispatch Review", icon: Clock },
    { label: "Approved / Confirmed", value: approvedCount + confirmedCount, sub: `${confirmedCount} Paid & Scheduled`, icon: CheckCircle },
    { label: "Active Fleet", value: "4 Classes", sub: "Operational 24/7", icon: Car },
  ];

  const chartData = [
    { date: "Mon", revenue: Math.round(totalRevenue * 0.15) },
    { date: "Tue", revenue: Math.round(totalRevenue * 0.25) },
    { date: "Wed", revenue: Math.round(totalRevenue * 0.40) },
    { date: "Thu", revenue: Math.round(totalRevenue * 0.60) },
    { date: "Fri", revenue: Math.round(totalRevenue * 0.85) },
    { date: "Sat", revenue: totalRevenue },
  ];

  return (
    <div className="p-4 sm:p-8 md:p-10 space-y-10 pb-20 bg-background text-foreground transition-colors duration-200">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
          System <span className="text-gold">Intelligence</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
          Luna Limo Executive Live Operations Dashboard
        </p>
      </header>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border p-6 relative overflow-hidden group hover:border-gold/40 transition-all duration-300 shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <stat.icon className="h-6 w-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground font-serif text-3xl font-black italic">{stat.value}</h3>
              <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-muted-foreground/80 text-[8px] font-bold uppercase tracking-widest pt-2 border-t border-border mt-2 block">{stat.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-card border border-border p-6 flex flex-col h-[400px] shadow-sm">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
            Revenue Trend
            <span className="text-muted-foreground">Gross Vol.</span>
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground" tick={{fontSize: 10}} />
                <YAxis stroke="currentColor" className="text-muted-foreground" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: 'var(--gold)' }}
                  labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 flex flex-col h-[400px] shadow-sm">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-border pb-4">
            Pipeline Breakdown
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              {[
                { label: "Pending Approval", val: pendingApprovals, color: "bg-amber-500" },
                { label: "Approved (Unpaid)", val: approvedCount, color: "bg-emerald-500" },
                { label: "Confirmed & Paid", val: confirmedCount, color: "bg-blue-500" },
                { label: "Cancelled", val: cancelledCount, color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    <span className="text-foreground">{item.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${Math.max(5, (item.val / totalBookingsCount) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-card border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Live Reservations Log</h2>
        </div>
        
        {bookings.length === 0 ? (
           <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest text-center py-12">No active reservations recorded</p>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 10).map((ride) => (
              <div key={ride.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-secondary/50 border border-border gap-4 hover:border-gold/40 transition-colors">
                <div className="space-y-1 min-w-0">
                   <div className="flex items-center gap-3">
                     <p className="text-foreground font-serif text-sm font-black italic uppercase tracking-widest truncate">{ride.customerName}</p>
                     <span className="text-gold text-[10px] font-bold">({ride.id})</span>
                   </div>
                   <p className="text-muted-foreground text-xs font-bold truncate">From <span className="text-foreground">{ride.pickupAddress}</span></p>
                   <p className="text-muted-foreground/80 text-[10px] font-black uppercase tracking-[0.1em]">{ride.pickupDate} at {ride.pickupTime} • {ride.carTypeName}</p>
                </div>
                <div className="shrink-0 flex items-center gap-4 border-t border-border pt-4 sm:border-none sm:pt-0">
                   <div className="text-right">
                     <p className="text-gold font-serif text-lg font-black italic">${ride.price.toFixed(2)}</p>
                   </div>
                   <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest inline-block whitespace-nowrap ${
                     ride.status === "pending_approval" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
                     : ride.status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                     : ride.status === "confirmed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                     : "bg-destructive/10 text-destructive border border-destructive/30"
                   }`}>
                     {ride.status.replace("_", " ")}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
