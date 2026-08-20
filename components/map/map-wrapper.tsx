"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/map/leaflet-map").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[200px] bg-neutral-900 flex items-center justify-center rounded-none border-b border-neutral-800">
        <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-[10px]">Loading lux map...</p>
      </div>
    ),
  }
);

export default MapComponent;