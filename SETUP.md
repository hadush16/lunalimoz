# Luna Limo (lunalimoz.com) — Production Setup & Operations Guide

This guide details environment variable configuration, database seeding, Stripe webhook integration, and the go-live checklist for Luna Limo.

---

## 1. Environment Variables Configuration

Copy `.env.example` to `.env.local` and configure the following keys:

```bash
# Site Domain
NEXT_PUBLIC_SITE_URL=https://lunalimoz.com

# Stripe Integration (PCI SAQ-A Compliant)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Routes / TomTom Maps
GOOGLE_ROUTES_API_KEY=AIzaSy...
NEXT_PUBLIC_TOMTOM_API_KEY=...

# Convex Backend URL
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOYMENT=...

# Authentication & Session Secrets
ADMIN_SESSION_SECRET=your_super_secret_64_byte_key_here
JWT_SECRET=your_jwt_signing_key_here

# Transactional Email (Resend)
RESEND_API_KEY=re_...
CONTACT_EMAIL=info@lunalimoz.com
```

---

## 2. Seeding & Database Migrations

### A. Run Unit Tests (Pricing & Policy)
Execute the zero-dependency test suite to verify integer cent math and tiered cancellations:
```bash
node scripts/run-unit-tests.mjs
```

### B. Seed Active Rate Card (Integer Cents & Mileage Tiers)
In Convex Dashboard or CLI, trigger the rate card seed mutation:
```bash
npx convex run rate_cards:seedRateCard
```
This initializes:
- `rate_cards`: Active version 1.
- `vehicle_rates`: Cadillac Escalade ESV ($40 base, $120 min), Mercedes-Benz S-Class ($35 base, $100 min), Lincoln Navigator L ($40 base, $120 min), Mercedes-Benz Sprinter ($65 base, $180 min).
- `mileage_tiers`: 0–10 mi ($6.50/mi), 10–30 mi ($5.25/mi), 30–75 mi ($4.50/mi), 75+ mi ($3.95/mi).
- `surcharges`: Sea-Tac Airport pickup ($25.00), meet & greet ($35.00), extra stop ($30.00), child seat ($25.00), WA state sales tax (10.25%), gratuity (20%).
- `policy_settings`: 24h free cancellation, 2h imminent cutoff (100%), no-show (100%), complimentary wait times (15m standard, 60m airport).

### C. Seed Admin Owner Account
```bash
npx convex run admin_auth:seedAdminUser '{"email":"admin@lunalimoz.com","password":"YourSecureAdminPassword123!"}'
```

---

## 3. Stripe Webhook Configuration

### A. Local Development (Stripe CLI)
To test webhooks and authorization hold captures locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the printed `whsec_...` into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### B. Production Webhook Setup
1. Log in to [Stripe Dashboard &rarr; Developers &rarr; Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add destination / Add endpoint**.
3. Set **Endpoint URL**: `https://lunalimoz.com/api/webhooks/stripe`.
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.amount_capturable_updated`
   - `setup_intent.succeeded`
   - `charge.refunded`
   - `charge.dispute.created`
5. Click **Add endpoint** and copy the **Signing secret** into your production environment variables (`STRIPE_WEBHOOK_SECRET`).

---

## 4. Stripe Test Card Numbers

| Scenario | Card Number | Expiry | CVC | Expected Result |
|---|---|---|---|---|
| **Successful Payment / Hold** | `4242 4242 4242 4242` | Any future | Any | Authorization hold placed / SetupIntent created. |
| **Card Declined** | `4000 0000 0000 0002` | Any future | Any | Clear decline error shown to user. |
| **3D-Secure Required** | `4000 0025 0000 3155` | Any future | Any | 3DS modal challenge completes successfully. |

---

## 5. Go-Live Production Checklist

- [ ] Switch `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` from `pk_test_...`/`sk_test_...` to live `pk_live_...`/`sk_live_...`.
- [ ] Configure live webhook endpoint in Stripe Dashboard and set live `STRIPE_WEBHOOK_SECRET`.
- [ ] Verify `NEXT_PUBLIC_SITE_URL` is set to `https://lunalimoz.com`.
- [ ] Verify `ADMIN_SESSION_SECRET` is set to a secure, random 64-character string.
- [ ] Log in to `/admin` and update the default password.
- [ ] Verify terms and cancellation policy links in the footer:
  - `/cancellation-policy`
  - `/terms`
  - `/privacy`
- [ ] Test a live $1.00 reservation in production and verify authorization, cancellation release, and email receipt.
