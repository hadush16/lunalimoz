"use client";

import * as React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapComponentProps {
  pickup: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][];
}

export function MapComponent({ pickup, destination, routeCoordinates }: MapComponentProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const pickupMarkerRef = React.useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = React.useRef<maplibregl.Marker | null>(null);
  const isMapLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-122.3321, 47.6062],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      isMapLoadedRef.current = true;
      mapRef.current = map;
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isMapLoadedRef.current = false;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;

    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    if (!pickup) return;

    const el = createMarkerElement("#D4AF37");
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([pickup.lng, pickup.lat])
      .addTo(mapRef.current);
    pickupMarkerRef.current = marker;
  }, [pickup]);

  React.useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;

    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (!destination) return;

    const el = createMarkerElement("#D4AF37");
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([destination.lng, destination.lat])
      .addTo(mapRef.current);
    destMarkerRef.current = marker;
  }, [destination]);

  React.useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;

    const map = mapRef.current;

    if (map.getLayer("route")) {
      map.removeLayer("route");
    }
    if (map.getSource("route")) {
      map.removeSource("route");
    }

    if (!routeCoordinates || routeCoordinates.length === 0) return;

    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      },
    });

    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#D4AF37",
        "line-width": 5,
        "line-opacity": 0.8,
      },
    });

    if (pickup && destination) {
      const bounds = new maplibregl.LngLatBounds(
        [pickup.lng, pickup.lat],
        [destination.lng, destination.lat]
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  }, [routeCoordinates, pickup, destination]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

function createMarkerElement(color: string) {
  const el = document.createElement("div");
  el.innerHTML = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="#0B0B0C"/>
    </svg>
  `;
  el.style.cursor = "pointer";
  return el;
}