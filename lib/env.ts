const requiredServerEnv = {
  CONVEX_DEPLOYMENT: "CONVEX_DEPLOYMENT",
  RESEND_API_KEY: "RESEND_API_KEY",
} as const;

const requiredPublicEnv = {
  NEXT_PUBLIC_CONVEX_URL: "NEXT_PUBLIC_CONVEX_URL",
  NEXT_PUBLIC_TOMTOM_API_KEY: "NEXT_PUBLIC_TOMTOM_API_KEY",
} as const;

function validateEnv() {
  const missing: string[] = [];

  for (const [key, name] of Object.entries(requiredServerEnv)) {
    if (!process.env[key]) {
      missing.push(name);
    }
  }

  for (const [key, name] of Object.entries(requiredPublicEnv)) {
    if (!process.env[key]) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[Warning] Missing environment variables: ${missing.join(", ")}.\n` +
      `Ensure these variables are defined in .env.local or your deployment provider.`
    );
  }
}

if (process.env.NODE_ENV === "development") {
  validateEnv();
}

export const env = {
  TOMTOM_API_KEY: process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "",
  CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "",
  CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT || "",
  CONVEX_AUTH_KEY: process.env.CONVEX_AUTH_KEY || "",
  PUSHALERT_API_KEY: process.env.PUSHALERT_API_KEY || "",
  ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lunalimoz.com",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@lunalimoz.com",
} as const;
