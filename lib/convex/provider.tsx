"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode, createContext, useContext, useState } from "react";

function getConvexClient(): ConvexReactClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || !url.startsWith("https://") || url.includes("dummy")) {
    return null;
  }
  try {
    return new ConvexReactClient(url);
  } catch (e) {
    console.warn("ConvexReactClient initialization skipped:", e);
    return null;
  }
}

const ConvexContext = createContext<ConvexReactClient | null>(null);

export function ConvexProvider({ children }: { children: ReactNode }) {
  const [client] = useState<ConvexReactClient | null>(getConvexClient);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

export function useConvexClient() {
  return useContext(ConvexContext);
}