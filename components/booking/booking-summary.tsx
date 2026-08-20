"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, calculatePrice } from "@/lib/pricing";
import type { CarType } from "@/lib/pricing";
import type { RouteResult } from "@/lib/tomtom/routing";
import type { SearchResult } from "@/lib/tomtom/search";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface BookingSummaryProps {
  pickup: SearchResult | null;
  destination: SearchResult | null;
  route: RouteResult | null;
  selectedCar: CarType | null;
  onConfirm: () => void;
  isBooking: boolean;
}

export function BookingSummary({
  pickup,
  destination,
  route,
  selectedCar,
  onConfirm,
  isBooking,
}: BookingSummaryProps) {
  const dbSettings = useQuery(api.settings.get);
  const minimumFare = dbSettings?.minimumFare || 0;

  const pricing = selectedCar && route
    ? calculatePrice(selectedCar, route.distanceInKm, route.durationInMinutes, 1.0, minimumFare)
    : null;

  return (
    <div className="space-y-3">
      {pricing && (
        <Card variant="glass" className="p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-foreground-muted">Base Fare</span>
            <span className="text-foreground">${pricing.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-foreground-muted">Distance</span>
            <span className="text-foreground">${pricing.distanceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-foreground-muted">Time</span>
            <span className="text-foreground">${pricing.timeCharge.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-medium text-foreground text-sm">Total</span>
            <span className="font-bold text-gradient-gold">
              {formatPrice(pricing.totalPrice)}
            </span>
          </div>
        </Card>
      )}

      <Button
        onClick={onConfirm}
        disabled={!pickup || !destination || !route || !selectedCar || isBooking}
        loading={isBooking}
        size="lg"
        className="w-full text-sm"
      >
        {isBooking ? "Confirming..." : "Confirm Booking"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}