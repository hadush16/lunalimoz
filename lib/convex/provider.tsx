"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode, createContext, useContext, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function isValidConvexUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.includes("dummy")) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".convex.cloud");
  } catch {
    return false;
  }
}

const ConvexContext = createContext<ConvexReactClient | null>(null);

export function ConvexProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (isValidConvexUrl(convexUrl)) {
      try {
        return new ConvexReactClient(convexUrl!);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

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