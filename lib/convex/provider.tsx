"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";

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

export const isValidConvex = isValidUrl;

// Use real URL if validly configured, or a syntactically valid deployment hostname that avoids parsing crashes
const convexUrl = isValidUrl ? rawUrl : "https://rapid-otter-123.convex.cloud";

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}