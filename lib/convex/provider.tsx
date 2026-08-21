"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";

const rawUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isValidUrl = typeof rawUrl === "string" && rawUrl.startsWith("https://") && rawUrl.includes(".convex.");
const convexUrl = isValidUrl ? rawUrl : "https://dummy-placeholder.convex.cloud";

export const isValidConvex = isValidUrl;

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