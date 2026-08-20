import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRevenueReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const rides = await ctx.db.query("rides").order("desc").take(1000);
    
    const filtered = rides.filter(r => {
      const rideDate = new Date(r.createdAt).toISOString().split("T")[0];
      return rideDate >= args.startDate && rideDate <= args.endDate;
    });

    const dailyData: Record<string, { date: string; revenue: number; bookings: number }> = {};
    let totalRevenue = 0;
    const totalBookings = filtered.length;
    let confirmedCount = 0;

    for (const ride of filtered) {
      const dateKey = new Date(ride.createdAt).toISOString().split("T")[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, revenue: 0, bookings: 0 };
      }
      
      dailyData[dateKey].bookings++;
      
      if (ride.status === "confirmed") {
        totalRevenue += ride.price;
        dailyData[dateKey].revenue += ride.price;
        confirmedCount++;
      }
    }

    const chartData = Object.values(dailyData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        avgValue: d.bookings > 0 ? d.revenue / d.bookings : 0,
      }));

    return {
      chartData,
      totalRevenue,
      totalBookings,
      confirmedCount,
      avgOrderValue: confirmedCount > 0 ? totalRevenue / confirmedCount : 0,
      completionRate: totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 0,
    };
  },
});

export const getRevenueByCarType = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const rides = await ctx.db.query("rides").order("desc").take(1000);
    
    const filtered = rides.filter(r => {
      const rideDate = new Date(r.createdAt).toISOString().split("T")[0];
      return rideDate >= args.startDate && rideDate <= args.endDate && r.status === "confirmed";
    });

    const byCarType: Record<string, { carType: string; revenue: number; count: number }> = {};
    let totalRevenue = 0;

    for (const ride of filtered) {
      if (!byCarType[ride.carTypeName]) {
        byCarType[ride.carTypeName] = { carType: ride.carTypeName, revenue: 0, count: 0 };
      }
      byCarType[ride.carTypeName].revenue += ride.price;
      byCarType[ride.carTypeName].count++;
      totalRevenue += ride.price;
    }

    return Object.values(byCarType)
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
      }));
  },
});

export const getRevenueByStatus = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const rides = await ctx.db.query("rides").order("desc").take(1000);
    
    const filtered = rides.filter(r => {
      const rideDate = new Date(r.createdAt).toISOString().split("T")[0];
      return rideDate >= args.startDate && rideDate <= args.endDate;
    });

    const byStatus: Record<string, { status: string; count: number; revenue: number }> = {
      pending: { status: "Pending", count: 0, revenue: 0 },
      confirmed: { status: "Confirmed", count: 0, revenue: 0 },
      cancelled: { status: "Cancelled", count: 0, revenue: 0 },
    };

    for (const ride of filtered) {
      byStatus[ride.status].count++;
      if (ride.status === "confirmed") {
        byStatus[ride.status].revenue += ride.price;
      }
    }

    return Object.values(byStatus);
  },
});

export const getTopCustomers = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rides = await ctx.db.query("rides").order("desc").take(1000);
    
    const filtered = rides.filter(r => {
      const rideDate = new Date(r.createdAt).toISOString().split("T")[0];
      return rideDate >= args.startDate && rideDate <= args.endDate;
    });

    const customerMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      totalRides: number;
      totalSpend: number;
      lastRideDate: number;
    }>();

    for (const ride of filtered) {
      if (!ride.customerEmail) continue;
      
      if (!customerMap.has(ride.customerEmail)) {
        customerMap.set(ride.customerEmail, {
          name: ride.customerName || "",
          email: ride.customerEmail,
          phone: ride.customerPhone || "",
          totalRides: 0,
          totalSpend: 0,
          lastRideDate: ride.createdAt,
        });
      }
      
      const cust = customerMap.get(ride.customerEmail)!;
      cust.totalRides++;
      if (ride.status === "confirmed") {
        cust.totalSpend += ride.price;
      }
    }

    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, args.limit ?? 10);

    return customers;
  },
});

export const getMonthlyComparison = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rides = await ctx.db.query("rides").order("desc").take(2000);
    const numMonths = args.months ?? 6;
    
    const monthlyData: Record<string, { month: string; revenue: number; bookings: number }> = {};

    for (const ride of rides) {
      const date = new Date(ride.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, revenue: 0, bookings: 0 };
      }
      
      monthlyData[monthKey].bookings++;
      if (ride.status === "confirmed") {
        monthlyData[monthKey].revenue += ride.price;
      }
    }

    return Object.values(monthlyData)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, numMonths)
      .reverse()
      .map((item, index, arr) => {
        const prevMonth = index > 0 ? arr[index - 1] : null;
        const growthPercent = prevMonth && prevMonth.revenue > 0
          ? ((item.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
          : 0;
        return { ...item, growthPercent };
      });
  },
});
