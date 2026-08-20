# Payment Integration - Implementation Plan

**Based on:** `docs/specs/2026-04-02-payment-integration-design.md`  
**Date:** 2026-04-02

## Overview

This plan implements Stripe Elements payment collection for the Luna Limo booking flow. The work is divided into 5 phases with clear deliverables and dependencies.

## Phase 1: Dependencies & Configuration

### 1.1 Install Stripe packages
```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js stripe
```

### 1.2 Add environment variables
**File:** `.env.example`
```env
# Stripe (https://stripe.com)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
```

### 1.3 Create Stripe client utility
**File:** `lib/stripe/client.ts`
```typescript
import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
```

### 1.4 Update Next.js config for Stripe (if needed)
Check `next.config.ts` or `next.config.mjs` for any Stripe-related transpile settings.

## Phase 2: Database Schema Changes

### 2.1 Update `convex/schema.ts`

**Add `payments` table:**
```typescript
payments: defineTable({
  rideId: v.id("rides"),
  stripePaymentIntentId: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("succeeded"),
    v.literal("failed"),
    v.literal("refunded")
  ),
  paymentMethod: v.optional(v.string()),
  refundAmount: v.optional(v.number()),
  refundedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_ride", ["rideId"])
  .index("by_stripePaymentIntentId", ["stripePaymentIntentId"])
  .index("by_status", ["status"]),
```

**Update `rides` table - add fields:**
```typescript
// Inside rides defineTable, add:
paymentStatus: v.optional(v.union(
  v.literal("unpaid"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("partially_refunded")
)),
stripePaymentIntentId: v.optional(v.string()),
```

### 2.2 Apply schema migration
```bash
npx convex dev
```

**Note:** Existing rides will have `paymentStatus: undefined` which is fine (treated as "unpaid").

## Phase 3: Backend Implementation

### 3.1 Create `convex/payments.ts`

**Functions to implement:**

#### `createPaymentIntent` (action with "use node")
```typescript
export const createPaymentIntent = action({
  args: {
    carTypeName: v.string(),
    distance: v.number(),
    duration: v.number(),
    serviceType: v.union(v.literal("point_to_point"), v.literal("hourly")),
    hourlyDuration: v.optional(v.number()),
    carTypeMultiplier: v.number(),
    customerEmail: v.string(),
    customerName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch car type from DB
    // 2. Recalculate price server-side using pricing logic
    // 3. Fetch settings for minimum fare
    // 4. Create Stripe PaymentIntent
    // 5. Return { clientSecret, calculatedPrice, rideData }
  },
});
```

**Key implementation details:**
- Use `"use node";` directive at file top
- Import Stripe SDK: `import Stripe from "stripe";`
- Initialize: `const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);`
- Amount must be in cents: `Math.round(calculatedPrice * 100)`
- Payment methods config:
  ```typescript
  payment_method_types: ["card"],
  payment_method_options: {
    card: {
      request_three_d_secure: "automatic",
    },
  },
  ```
- For Apple Pay/Google Pay: These work automatically with Stripe Elements when the browser supports them
- For PayPal: Requires additional setup in Stripe dashboard + `payment_method_types: ["card", "paypal"]`

#### `handleWebhook` (HTTP function)
```typescript
import { httpRouter } from "convex/server";

const http = httpRouter();

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: async (ctx, request) => {
    // 1. Get raw body and signature header
    // 2. Verify with stripe.webhooks.constructEvent()
    // 3. Handle events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
    // 4. Update payment record in DB
    // 5. Return 200
  },
});

export default http;
```

**Key implementation details:**
- Convex HTTP functions receive `Request` objects
- Need to clone request to get raw body: `const rawBody = await request.clone().text();`
- Signature header: `request.headers.get("stripe-signature")`
- Use `ctx.db.query("payments")` to find payment by stripePaymentIntentId
- Idempotent: check current status before updating

#### `processRefund` (action with "use node")
```typescript
export const processRefund = action({
  args: {
    paymentId: v.id("payments"),
    amount: v.optional(v.number()), // in cents, defaults to full refund
  },
  handler: async (ctx, args) => {
    // 1. Fetch payment record
    // 2. Call stripe.refunds.create()
    // 3. Update payment status
    // 4. Update ride paymentStatus
    // 5. Send refund email via scheduler
  },
});
```

#### `getByRideId` (query)
```typescript
export const getByRideId = query({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_ride", (q) => q.eq("rideId", args.rideId))
      .first();
  },
});
```

### 3.2 Update `convex/rides.ts`

**Changes to `create` mutation:**

1. Add optional args:
```typescript
stripePaymentIntentId: v.optional(v.string()),
```

2. Update status logic:
```typescript
const hasPayment = !!args.stripePaymentIntentId;
const ride = {
  // ... existing fields
  status: hasPayment ? ("confirmed" as const) : ("pending" as const),
  paymentStatus: hasPayment ? ("paid" as const) : ("unpaid" as const),
  stripePaymentIntentId: args.stripePaymentIntentId,
  // ... rest
};
```

