"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

const rawUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isValidUrl = Boolean(
  rawUrl &&
  typeof rawUrl === "string" &&
  rawUrl.startsWith("https://") &&
  rawUrl.includes(".convex.") &&
  !rawUrl.includes("dummy") &&
  !rawUrl.includes("placeholder") &&
  !rawUrl.includes("your-deployment-name")
);

const convexUrl = isValidUrl ? rawUrl : "https://lunalimoz-app.convex.cloud";

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
