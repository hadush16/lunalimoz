# Payment Integration Design - Stripe Elements

**Date:** 2026-04-02  
**Status:** Draft

## Summary

Integrate Stripe Elements into the Luna Limo booking flow to collect online payments at booking time. Replaces the current "pending → admin confirms" flow with "pay → auto-confirmed". Adds a 4th step to the booking wizard for payment, a new `payments` table for tracking transactions, server-side price validation, and admin refund capabilities.

## Problem

Currently, bookings are created with `status: "pending"` and require manual admin confirmation. No money is collected online. The invoice PDF labels rides as "PAID" based on status alone, not actual payment. This creates operational friction and no guarantee of payment.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Next.js 16)                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Booking Wizard (4 steps)                           │    │
│  │  1. Trip → 2. Vehicle → 3. Review → 4. Payment     │    │
│  │                                                     │    │
│  │  Step 4: PaymentForm                                │    │
│  │  - Stripe Elements (card, Apple Pay, Google Pay)   │    │
│  │  - PayPal via Stripe                                │    │
│  │  - Real-time validation                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │ 1. createPaymentIntent       │ 3. confirmPayment
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  Convex Action   │          │  Stripe API      │
│  payments:       │          │  (hosted)        │
│  createPayment-  │───2────▶ │                  │
│  Intent          │◀───2a─── │  Returns         │
│                  │  client- │  clientSecret    │
│                  │  Secret  │                  │
└──────────────────┘          └──────────────────┘
         │
         │ 4. createWithPayment
         ▼
