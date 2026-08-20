import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { sanitizeInput, validateEmail, validatePhone, truncate, validateCoordinate, validatePositiveNumber, sanitizeName, sanitizeAddress } from "./sanitize";

export const list = query({
  args: {
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rides;
    const validStatuses = ["pending", "confirmed", "cancelled"] as const;
    const statusFilter = args.status && args.status !== "all" && validStatuses.includes(args.status as typeof validStatuses[number])
      ? args.status as typeof validStatuses[number]
      : null;
    
    if (statusFilter) {
      rides = await ctx.db
        .query("rides")
        .withIndex("by_status", (q) => q.eq("status", statusFilter))
        .order("desc")
        .take(500);
    } else {
      rides = await ctx.db.query("rides").order("desc").take(500);
    }
    
    if (args.startDate) {
      rides = rides.filter(r => r.pickupDate >= args.startDate!);
    }
    if (args.endDate) {
      rides = rides.filter(r => r.pickupDate <= args.endDate!);
    }
    
    return rides;
  },
});

export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const validStatuses = ["pending", "confirmed", "cancelled"] as const;
    const statusFilter = args.status && args.status !== "all" && validStatuses.includes(args.status as typeof validStatuses[number])
      ? args.status as typeof validStatuses[number]
      : null;
    
    if (statusFilter) {
      return await ctx.db
        .query("rides")
        .withIndex("by_status", (q) => q.eq("status", statusFilter))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    return await ctx.db
      .query("rides")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rides")
      .order("desc")
      .take(args.limit);
  },
});

export const getById = query({
  args: { id: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    pickupAddress: v.string(),
    destinationAddress: v.string(),
    pickupLat: v.number(),
    pickupLng: v.number(),
    destLat: v.number(),
    destLng: v.number(),
    distance: v.number(),
    duration: v.number(),
    carTypeName: v.string(),
    carTypeMultiplier: v.number(),
    price: v.number(),
    passengers: v.number(),
    luggage: v.number(),
    accessible: v.boolean(),
    serviceType: v.union(
      v.literal("point_to_point"),
      v.literal("hourly")
    ),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!validateEmail(args.customerEmail)) {
      throw new Error("Invalid email address");
    }
    if (!validatePhone(args.customerPhone)) {
      throw new Error("Invalid phone number");
    }
    if (!validateCoordinate(args.pickupLat, "lat") || !validateCoordinate(args.pickupLng, "lng")) {
      throw new Error("Invalid pickup coordinates");
    }
    if (!validateCoordinate(args.destLat, "lat") || !validateCoordinate(args.destLng, "lng")) {
      throw new Error("Invalid destination coordinates");
    }
    if (!validatePositiveNumber(args.price)) {
      throw new Error("Price must be a positive number");
    }
    if (args.distance < 0 || !isFinite(args.distance)) {
      throw new Error("Invalid distance");
    }
    if (args.duration < 0 || !isFinite(args.duration)) {
      throw new Error("Invalid duration");
    }
    if (args.passengers < 1 || args.passengers > 20) {
      throw new Error("Invalid number of passengers");
    }
    if (args.luggage < 0 || args.luggage > 20) {
      throw new Error("Invalid number of luggage");
    }

    const tokenBytes = crypto.getRandomValues(new Uint8Array(12));
    const reviewToken = Array.from(tokenBytes, (b) => b.toString(36).toUpperCase()).join("").slice(0, 12);

    const hasPayment = !!args.stripeCheckoutSessionId;

    const ride = {
      userId: args.userId,
      customerName: sanitizeName(args.customerName),
      customerEmail: args.customerEmail.toLowerCase().trim(),
      customerPhone: sanitizeInput(args.customerPhone),
      pickupAddress: sanitizeAddress(args.pickupAddress),
      destinationAddress: sanitizeAddress(args.destinationAddress),
      pickupLat: args.pickupLat,
      pickupLng: args.pickupLng,
      destLat: args.destLat,
      destLng: args.destLng,
      distance: args.distance,
      duration: args.duration,
      carTypeName: sanitizeInput(truncate(args.carTypeName, 50)),
      carTypeMultiplier: args.carTypeMultiplier,
      price: args.price,
      passengers: args.passengers,
      luggage: args.luggage,
      accessible: args.accessible,
      serviceType: args.serviceType,
      hourlyDuration: args.hourlyDuration,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      status: hasPayment ? ("confirmed" as const) : ("pending" as const),
      paymentStatus: hasPayment ? ("paid" as const) : ("unpaid" as const),
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      reviewToken,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const rideId = await ctx.db.insert("rides", ride);
    
    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmail, { 
      rideId, 
      type: hasPayment ? "new_booking" : "new_booking" 
    });

    await ctx.scheduler.runAfter(0, internal.push.notifyAdmins, {
      title: "New Booking!",
      message: `A new ${args.carTypeName} booking was made by ${args.customerName}.`,
      url: `/admin/rides/${rideId}`
    });

    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: "new_booking",
      title: "New Booking Received",
      message: `${args.customerName} booked a ${args.carTypeName} for ${args.pickupDate}.`,
      link: "/admin/bookings",
    });
    
    return rideId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("rides"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Ride not found");

    const patches: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "cancelled" && ride.paymentStatus === "paid") {
      patches.paymentStatus = "paid";
    }

    await ctx.db.patch(args.id, patches);

    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmail, { 
      rideId: args.id, 
      type: "status_update",
      newStatus: args.status
    });

    const notifType = args.status === "cancelled" ? "cancellation" as const : "status_update" as const;
    const customerName = ride.customerName || "A customer";
    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: notifType,
      title: args.status === "cancelled" ? "Booking Cancelled" : "Status Updated",
      message: `${customerName}'s booking has been ${args.status}.`,
      link: "/admin/bookings",
    });
  },
});

