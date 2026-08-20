"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pickupIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#22C55E"/>
      <circle cx="16" cy="16" r="8" fill="#0B0B0C"/>
      <circle cx="16" cy="16" r="3" fill="#22C55E"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

const destIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#EF4444"/>
      <rect x="11" y="11" width="10" height="10" rx="2" fill="#0B0B0C"/>
      <rect x="14" y="14" width="4" height="4" fill="#EF4444"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

interface MapComponentProps {
  pickup: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][];
}

function MapBoundsUpdater({ pickup, destination, routeCoordinates }: MapComponentProps) {
  const map = useMap();

  React.useEffect(() => {
    if (!pickup && !destination) return;

    if (pickup && destination && routeCoordinates && routeCoordinates.length > 0) {
      const latLngCoords = routeCoordinates.map((coord) => [coord[1], coord[0]] as [number, number]);
      const bounds = L.latLngBounds(latLngCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lng], 14);
    } else if (destination) {
      map.flyTo([destination.lat, destination.lng], 14);
    }
  }, [pickup, destination, routeCoordinates, map]);

  return null;
}

export function MapComponent({ pickup, destination, routeCoordinates }: MapComponentProps) {
  const center: [number, number] = [47.6062, -122.3321];

  const polylinePositions = React.useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) return [];
    return routeCoordinates.map((coord) => [coord[1], coord[0]] as [number, number]);
  }, [routeCoordinates]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      className="rounded-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {pickup && (
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
      )}
      
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon} />
      )}
      
      {polylinePositions.length > 0 && (
        <Polyline
          positions={polylinePositions}
          color="#D4AF37"
          weight={5}
          opacity={0.9}
          lineCap="round"
          lineJoin="round"
        />
      )}

      <MapBoundsUpdater
        pickup={pickup}
        destination={destination}
        routeCoordinates={routeCoordinates}
      />
    </MapContainer>
  );
}