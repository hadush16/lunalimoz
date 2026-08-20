"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStep } from "@/lib/store/rideStore";

interface Step {
  id: BookingStep;
  label: string;
}

const steps: Step[] = [
  { id: "pickup", label: "Pickup" },
  { id: "destination", label: "Destination" },
  { id: "route", label: "Route" },
  { id: "car", label: "Vehicle" },
  { id: "confirm", label: "Confirm" },
];

interface StepIndicatorProps {
  currentStep: BookingStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-gold text-background",
                  isCurrent && "bg-gold text-background animate-pulse-gold",
                  !isCompleted && !isCurrent && "bg-surface border border-border text-foreground-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 hidden sm:block",
                  isCurrent ? "text-gold font-medium" : "text-foreground-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors duration-300",
                  index < currentIndex ? "bg-gold" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}