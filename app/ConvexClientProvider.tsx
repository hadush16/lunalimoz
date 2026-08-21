"use client";

import { ReactNode } from "react";
import { ConvexProvider as OriginalConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidConvex =
  typeof convexUrl === "string" &&
  convexUrl.startsWith("https://") &&
  !convexUrl.includes("dummy");

const convexClient = isValidConvex ? new ConvexReactClient(convexUrl!) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return <>{children}</>;
  }
  return <OriginalConvexProvider client={convexClient}>{children}</OriginalConvexProvider>;
}
