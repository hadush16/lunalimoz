import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "Luna Limo Booking Platform",
    version: "1.0.0",
    url: "https://lunalimoz.com",
  },
});

export function isLiveStripeConfigured(): boolean {
  return (
    !!process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("placeholder") &&
    !process.env.STRIPE_SECRET_KEY.includes("your_")
  );
}
