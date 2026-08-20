"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DollarSign, TrendingUp, CalendarDays, BarChart3, Download, Users, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const DATE_PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "This Year", days: 365 },
];

const COLORS = ["#C6A87C", "#8B7355", "#D4B896", "#A08C6A", "#B89F7D", "#C9A96E"];

export default function AdminReportsPage() {
  const [activePreset, setActivePreset] = useState(30);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const { startDate, endDate } = useMemo(() => {
    if (customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd };
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - activePreset);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [activePreset, customStart, customEnd]);

  const revenueReport = useQuery(api.reports.getRevenueReport, { startDate, endDate });
  const byCarType = useQuery(api.reports.getRevenueByCarType, { startDate, endDate });
  const byStatus = useQuery(api.reports.getRevenueByStatus, { startDate, endDate });
  const topCustomers = useQuery(api.reports.getTopCustomers, { startDate, endDate, limit: 10 });
  const monthlyComparison = useQuery(api.reports.getMonthlyComparison, { months: 6 });

  const handleExportCSV = () => {
    if (!revenueReport || revenueReport.chartData.length === 0) return;
    
    const headers = ["Date", "Revenue", "Bookings", "Avg Value"];
    const rows = revenueReport.chartData.map((d: { date: string; revenue: number; bookings: number; avgValue: number }) => [
      d.date,
      d.revenue.toFixed(2),
      d.bookings,
      d.avgValue.toFixed(2),
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-limo-revenue-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCustomersCSV = () => {
    if (!topCustomers || topCustomers.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Total Rides", "Total Spend", "Last Ride"];
    const rows = topCustomers.map((c) => [
      `"${c.name}"`,
      c.email,
      c.phone,
      c.totalRides,
      c.totalSpend.toFixed(2),
      new Date(c.lastRideDate).toLocaleDateString(),
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-limo-top-customers-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          Revenue <span className="text-gold">Reports</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Analytics and business insights
        </p>
      </header>

      {/* Date Range Picker */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map(preset => (
            <button
              key={preset.days}
              onClick={() => { setActivePreset(preset.days); setCustomStart(""); setCustomEnd(""); }}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-none transition-all ${
                activePreset === preset.days && !customStart
                  ? "bg-gold text-white"
                  : "bg-black text-neutral-400 border border-neutral-800 hover:text-white hover:border-gold/30"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input 
            type="date" 
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-black border border-neutral-800 px-3 py-2 text-xs text-white focus:border-gold outline-none [color-scheme:dark]"
          />
          <span className="text-neutral-500 text-xs">to</span>
          <input 
            type="date" 
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-black border border-neutral-800 px-3 py-2 text-xs text-white focus:border-gold outline-none [color-scheme:dark]"
          />
          {(customStart || customEnd) && (
            <button 
              onClick={() => { setCustomStart(""); setCustomEnd(""); }}
              className="text-neutral-500 hover:text-white text-[9px] font-black uppercase tracking-widest"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-6 w-6 text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Revenue</span>
          </div>
          <p className="text-white font-serif text-2xl font-black italic">
            ${revenueReport?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mt-2">
            {startDate} to {endDate}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-6 w-6 text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Avg Order</span>
          </div>
          <p className="text-white font-serif text-2xl font-black italic">
            ${revenueReport?.avgOrderValue.toFixed(2) || "0.00"}
          </p>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mt-2">
            Per confirmed booking
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <CalendarDays className="h-6 w-6 text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Bookings</span>
          </div>
          <p className="text-white font-serif text-2xl font-black italic">
            {revenueReport?.totalBookings || 0}
          </p>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mt-2">
            {revenueReport?.confirmedCount || 0} confirmed
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-6 w-6 text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Completion</span>
          </div>
          <p className="text-white font-serif text-2xl font-black italic">
            {revenueReport?.completionRate.toFixed(1) || "0.0"}%
          </p>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mt-2">
            Success rate
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Revenue Trend</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("area")}
              className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                chartType === "area" ? "text-gold" : "text-neutral-500 hover:text-white"
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                chartType === "bar" ? "text-gold" : "text-neutral-500 hover:text-white"
              }`}
            >
              Bar
            </button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-transparent border-neutral-700 text-neutral-400 hover:text-white rounded-none text-[9px] uppercase tracking-widest h-7">
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          {revenueReport?.chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
              No data for selected range
            </div>
          ) : chartType === "area" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueReport?.chartData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C6A87C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: string) => val.slice(5)} />
                <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: number) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#C6A87C' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C6A87C" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueReport?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: string) => val.slice(5)} />
                <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: number) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#C6A87C' }}
                />
                <Bar dataKey="revenue" fill="#C6A87C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Car Type */}
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Car className="h-4 w-4" /> Revenue by Vehicle
          </h2>
          {byCarType && byCarType.length > 0 ? (
            <div className="space-y-4">
              {byCarType.map((item: { carType: string; revenue: number; count: number; percentage: number }, i: number) => (
                <div key={item.carType} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400 font-bold uppercase tracking-widest">{item.carType}</span>
                    <span className="text-white font-serif italic">${item.revenue.toFixed(0)} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
              No data available
            </div>
          )}
        </div>

        {/* Revenue by Status */}
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Bookings by Status
          </h2>
          {byStatus && byStatus.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#666" tick={{fill: '#666', fontSize: 10}} />
                  <YAxis type="category" dataKey="status" stroke="#666" tick={{fill: '#999', fontSize: 10}} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#C6A87C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6">Monthly Comparison (Last 6 Months)</h2>
        {monthlyComparison && monthlyComparison.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: string) => val.slice(5)} />
                <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val: number) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="#C6A87C" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
            No data available
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Users className="h-4 w-4" /> Top Customers
          </h2>
          <Button onClick={handleExportCustomersCSV} variant="outline" size="sm" className="bg-transparent border-neutral-700 text-neutral-400 hover:text-white rounded-none text-[9px] uppercase tracking-widest h-8">
            <Download className="h-3 w-3 mr-1" /> Export CSV
          </Button>
        </div>

        {topCustomers && topCustomers.length > 0 ? (
          <div className="divide-y divide-neutral-800">
            {topCustomers.map((customer: { name: string; email: string; phone: string; totalRides: number; totalSpend: number; lastRideDate: number }, i: number) => (
              <div key={customer.email} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-neutral-600 font-serif text-lg font-black italic w-8 text-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white font-bold text-sm">{customer.name || "Unnamed"}</p>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-serif text-lg font-black italic">${customer.totalSpend.toFixed(2)}</p>
                  <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest">{customer.totalRides} rides</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
            No customer data available
          </div>
        )}
      </div>
    </div>
  );
}
