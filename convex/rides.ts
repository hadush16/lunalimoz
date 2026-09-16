import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";
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
    const validStatuses = [
      "pending",
      "awaiting_payment",
      "confirmed",
      "chauffeur_assigned",
      "dispatched",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ] as const;

    const statusFilter = args.status && args.status !== "all" && validStatuses.includes(args.status as any)
      ? (args.status as typeof validStatuses[number])
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
      rides = rides.filter((r) => r.pickupDate >= args.startDate!);
    }
    if (args.endDate) {
      rides = rides.filter((r) => r.pickupDate <= args.endDate!);
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
    const validStatuses = [
      "pending",
      "awaiting_payment",
      "confirmed",
      "chauffeur_assigned",
      "dispatched",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ] as const;

    const statusFilter = args.status && args.status !== "all" && validStatuses.includes(args.status as any)
      ? (args.status as typeof validStatuses[number])
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
    serviceType: v.optional(v.union(
      v.literal("point_to_point"),
      v.literal("hourly")
    )),
    hourlyDuration: v.optional(v.number()),
    flightNumber: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    optionalServices: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
    }))),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    policyVersion: v.optional(v.string()),
    policyAccepted: v.optional(v.boolean()),
    policyAcceptedAt: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"rides">> => {
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

    const tokenBytes = crypto.getRandomValues(new Uint8Array(12));
    const reviewToken = Array.from(tokenBytes, (b) => b.toString(36).toUpperCase()).join("").slice(0, 12);

    const hasPayment = !!args.stripeCheckoutSessionId;

    // Calculate server authoritative price snapshot
    const quote: any = await ctx.runQuery(internal.pricing.calculateQuoteInternal, {
      carTypeName: args.carTypeName,
      distanceKm: args.distance,
      durationMinutes: args.duration,
      serviceType: args.serviceType || "point_to_point",
      hourlyDuration: args.hourlyDuration,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      pickupAddress: args.pickupAddress,
      destinationAddress: args.destinationAddress,
      selectedServiceIds: args.optionalServices?.map((s) => s.id),
      discountCode: args.discountCode,
    });

    const priceSnapshot = {
      baseFare: quote.baseFare,
      calculatedMiles: quote.calculatedMiles,
      perMileRate: quote.perMileRate,
      mileageCharge: quote.mileageCharge,
      timeCharge: quote.timeCharge,
      airportFee: quote.airportFee,
      stopFee: quote.stopFee,
      waitingFee: quote.waitingFee,
      optionalServicesFee: quote.optionalServicesFee,
      surgeMultiplier: quote.surgeMultiplier,
      surgeFee: quote.surgeFee,
      discountAmount: quote.discountAmount,
      subtotal: quote.subtotal,
      taxRatePercent: quote.taxRatePercent,
      taxAmount: quote.taxAmount,
      finalAmount: quote.finalAmount,
      currency: quote.currency,
      pricingVersion: quote.pricingVersion,
      quoteTimestamp: quote.quoteTimestamp,
    };

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
      price: quote.finalAmount, // Authoritative price from quote
      passengers: args.passengers,
      luggage: args.luggage,
      accessible: args.accessible,
      serviceType: args.serviceType,
      hourlyDuration: args.hourlyDuration,
      flightNumber: args.flightNumber ? sanitizeInput(truncate(args.flightNumber, 30)) : undefined,
      specialInstructions: args.specialInstructions ? sanitizeInput(truncate(args.specialInstructions, 500)) : undefined,
      optionalServices: args.optionalServices,
      discountCode: args.discountCode,
      discountAmount: quote.discountAmount,
      priceSnapshot,
      policyVersion: args.policyVersion || "1.0",
      policyAccepted: args.policyAccepted ?? true,
      policyAcceptedAt: args.policyAcceptedAt || Date.now(),
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      status: hasPayment ? ("confirmed" as const) : ("awaiting_payment" as const),
      paymentStatus: hasPayment ? ("paid" as const) : ("unpaid" as const),
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      reviewToken,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const rideId = await ctx.db.insert("rides", ride);

    if (args.discountCode && quote.discountAmount > 0) {
      await ctx.scheduler.runAfter(0, internal.discounts.incrementUsage, {
        code: args.discountCode,
      });
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmail, {
      rideId,
      type: "new_booking",
    });

    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: "new_booking",
      title: "New Reservation Received",
      message: `${args.customerName} reserved a ${args.carTypeName} for ${args.pickupDate}.`,
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
      v.literal("awaiting_payment"),
      v.literal("confirmed"),
      v.literal("chauffeur_assigned"),
      v.literal("dispatched"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Reservation not found");

    const previousStatus = ride.status;

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    if (args.adminEmail) {
      await ctx.scheduler.runAfter(0, internal.audit.logInternal, {
        adminEmail: args.adminEmail,
        action: "UPDATE_STATUS",
        entity: "rides",
        entityId: args.id,
        previousValue: previousStatus,
        newValue: args.status,
      });
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmail, {
      rideId: args.id,
      type: "status_update",
      newStatus: args.status,
    });
  },
});