3. Add server-side price validation:
```typescript
// Fetch car type and recalculate price
const carType = await ctx.db
  .query("carTypes")
  .withIndex("by_name", (q) => q.eq("name", args.carTypeName))
  .first();

if (!carType) throw new Error("Vehicle type not found");

// Recalculate and compare (allow small floating-point difference)
const expectedPrice = /* pricing calculation */;
if (Math.abs(args.price - expectedPrice) > 0.01) {
  throw new Error("Price mismatch. Please refresh and try again.");
}
```

**Changes to `updateStatus` mutation:**

When cancelling, update payment status:
```typescript
if (args.status === "cancelled" && ride.paymentStatus === "paid") {
  // Don't auto-refund, just mark as needing review
  await ctx.db.patch(args.id, {
    paymentStatus: "paid", // Admin handles refund separately
  });
}
```

### 3.3 Update `convex/_generated/api.ts` references

No manual changes needed - auto-generated when you run `npx convex dev`.

## Phase 4: Frontend Implementation

### 4.1 Create `components/booking/payment-form.tsx`

**Component structure:**
```typescript
"use client";

import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import { useState } from "react";

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ clientSecret, amount, onSuccess, onError }: PaymentFormProps) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance: { /* dark theme */ } }}>
      <PaymentFormInner amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

function PaymentFormInner({ amount, onSuccess, onError }: Omit<PaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/booking?payment=complete",
      },
      redirect: "if_required", // Keep on-page for most payment methods
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      onError(result.error.message || "Payment failed");
    } else if (result.paymentIntent.status === "succeeded") {
      onSuccess(result.paymentIntent.id);
    }

    setProcessing(false);
  };

  // Render form with dark theme matching existing design
}
```

**Styling notes:**
- Use Stripe's `appearance` option for dark theme
- Match gold accent colors: `--color-gold: #C5A059`
- Background: `#000000`, surface: `#111111`
- Font: DM Sans (body), DM Serif Display (headings)

### 4.2 Update `app/booking/booking-client.tsx`

**Changes needed:**

1. Add new step type:
```typescript
type BookingStep = "trip" | "vehicle" | "review" | "payment";
```

2. Add state for payment:
```typescript
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [paymentError, setPaymentError] = useState<string>();
```

3. Update Step 3 button text:
```typescript
// Change "Confirm Reservation" to "Proceed to Payment"
```

4. Add handler for proceeding to payment step:
```typescript
const handleProceedToPayment = async () => {
  if (!selectedCar || !pricing) return;
  
  setBooking(true);
  try {
    const result = await createPaymentIntent({
      carTypeName: selectedCar.name,
      distance: route?.distanceInKm || 0,
      duration: route?.durationInMinutes || 0,
      serviceType,
      hourlyDuration: serviceType === "hourly" ? options.hourlyDuration : undefined,
      carTypeMultiplier: selectedCar.multiplier,
      customerEmail: options.customerEmail,
      customerName: options.customerName,
    });
    
    setClientSecret(result.clientSecret);
    setBookingStep("payment");
  } catch (error) {
    console.error("Failed to create payment intent:", error);
  } finally {
    setBooking(false);
  }
};
```

5. Add Step 4 (Payment) rendering:
```typescript
{bookingStep === "payment" && clientSecret && (
  <div className="space-y-10 animate-fade-in">
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-black italic uppercase text-white border-b border-neutral-800 pb-2">
        Payment
      </h3>
      <p className="text-neutral-400 text-sm">
        Total: {formatPrice(pricing!.totalPrice)}
      </p>
      {paymentError && (
        <div className="bg-red-900/20 border border-red-800 p-4 text-red-400 text-sm">
          {paymentError}
        </div>
      )}
      <PaymentForm
        clientSecret={clientSecret}
        amount={pricing!.totalPrice}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  </div>
)}
```

6. Add payment success handler:
```typescript
const handlePaymentSuccess = async (paymentIntentId: string) => {
  try {
    await createRide({
      // ... existing ride data
      stripePaymentIntentId: paymentIntentId,
    });
    setStep("complete");
  } catch (error) {
    console.error("Failed to create ride after payment:", error);
    // Payment succeeded but ride creation failed - this needs manual reconciliation
    // The webhook will handle updating the payment status
  }
};
```

7. Update step indicator to show 4 steps

### 4.3 Update `lib/convex/api.ts`

