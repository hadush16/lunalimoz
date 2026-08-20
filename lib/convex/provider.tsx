"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

const ConvexContext = createContext<ConvexReactClient | null>(null);

export function ConvexProvider({ children }: { children: ReactNode }) {
  const [client] = useState(convex);
  
  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

export function useConvexClient() {
  return useContext(ConvexContext);
}