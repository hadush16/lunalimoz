# lunalimoz

Luxury Chauffeur & Limo Service Web Application built with Next.js 16 (App Router), Convex backend, Tailwind CSS v4, and Stripe payments.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Ensure the following Environment Variables are configured in Vercel settings:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_TOMTOM_API_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `AUTH_SECRET`
