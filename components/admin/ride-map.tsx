"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { calculateRouteBetween } from "@/lib/tomtom/routing";

const MapComponent = dynamic(
  () => import("@/components/map/leaflet-map").then((mod) => mod.MapComponent),
  { ssr: false }
);

interface RideMapProps {
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string } | null;
  isHourly: boolean;
}

export function RideMap({ pickup, destination, isHourly }: RideMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [hasRoute, setHasRoute] = useState(false);

  useEffect(() => {
    if (isHourly || !destination) {
      setIsLoadingRoute(false);
      return;
    }

    calculateRouteBetween(pickup, destination).then((result) => {
      if (result?.coordinates) {
        setRouteCoords(result.coordinates);
        setHasRoute(true);
      }
      setIsLoadingRoute(false);
    });
  }, [pickup, destination, isHourly]);

  return (
    <div className="relative">
      <div className="h-[400px] border border-neutral-800 overflow-hidden">
        {isLoadingRoute ? (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                Calculating route...
              </p>
            </div>
          </div>
        ) : (
          <MapComponent
            pickup={{ lat: pickup.lat, lng: pickup.lng }}
            destination={destination ? { lat: destination.lat, lng: destination.lng } : null}
            routeCoordinates={hasRoute ? routeCoords : undefined}
          />
        )}
      </div>

      {isHourly && !destination && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-neutral-700 px-3 py-2">
          <p className="text-gold text-[9px] font-black uppercase tracking-widest">Hourly Service</p>
        </div>
      )}
    </div>
  );
}
