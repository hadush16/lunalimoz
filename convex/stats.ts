import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const rides = await ctx.db.query("rides").order("desc").take(200);
    
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    };
    
    let totalRevenue = 0;
    const revenueByDate: Record<string, number> = {};
    const bookingsByDate: Record<string, number> = {};

    for (const ride of rides) {
      statusCounts[ride.status]++;
      
      const dateKey = new Date(ride.createdAt).toISOString().split('T')[0];
      
      if (!bookingsByDate[dateKey]) {
        bookingsByDate[dateKey] = 0;
      }
      bookingsByDate[dateKey]++;

      if (ride.status === "confirmed") {
        totalRevenue += ride.price;
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = 0;
        }
        revenueByDate[dateKey] += ride.price;
      }
    }

    const chartData = Object.keys(bookingsByDate).sort().slice(-14).map(date => ({
      date,
      revenue: revenueByDate[date] || 0,
      bookings: bookingsByDate[date],
    }));

    const recentRides = rides.slice(0, 5);
    
    const carTypes = await ctx.db.query("carTypes").take(50);
    const activeFleet = carTypes.filter(c => c.isActive).length;

    const avgRideValue = statusCounts.confirmed > 0 ? totalRevenue / statusCounts.confirmed : 0;
    const cancellationRate = rides.length > 0 ? (statusCounts.cancelled / rides.length) * 100 : 0;

    return {
      totalRevenue,
      statusCounts,
      avgRideValue,
      cancellationRate,
      activeFleet,
      recentRides,
      chartData,
      totalRecentBookings: rides.length,
    };
  },
});

export const getCustomerList = query({
  args: {},
  handler: async (ctx) => {
    const rides = await ctx.db.query("rides").order("desc").take(500);
    
    const customersMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      totalRides: number;
      totalSpend: number;
      lastRideDate: number;
    }>();
    
    for (const ride of rides) {
      if (!ride.customerEmail) continue;
      
      if (!customersMap.has(ride.customerEmail)) {
        customersMap.set(ride.customerEmail, {
          name: ride.customerName || "",
          email: ride.customerEmail,
          phone: ride.customerPhone || "",
          totalRides: 0,
          totalSpend: 0,
          lastRideDate: ride.createdAt,
        });
      }
      
      const cust = customersMap.get(ride.customerEmail)!;
      cust.totalRides++;
      if (ride.status === "confirmed") {
        cust.totalSpend += ride.price;
      }
    }
    
    return Array.from(customersMap.values());
  },
});