export const assignChauffeur = mutation({
  args: {
    id: v.id("rides"),
    name: v.string(),
    phone: v.string(),
    vehiclePlate: v.string(),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Reservation not found");

    const chauffeurData = {
      name: sanitizeName(args.name),
      phone: sanitizeInput(args.phone),
      vehiclePlate: sanitizeInput(args.vehiclePlate).toUpperCase(),
      assignedAt: Date.now(),
    };

    await ctx.db.patch(args.id, {
      chauffeur: chauffeurData,
      status: ride.status === "confirmed" ? ("chauffeur_assigned" as const) : ride.status,
      updatedAt: Date.now(),
    });

    if (args.adminEmail) {
      await ctx.scheduler.runAfter(0, internal.audit.logInternal, {
        adminEmail: args.adminEmail,
        action: "ASSIGN_CHAUFFEUR",
        entity: "rides",
        entityId: args.id,
        previousValue: JSON.stringify(ride.chauffeur || {}),
        newValue: JSON.stringify(chauffeurData),
      });
    }

    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: "status_update",
      title: "Chauffeur Assigned",
      message: `${args.name} assigned to ride for ${ride.customerName}.`,
      link: `/admin/bookings/${args.id}`,
    });
  },
});

export const cancelReservation = mutation({
  args: {
    id: v.id("rides"),
    reason: v.string(),
    customCancellationFee: v.optional(v.number()),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Reservation not found");

    const evalResult: any = await ctx.runQuery(internal.cancellation.evaluateCancellationInternal, {
      rideId: args.id,
    });

    const finalFee = args.customCancellationFee !== undefined
      ? args.customCancellationFee
      : evalResult.cancellationFee;
    const finalRefund = Math.max(0, Math.round((ride.price - finalFee) * 100) / 100);

    const cancellationDetails = {
      cancelledAt: Date.now(),
      cancellationFee: finalFee,
      refundAmount: finalRefund,
      reason: sanitizeInput(args.reason),
      cancelledBy: args.adminEmail || "Customer / Concierge",
    };

    const newPaymentStatus =
      ride.paymentStatus === "paid"
        ? finalRefund > 0
          ? finalFee > 0
            ? ("partially_refunded" as const)
            : ("refunded" as const)
          : ("cancellation_fee" as const)
        : ride.paymentStatus;

    await ctx.db.patch(args.id, {
      status: "cancelled" as const,
      paymentStatus: newPaymentStatus,
      cancellationDetails,
      updatedAt: Date.now(),
    });

    if (args.adminEmail) {
      await ctx.scheduler.runAfter(0, internal.audit.logInternal, {
        adminEmail: args.adminEmail,
        action: "CANCEL_RESERVATION",
        entity: "rides",
        entityId: args.id,
        previousValue: ride.status,
        newValue: "cancelled",
        metadata: JSON.stringify(cancellationDetails),
      });
    }

    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: "cancellation",
      title: "Reservation Cancelled",
      message: `Booking for ${ride.customerName} cancelled. Fee: $${finalFee}, Refund: $${finalRefund}.`,
      link: `/admin/bookings/${args.id}`,
    });

    return cancellationDetails;
  },
});

