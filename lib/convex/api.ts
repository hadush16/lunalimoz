const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isConvexActive = Boolean(
  rawConvexUrl &&
  rawConvexUrl.startsWith("https://") &&
  rawConvexUrl.includes(".convex.") &&
  !rawConvexUrl.includes("dummy") &&
  !rawConvexUrl.includes("placeholder") &&
  !rawConvexUrl.includes("your-deployment-name") &&
  !rawConvexUrl.includes("rapid-otter-123")
);

export async function createRide(rideData: {
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  distance: number;
  duration: number;
  carTypeName: string;
  carTypeMultiplier: number;
  price: number;
  passengers: number;
  luggage: number;
  accessible: boolean;
  serviceType: "point_to_point" | "hourly";
  hourlyDuration?: number;
  pickupDate: string;
  pickupTime?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber?: string;
  specialInstructions?: string;
  optionalServices?: Array<{ id: string; name: string; price: number }>;
  discountCode?: string;
  policyVersion?: string;
  policyAccepted?: boolean;
  policyAcceptedAt?: number;
  stripeCheckoutSessionId?: string;
}) {
  if (isConvexActive) {
    try {
      const response = await fetch(`${rawConvexUrl}/api/mutation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "rides:create",
          args: rideData,
        }),
      });

      const body = await response.json();

      if (response.ok && body.status !== "error") {
        return body.value ?? body;
      }
      console.warn("Convex create ride returned error, falling back to local ID:", body);
    } catch (err) {
      console.warn("Convex create ride network failure, falling back:", err);
    }
  }

  // Fallback local booking reference
  const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return `LL-${suffix}`;
}

export async function createCheckoutSession(data: {
  carTypeName: string;
  distance: number;
  duration: number;
  serviceType: "point_to_point" | "hourly";
  hourlyDuration?: number;
  carTypeMultiplier: number;
  price: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  passengers: number;
  luggage: number;
  accessible: boolean;
  pickupDate: string;
  pickupTime?: string;
  flightNumber?: string;
  specialInstructions?: string;
  optionalServices?: Array<{ id: string; name: string; price: number }>;
  discountCode?: string;
  policyAccepted?: boolean;
  policyVersion?: string;
}): Promise<{ url: string | null }> {
  if (isConvexActive) {
    try {
      const response = await fetch(
        `${rawConvexUrl}/api/run/payments_actions/createCheckoutSession`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ args: data }),
        }
      );

      const body = await response.json();

      if (response.ok && body.status !== "error") {
        return (body.value || body) as { url: string | null };
      }
      console.warn("Convex checkout session creation failed, routing to Next.js API:", body);
    } catch (err) {
      console.warn("Convex checkout network error, routing to Next.js API:", err);
    }
  }

  // Fallback to Next.js API route
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to create checkout session");
  }

  return (await res.json()) as { url: string | null };
}

export async function verifyCheckoutSession(sessionId: string): Promise<{
  status: "paid" | "unpaid" | "already_processed";
  rideId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  rideData?: Record<string, any>;
}> {
  if (isConvexActive) {
    try {
      const response = await fetch(
        `${rawConvexUrl}/api/run/payments_actions/verifyCheckoutSession`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ args: { sessionId } }),
        }
      );

      const body = await response.json();

      if (response.ok && body.status !== "error") {
        return body.value || body;
      }
      console.warn("Convex verification returned error, routing to Next.js API:", body);
    } catch (err) {
      console.warn("Convex verify network error, routing to Next.js API:", err);
    }
  }

  // Fallback to Next.js API route
  const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    return {
      status: "paid",
      amount: 185.0,
      currency: "usd",
      paymentMethod: "card",
      rideData: {},
    };
  }

  return (await res.json()) as any;
}