import { PricingQuoteResult } from "./types";

const QUOTE_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "lunalimoz-pricing-quote-token-secret-key-32b";

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(QUOTE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed JWT quote token with a 15-minute expiry.
 */
export async function createSignedQuoteToken(quote: PricingQuoteResult): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "lunalimoz_quote",
    vehicle_slug: quote.vehicle_slug,
    trip_type: quote.trip_type,
    rate_card_version: quote.rate_card_version,
    distance_miles: quote.distance_miles,
    duration_minutes: quote.duration_minutes,
    total_cents: quote.total_cents,
    subtotal_cents: quote.subtotal_cents,
    gratuity_cents: quote.gratuity_cents,
    tax_cents: quote.tax_cents,
    iat: Math.floor(quote.created_at / 1000),
    exp: Math.floor(quote.expires_at / 1000),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const signatureBase64 = Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${signatureBase64}`;
}

/**
 * Verifies a signed JWT quote token and returns the payload if valid and unexpired.
 */
export async function verifySignedQuoteToken(token: string): Promise<{
  valid: boolean;
  expired: boolean;
  payload?: any;
  error?: string;
}> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, expired: false, error: "Malformed token" };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const key = await getCryptoKey();
    const signatureBuffer = Buffer.from(
      encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) {
      return { valid: false, expired: false, error: "Invalid signature" };
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowSec) {
      return { valid: false, expired: true, payload, error: "Quote has expired (15m lock passed)" };
    }

    return { valid: true, expired: false, payload };
  } catch (err: any) {
    return { valid: false, expired: false, error: err.message || "Failed to verify token" };
  }
}