export const markNoShow = mutation({
  args: {
    id: v.id("rides"),
    adminEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Reservation not found");

    const cancellationDetails = {
      cancelledAt: Date.now(),
      cancellationFee: ride.price,
      refundAmount: 0,
      reason: args.notes || "Passenger failed to arrive at pickup location (No-Show).",
      cancelledBy: args.adminEmail || "Chauffeur Dispatch",
    };

    await ctx.db.patch(args.id, {
      status: "no_show" as const,
      paymentStatus: "cancellation_fee" as const,
      cancellationDetails,
      updatedAt: Date.now(),
    });

    if (args.adminEmail) {
      await ctx.scheduler.runAfter(0, internal.audit.logInternal, {
        adminEmail: args.adminEmail,
        action: "MARK_NO_SHOW",
        entity: "rides",
        entityId: args.id,
        previousValue: ride.status,
        newValue: "no_show",
        metadata: JSON.stringify(cancellationDetails),
      });
    }

    await ctx.scheduler.runAfter(0, internal.notifications.create, {
      type: "cancellation",
      title: "Passenger No-Show Reported",
      message: `Reservation for ${ride.customerName} marked as NO-SHOW. Full fare retained.`,
      link: `/admin/bookings/${args.id}`,
    });
  },
});

export const updateRideAdmin = mutation({
  args: {
    id: v.id("rides"),
    carTypeName: v.optional(v.string()),
    pickupAddress: v.optional(v.string()),
    destinationAddress: v.optional(v.string()),
    pickupDate: v.optional(v.string()),
    pickupTime: v.optional(v.string()),
    passengers: v.optional(v.number()),
    luggage: v.optional(v.number()),
    customPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Reservation not found");

    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (args.carTypeName) updates.carTypeName = sanitizeInput(args.carTypeName);
    if (args.pickupAddress) updates.pickupAddress = sanitizeAddress(args.pickupAddress);
    if (args.destinationAddress) updates.destinationAddress = sanitizeAddress(args.destinationAddress);
    if (args.pickupDate) updates.pickupDate = args.pickupDate;
    if (args.pickupTime) updates.pickupTime = args.pickupTime;
    if (args.passengers !== undefined) updates.passengers = args.passengers;
    if (args.luggage !== undefined) updates.luggage = args.luggage;
    if (args.customPrice !== undefined) updates.price = args.customPrice;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.id, updates);

    await ctx.scheduler.runAfter(0, internal.audit.logInternal, {
      adminEmail: args.adminEmail,
      action: "ADMIN_EDIT_RESERVATION",
      entity: "rides",
      entityId: args.id,
      previousValue: JSON.stringify(ride),
      newValue: JSON.stringify(updates),
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
    if (!ride) throw new Error("Reservation not found");

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
    customerEmail: v.optional(v.string()),
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
    serviceType: v.union(v.literal("point_to_point"), v.literal("hourly")),
    hourlyDuration: v.optional(v.number()),
    pickupDate: v.string(),
    pickupTime: v.optional(v.string()),
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    priceSnapshot: v.optional(v.any()),
    policyVersion: v.optional(v.string()),
    policyAccepted: v.optional(v.boolean()),
    policyAcceptedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rides")
      .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "confirmed",
        paymentStatus: "paid",
        stripePaymentIntentId: args.stripePaymentIntentId,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const tokenBytes = crypto.getRandomValues(new Uint8Array(12));
    const reviewToken = Array.from(tokenBytes, (b) => b.toString(36).toUpperCase()).join("").slice(0, 12);

    const ride = {
      customerName: sanitizeName(args.customerName),
      customerEmail: args.customerEmail || "concierge@lunalimo.com",
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
      priceSnapshot: args.priceSnapshot,
      policyVersion: args.policyVersion || "1.0",
      policyAccepted: args.policyAccepted ?? true,
      policyAcceptedAt: args.policyAcceptedAt || Date.now(),
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      status: "confirmed" as const,
      paymentStatus: "paid" as const,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
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