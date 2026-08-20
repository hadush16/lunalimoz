"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Car, CalendarDays, Activity, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export default function AdminDashboardPage() {
  const summary = useQuery(api.stats.getDashboardSummary) || null;

  if (!summary) {
    return (
      <div className="p-12 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs h-[80vh] flex items-center justify-center">
        Gathering System Data...
      </div>
    );
  }

  const {
    totalRevenue,
    statusCounts,
    avgRideValue,
    cancellationRate,
    activeFleet,
    recentRides,
    chartData,
    totalRecentBookings
  } = summary;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: `Avg. Ride: $${avgRideValue.toFixed(0)}`, icon: DollarSign },
    { label: "Active Bookings", value: statusCounts.confirmed, sub: `${statusCounts.pending} Pending`, icon: CalendarDays },
    { label: "Completion Rate", value: `${(100 - cancellationRate).toFixed(1)}%`, sub: `${cancellationRate.toFixed(1)}% Cancelled`, icon: TrendingUp },
    { label: "Active Fleet", value: activeFleet, sub: "System Operational", icon: Car },
  ];

  return (
    <div className="p-4 sm:p-8 md:p-10 space-y-10 pb-20">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          System <span className="text-gold">Intelligence</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Luna Limo Executive Dashboard
        </p>
      </header>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <stat.icon className="h-6 w-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-serif text-3xl font-black italic">{stat.value}</h3>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-neutral-600 text-[8px] font-bold uppercase tracking-widest pt-2 border-t border-neutral-800 mt-2 block">{stat.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 flex flex-col h-[400px]">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
            Revenue Trend (Last 14 Days)
            <span className="text-neutral-500">Gross Vol.</span>
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C6A87C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#C6A87C' }}
                  labelStyle={{ color: '#666', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C6A87C" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col h-[400px]">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-neutral-800 pb-4">
            Total Pipeline
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              {[
                { label: "Confirmed", val: statusCounts.confirmed, color: "bg-blue-500" },
                { label: "Pending", val: statusCounts.pending, color: "bg-amber-500" },
                { label: "Cancelled", val: statusCounts.cancelled, color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-white">{item.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${Math.max(5, (item.val / Math.max(1, totalRecentBookings)) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Recent Activity Log</h2>
        </div>
        
        {recentRides.length === 0 ? (
           <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest text-center py-12">No recent activity detected</p>
        ) : (
          <div className="space-y-4">
            {recentRides.map((ride) => (
              <div key={ride._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-black border border-neutral-800 gap-4 hover:border-neutral-700 transition-colors">
                <div className="space-y-1 min-w-0">
                   <p className="text-white font-serif text-sm font-black italic uppercase tracking-widest truncate">{ride.customerName}</p>
                   <p className="text-neutral-400 text-xs font-bold truncate">From <span className="text-white">{ride.pickupAddress}</span></p>
                   <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.1em]">{ride.pickupDate} • {ride.carTypeName}</p>
                </div>
                <div className="shrink-0 flex items-center gap-4 border-t border-neutral-800 pt-4 sm:border-none sm:pt-0">
                   <div className="text-right">
                     <p className="text-gold font-serif text-lg font-black italic">${ride.price.toFixed(2)}</p>
                   </div>
                    <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest inline-block whitespace-nowrap ${
                      ride.status === "pending" ? "bg-amber-950 text-amber-500 border border-amber-900" 
                      : ride.status === "confirmed" ? "bg-blue-950 text-blue-500 border border-blue-900"
                      : "bg-red-950 text-red-500 border border-red-900"
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
