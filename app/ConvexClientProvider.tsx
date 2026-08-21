"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

const rawUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isValidUrl = typeof rawUrl === "string" && rawUrl.startsWith("https://") && rawUrl.includes(".convex.");
const convexUrl = isValidUrl ? rawUrl : "https://dummy-placeholder.convex.cloud";

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