export const addNote = mutation({
  args: {
    id: v.id("rides"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Ride not found");
    
    const dateStr = new Date().toISOString().split("T")[0];
    const prefix = ride.notes ? ride.notes + "\n" : "";
    const sanitizedNote = truncate(sanitizeInput(args.note), 1000);
    const newNotes = `${prefix}[${dateStr}] ${sanitizedNote}`;
    
    await ctx.db.patch(args.id, {
      notes: newNotes,
      updatedAt: Date.now(),
    });
  },
});
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rides")
      .withSearchIndex("search_customer", (q) => q.search("customerName", args.query))
      .take(50);
  },
});

export const getByStripeSessionId = internalQuery({
  args: { stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rides")
      .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId))
      .first();
  },
});

export const createFromWebhook = internalMutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    pickupAddress: v.string(),
    destinationAddress: v.string(),
    pickupLat: v.number(),
    pickupLng: v.number(),
    destLat: v.number(),
    destLng: v.number(),
    distance: v.number(),
    duration: v.number(),
    carTypeName: v.string(),
    carTypeMultiplier: v.number(),
    price: v.number(),
    passengers: v.number(),
    luggage: v.number(),
    accessible: v.boolean(),
    serviceType: v.union(
      v.literal("point_to_point"),
      v.literal("hourly")
    ),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    stripeCheckoutSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rides")
      .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId))
      .first();
    if (existing) return existing._id;

    const tokenBytes = crypto.getRandomValues(new Uint8Array(12));
    const reviewToken = Array.from(tokenBytes, (b) => b.toString(36).toUpperCase()).join("").slice(0, 12);

    const ride = {
      customerName: sanitizeName(args.customerName),
      customerEmail: "webhook@lunalimo.com",
      customerPhone: sanitizeInput(args.customerPhone),
      pickupAddress: sanitizeAddress(args.pickupAddress),
      destinationAddress: sanitizeAddress(args.destinationAddress),
      pickupLat: args.pickupLat,
      pickupLng: args.pickupLng,
      destLat: args.destLat,
      destLng: args.destLng,
      distance: args.distance,
      duration: args.duration,
      carTypeName: sanitizeInput(truncate(args.carTypeName, 50)),
      carTypeMultiplier: args.carTypeMultiplier,
      price: args.price,
      passengers: args.passengers,
      luggage: args.luggage,
      accessible: args.accessible,
      serviceType: args.serviceType,
      hourlyDuration: args.hourlyDuration,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      status: "confirmed" as const,
      paymentStatus: "paid" as const,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      reviewToken,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const rideId = await ctx.db.insert("rides", ride);

    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmail, {
      rideId,
      type: "new_booking",
    });

    return rideId;
  },
});