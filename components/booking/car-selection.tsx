"use client";

import * as React from "react";
import { Car, Users, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CarType } from "@/lib/pricing";

interface CarSelectionProps {
  cars: CarType[];
  selectedCar: CarType | null;
  onSelect: (car: CarType) => void;
}

export function CarSelection({ cars, selectedCar, onSelect }: CarSelectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Select Vehicle</h3>
      <div className="space-y-2">
        {cars.map((car) => (
          <button
            key={car._id || car.name}
            onClick={() => onSelect(car)}
            className={cn(
              "w-full text-left transition-all duration-200 rounded-xl",
              "hover:border-gold/50",
              selectedCar?._id === car._id
                ? "border-gold bg-surface-elevated"
                : "border-border bg-surface"
            )}
          >
            <Card className="p-3 border-0 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                  <Car className="h-5 w-5 text-gold" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{car.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-gold fill-gold" />
                      <span className="text-xs text-gold">{car.multiplier}x</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-foreground-subtle">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{car.capacity}</span>
                    </div>
                    <span className="text-gold font-medium">${car.baseFare}</span>
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}