"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
export const isValidConvex = typeof convexUrl === "string" && convexUrl.startsWith("https://") && !convexUrl.includes("dummy");

export function ConvexProvider({ children }: { children: ReactNode }) {
  if (!isValidConvex) {
    return <>{children}</>;
  }

  const client = new ConvexReactClient(convexUrl!, {
    unsavedChangesWarning: false,
  });

  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}