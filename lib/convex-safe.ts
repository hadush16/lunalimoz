"use client";

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
export const isConvexConfigured =
  typeof convexUrl === "string" &&
  convexUrl.startsWith("https://") &&
  !convexUrl.includes("dummy");

export function useSafeQuery(query: any, ...args: any[]): any {
  if (!isConvexConfigured) {
    return undefined;
  }
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexQuery(query, ...(args as [any]));
  } catch (e) {
    console.warn("Convex query skipped:", e);
    return undefined;
  }
}

export function useSafeMutation(mutation: any): any {
  if (!isConvexConfigured) {
    return async () => {
      console.warn("Convex mutation skipped (unconfigured)");
      return null;
    };
  }
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexMutation(mutation);
  } catch (e) {
    console.warn("Convex mutation skipped:", e);
    return async () => null;
  }
}