┌──────────────────┐          ┌──────────────────┐
│  Convex Mutation │          │  Stripe Webhook  │
│  rides:create    │          │  (HTTP endpoint) │
│  (status:        │          │                  │
│   confirmed)     │          │  payment_intent. │
│                  │          │  succeeded/failed│
└──────────────────┘          └──────────────────┘
```

### Data Flow

1. User completes Steps 1-3 (Trip, Vehicle, Review)
2. User enters Step 4 (Payment), fills in Stripe Elements form
3. Client calls `payments.createPaymentIntent` Convex action with ride data
4. Action recalculates price server-side (security), creates Stripe PaymentIntent
5. Stripe returns `clientSecret` to client
6. Client calls `stripe.confirmPayment()` with the `clientSecret`
7. On success, client calls `rides.create` mutation with `stripePaymentIntentId`
8. Ride is created with `status: "confirmed"`, `paymentStatus: "paid"`
9. Stripe webhook receives async confirmation for reconciliation
10. User sees confirmation screen

## Schema Changes

### New Table: `payments`

```typescript
payments: defineTable({
  rideId: v.id("rides"),
  stripePaymentIntentId: v.string(),
  amount: v.number(),           // cents
  currency: v.string(),         // "usd"
  status: v.union(
    v.literal("pending"),
    v.literal("succeeded"),
    v.literal("failed"),
    v.literal("refunded")
  ),
  paymentMethod: v.optional(v.string()),  // "card", "apple_pay", "google_pay", "link", "paypal"
  refundAmount: v.optional(v.number()),   // cents
  refundedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_ride", ["rideId"])
  .index("by_stripePaymentIntentId", ["stripePaymentIntentId"])
  .index("by_status", ["status"])
```

### Rides Table Changes

```typescript
// Add these fields to existing rides table:
paymentStatus: v.optional(v.union(
  v.literal("unpaid"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("partially_refunded")
)),
stripePaymentIntentId: v.optional(v.string()),
```

### Status Behavior

- **Online bookings:** `status: "confirmed"` + `paymentStatus: "paid"` (auto-confirmed after payment)
- **Phone/manual bookings:** `status: "pending"` + `paymentStatus: "unpaid"` (admin confirms later)
- **Cancelled with refund:** `status: "cancelled"` + `paymentStatus: "refunded"`
- **Cancelled without refund:** `status: "cancelled"` + `paymentStatus: "unpaid"`

## Convex Functions

### `convex/payments.ts`

#### `createPaymentIntent` (action)
- **Input:** Ride data (carTypeName, distance, duration, serviceType, hourlyDuration, etc.)
- **Process:**
  1. Fetch car type from DB to get rates
  2. Recalculate price server-side (security fix)
  3. Fetch settings for minimum fare enforcement
  4. Create Stripe PaymentIntent with amount in cents
  5. Enable payment methods: card, apple_pay, google_pay, link, paypal
- **Output:** `{ clientSecret: string, rideData: {...}, calculatedPrice: number }`

#### `handleWebhook` (HTTP route)
- **Endpoint:** `/api/webhooks/stripe`
- **Events handled:**
  - `payment_intent.succeeded` → Update payment status to "succeeded"
  - `payment_intent.payment_failed` → Update payment status to "failed"
  - `charge.refunded` → Update payment status to "refunded"
- **Security:** Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`

#### `processRefund` (action)
- **Input:** `{ paymentId: Id<"payments">, amount?: number }`
- **Process:**
  1. Fetch payment record
  2. Call Stripe Refund API
  3. Update payment status and ride paymentStatus
  4. Send refund confirmation email
- **Output:** `{ success: boolean, refundAmount: number }`

#### `getByRideId` (query)
- **Input:** `{ rideId: Id<"rides"> }`
- **Output:** Payment record or null

### Updated: `convex/rides.ts`

#### `create` mutation changes
- Add optional `stripePaymentIntentId: v.optional(v.string())` argument
- Add `paymentStatus` field to created ride
- If `stripePaymentIntentId` is provided: `status: "confirmed"`, `paymentStatus: "paid"`
- If not provided (phone booking): `status: "pending"`, `paymentStatus: "unpaid"`
- Add server-side price validation against car type rates

#### `updateStatus` mutation changes
- When cancelling a paid booking, do NOT auto-refund (admin handles refunds separately)
- Update `paymentStatus` to reflect cancellation state

## Client-Side Changes

### New: `components/booking/payment-form.tsx`

```typescript
"use client";
// Props: { amount: number; clientSecret: string; onPaymentSuccess: (paymentIntentId: string) => void; onPaymentError: (error: string) => void; }
```

- Wraps Stripe Elements with `Elements` provider
- Custom theme matching dark/gold design
- Payment method tabs/buttons: Card, Apple Pay, Google Pay, PayPal
- Loading state during payment processing
- Error display for failed payments
- Uses `@stripe/react-stripe-js` for React integration

### Updated: `app/booking/booking-client.tsx`

- Add `bookingStep === "payment"` as 4th step
- Step 3 "Confirm Reservation" button → "Proceed to Payment"
- Step 4 renders `PaymentForm` with calculated price
- On payment success: call `rides.create` with payment intent ID → show confirmation
- On payment error: display error, allow retry
- Update step indicator to 4 steps

### Updated: `lib/convex/api.ts`

- Add `createPaymentIntent` function
- Update `createRide` to accept optional `stripePaymentIntentId` and `paymentStatus`

### New: `lib/stripe/client.ts`

- Initialize Stripe with `STRIPE_PUBLISHABLE_KEY`
- Export `getStripe()` singleton

### Updated: `components/booking/step-indicator.tsx`

- Add 4th step: "Payment"

### Updated: `.env.example`

```
# Stripe (https://stripe.com)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
```

## Admin Changes

### Updated: `app/admin/bookings/[rideId]/page.tsx`

- Add payment status badge next to booking status
- Show payment details: amount, method, transaction ID
- "Refund" button for paid bookings (triggers `payments.processRefund`)
- Refund confirmation modal with amount input (full or partial)

### Updated: `app/admin/bookings/page.tsx`

- Add payment status filter (Paid, Unpaid, Refunded)
- Payment amount column in booking list
- Export CSV includes payment data

### Updated: `components/admin/InvoicePDF.tsx`

- Update "PAID" label to reflect actual payment status
- Show payment method and transaction ID on invoice
- Add refund information if applicable

## Error Handling

### Payment Failures
- Stripe Elements shows inline error for card validation
- Network errors: "Payment processing failed. Please try again."
- Insufficient funds: Display Stripe's decline message
- Failed PaymentIntent: Ride is NOT created, user can retry

### Webhook Failures
- Invalid signature: Log and return 400
- Unknown event: Log and return 200 (acknowledge receipt)
- Duplicate events: Idempotent updates (check current status before patching)

### Refund Failures
- Stripe API error: Show admin error message, do not update DB
- Already refunded: Show warning, do not attempt refund
- Partial refund exceeds original amount: Validation error

## Security Considerations

1. **Price calculation:** Server-side recalculation prevents client tampering
2. **Stripe Elements:** No raw card data touches our servers (PCI SAQ A)
3. **Webhook verification:** Stripe signature validation on all webhook events
4. **Idempotency:** PaymentIntent creation uses idempotency keys for retry safety
5. **Amount validation:** Minimum fare enforcement server-side

## Dependencies

- `@stripe/stripe-js` - Stripe.js loader
- `@stripe/react-stripe-js` - React components for Stripe Elements
- `stripe` - Node.js Stripe SDK (for Convex actions)