Add `createPaymentIntent` function:
```typescript
export async function createPaymentIntent(data: {
  carTypeName: string;
  distance: number;
  duration: number;
  serviceType: "point_to_point" | "hourly";
  hourlyDuration?: number;
  carTypeMultiplier: number;
  customerEmail: string;
  customerName: string;
}) {
  const response = await fetch(`${CONVEX_URL}/api/run/actions/payments:createPaymentIntent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args: data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment intent");
  }

  return response.json();
}
```

Update `createRide` to accept payment fields:
```typescript
// Add to the rideData type:
stripePaymentIntentId?: string;
```

### 4.4 Update `components/booking/step-indicator.tsx`

Add 4th step:
```typescript
// Update to show 4 steps: Trip, Vehicle, Review, Payment
```

### 4.5 Add Stripe Elements provider wrapper (if needed)

If using Stripe Elements across multiple components, consider adding an `Elements` provider at a higher level. However, since we only need it on the payment step, creating it inline in `PaymentForm` is fine.

## Phase 5: Admin Panel Updates

### 5.1 Update `app/admin/bookings/page.tsx`

**Add payment status filter:**
```typescript
// Add to existing status filter dropdown:
const paymentStatusFilter = searchParams.get("paymentStatus") || "all";

// Filter options: all, paid, unpaid, refunded
```

**Add payment column to table:**
```typescript
// New column showing:
// - Paid: green badge with amount
// - Unpaid: gray badge
// - Refunded: yellow badge
```

### 5.2 Update `app/admin/bookings/[rideId]/page.tsx`

**Add payment section:**
```typescript
// Query payment record:
const payment = useQuery(api.payments.getByRideId, { rideId });

// Display:
// - Payment status badge
// - Amount paid
// - Payment method (card, apple_pay, etc.)
// - Stripe PaymentIntent ID (truncated, with copy button)
// - Refund button (if payment status is "paid")
```

**Refund modal:**
```typescript
// Modal with:
// - Full refund button
// - Partial refund input (amount)
// - Confirmation dialog
// - Calls payments.processRefund
```

### 5.3 Update `components/admin/InvoicePDF.tsx`

**Changes:**
- Replace hardcoded "PAID" with actual payment status check
- Show payment method on invoice
- Show refund amount if applicable
- Update terms to reflect online payment

## Phase 6: Testing & Verification

### 6.1 Local Development Setup

1. Get Stripe test keys from https://dashboard.stripe.com/test/apikeys
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Install Stripe CLI and run:
   ```bash
   stripe listen --forward-to <convex-deployment-url>/api/webhooks/stripe
   ```
   Or for local Convex:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

### 6.2 Test Cards

| Card Number | Purpose |
|-------------|---------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires 3D Secure |
| 4000 0000 0000 3220 | Requires authentication |

### 6.3 Test Checklist

- [ ] Card payment succeeds → booking confirmed
- [ ] Card declined → error shown, no booking created
- [ ] Apple Pay works (on supported device)
- [ ] Google Pay works (on supported device)
- [ ] PayPal redirect flow works
- [ ] Webhook receives and processes events
- [ ] Admin sees payment status in booking list
- [ ] Admin sees payment details in booking detail
- [ ] Refund works (full and partial)
- [ ] Invoice PDF shows correct payment info
- [ ] Existing bookings (without payment) still work
- [ ] Phone bookings (no payment) still create as pending

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `convex/schema.ts` | Modify | Add payments table, update rides table |
| `convex/payments.ts` | **New** | Payment actions, webhook, refund |
| `convex/rides.ts` | Modify | Add payment fields to create, update status logic |
| `lib/stripe/client.ts` | **New** | Stripe.js singleton |
| `lib/convex/api.ts` | Modify | Add createPaymentIntent, update createRide |
| `components/booking/payment-form.tsx` | **New** | Stripe Elements payment form |
| `app/booking/booking-client.tsx` | Modify | Add 4th step, payment flow |
| `components/booking/step-indicator.tsx` | Modify | Add 4th step |
| `app/admin/bookings/page.tsx` | Modify | Payment filter, payment column |
| `app/admin/bookings/[rideId]/page.tsx` | Modify | Payment details, refund button |
| `components/admin/InvoicePDF.tsx` | Modify | Payment status on invoice |
| `.env.example` | Modify | Add Stripe env vars |
| `package.json` | Modify | Add Stripe dependencies |

## Dependencies Order

1. Phase 1 (Dependencies) → Phase 2 (Schema)
2. Phase 2 → Phase 3 (Backend)
3. Phase 3 → Phase 4 (Frontend)
4. Phase 3 → Phase 5 (Admin)
5. Phase 4 + Phase 5 → Phase 6 (Testing)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Stripe webhook fails to deliver | Idempotent handlers, manual reconciliation via admin |
| Payment succeeds but ride creation fails | Webhook creates payment record; admin can manually link |
| Schema migration breaks existing data | New fields are optional; existing rides unaffected |
| Stripe Elements theme doesn't match | Use Stripe appearance API with custom CSS variables |
| Convex actions can't use Stripe SDK | Use `"use node"` directive; Stripe SDK works in Node.js |
