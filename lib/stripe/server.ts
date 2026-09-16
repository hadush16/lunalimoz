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
  const key = process.env.STRIPE_SECRET_KEY || "";
  return (
    typeof key === "string" &&
    key.length >= 25 &&
    (key.startsWith("sk_live_") ||
      key.startsWith("sk_test_") ||
      key.startsWith("rk_live_") ||
      key.startsWith("rk_test_")) &&
    !key.includes("placeholder") &&
    !key.includes("your_") &&
    !key.includes("123456789") &&
    !key.includes("*****")
  );
}
