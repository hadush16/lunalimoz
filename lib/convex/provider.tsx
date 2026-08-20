"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode, useState } from "react";

const rawUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isValidUrl = rawUrl.startsWith("https://") && rawUrl.includes(".convex.");
const convexUrl = isValidUrl ? rawUrl : "https://dummy-dev.convex.cloud";

const convexClient = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export function ConvexProvider({ children }: { children: ReactNode }) {
  const [client] = useState(convexClient);

  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}