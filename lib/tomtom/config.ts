import { TomTomConfig } from "@tomtom-org/maps-sdk/core";

const API_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "";

if (typeof window !== "undefined" && API_KEY) {
  TomTomConfig.instance.put({
    apiKey: API_KEY,
    language: "en-US",
  });
}

export function initTomTomConfig() {
  if (typeof window !== "undefined") {
    TomTomConfig.instance.put({
      apiKey: process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "",
      language: "en-US",
    });
  }
}

export function getApiKey(): string {
  return process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "";
}