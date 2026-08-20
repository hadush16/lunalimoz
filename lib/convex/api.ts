const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

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
  stripeCheckoutSessionId?: string;
}) {
  if (!CONVEX_URL) {
    console.error("Convex URL not configured");
    throw new Error("Backend not configured");
  }

  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
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

  if (!response.ok || body.status === "error") {
    console.error("Convex create ride error:", body);
    const msg = body.errorMessage
      ? body.errorMessage.replace(/^\[Request ID: [^\]]+\] /, "")
      : body.message || "Failed to create ride";
    throw new Error(msg);
  }

  // Convex wraps the return value: { status: "success", value: <rideId> }
  return body.value ?? body;
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
}) {
  if (!CONVEX_URL) {
    console.error("Convex URL not configured");
    throw new Error("Backend not configured");
  }

  const response = await fetch(`${CONVEX_URL}/api/run/payments_actions/createCheckoutSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ args: data }),
  });

  const body = await response.json();

  if (!response.ok || body.status === "error") {
    console.error("Checkout session error full:", JSON.stringify(body, null, 2));

    let errorMsg = "Failed to create checkout session";
    if (body.errorMessage) {
      // Strip Convex request ID formatting
      const cleanMsg = body.errorMessage.replace(/^\\[Request ID: .*\\] /, '');
      errorMsg = cleanMsg;
    } else if (body.message) {
      errorMsg = body.message;
    }
    throw new Error(errorMsg);
  }

  return (body.value || body) as { url: string | null };
}

export async function verifyCheckoutSession(sessionId: string) {
  if (!CONVEX_URL) {
    console.error("Convex URL not configured");
    throw new Error("Backend not configured");
  }

  const response = await fetch(`${CONVEX_URL}/api/run/payments_actions/verifyCheckoutSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ args: { sessionId } }),
  });

  const body = await response.json();

  if (!response.ok || body.status === "error") {
    console.error("Verification error:", JSON.stringify(body, null, 2));

    let errorMsg = "Failed to verify checkout session";
    if (body.errorMessage) {
      const cleanMsg = body.errorMessage.replace(/^\\[Request ID: .*\\] /, '');
      errorMsg = cleanMsg;
    } else if (body.message) {
      errorMsg = body.message;
    }
    throw new Error(errorMsg);
  }

  return body.value || body;
}