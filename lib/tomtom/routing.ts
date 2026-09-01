import { getApiKey } from "@/lib/tomtom/config";

export interface RouteResult {
  distance: number;
  duration: number;
  distanceInKm: number;
  durationInMinutes: number;
  coordinates: [number, number][];
  routeGeoJSON: any;
}

interface TomTomRouteResponse {
  routes?: Array<{
    summary: {
      lengthInMeters: number;
      travelTimeInSeconds: number;
    };
    geometry?: {
      polyline?: string;
    };
  }>;
}

export async function calculateRouteBetween(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  // Validate coordinates
  if (!pickup?.lat || !pickup?.lng || !destination?.lat || !destination?.lng) {
    return null;
  }

  const apiKey = getApiKey();

  // Tier 1: If a real, non-dummy TomTom key is provided, query TomTom
  if (apiKey && !apiKey.includes("dummy") && !apiKey.includes("placeholder") && !apiKey.includes("your_")) {
    try {
      const pickupCoord = `${Number(pickup.lat).toFixed(6)},${Number(pickup.lng).toFixed(6)}`;
      const destCoord = `${Number(destination.lat).toFixed(6)},${Number(destination.lng).toFixed(6)}`;
      const baseUrl = `https://api.tomtom.com/routing/1/calculateRoute/${pickupCoord}:${destCoord}/json?travelMode=car&traffic=true&routeType=fastest&key=${apiKey}`;
      
      const response = await fetch(baseUrl);
      if (response.ok) {
        const data = (await response.json()) as TomTomRouteResponse;
        if (data?.routes?.[0]) {
          const route = data.routes[0];
          const summary = route.summary;

          let coordinates: [number, number][] = [];
          if (route.geometry?.polyline) {
            const polyline = route.geometry.polyline;
            coordinates = polyline.includes(',')
              ? parseSimplePolyline(polyline)
              : decodePolyline(polyline);
          }

          return {
            distance: summary.lengthInMeters,
            duration: summary.travelTimeInSeconds,
            distanceInKm: Math.round((summary.lengthInMeters / 1000) * 10) / 10,
            durationInMinutes: Math.max(10, Math.round(summary.travelTimeInSeconds / 60)),
            coordinates,
            routeGeoJSON: route.geometry,
          };
        }
      }
    } catch {
      // Fall through to Tier 2
    }
  }

  // Tier 2: Free OpenStreetMap OSRM Routing (Accurate driving route & coordinates)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.routes?.[0]) {
        const route = data.routes[0];
        const distanceMeters = route.distance || 20000;
        const durationSeconds = route.duration || 1500;
        const coordinates = route.geometry?.coordinates || [
          [pickup.lng, pickup.lat],
          [destination.lng, destination.lat],
        ];

        return {
          distance: distanceMeters,
          duration: durationSeconds,
          distanceInKm: Math.round((distanceMeters / 1000) * 10) / 10,
          durationInMinutes: Math.max(10, Math.round(durationSeconds / 60)),
          coordinates: coordinates as [number, number][],
          routeGeoJSON: route.geometry,
        };
      }
    }
  } catch {
    // Fall through to Tier 3
  }

  // Tier 3: Resilient Haversine Distance Fallback (Zero network dependencies)
  const straightLineKm = calculateHaversineDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
  // Apply Seattle urban road curvature multiplier (1.28x) and 30-35 mph average transit speed
  const drivingDistanceKm = Math.max(3.0, Math.round(straightLineKm * 1.28 * 10) / 10);
  const drivingMinutes = Math.max(12, Math.round((drivingDistanceKm / 45) * 60 + 5));

  return {
    distance: drivingDistanceKm * 1000,
    duration: drivingMinutes * 60,
    distanceInKm: drivingDistanceKm,
    durationInMinutes: drivingMinutes,
    coordinates: [
      [pickup.lng, pickup.lat],
      [destination.lng, destination.lat],
    ],
    routeGeoJSON: null,
  };
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseSimplePolyline(polyline: string): [number, number][] {
  const coords: [number, number][] = [];
  const pairs = polyline.split(' ');
  
  for (const pair of pairs) {
    const parts = pair.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coords.push([lng, lat]);
      }
    }
  }
  
  return coords;
}

function decodePolyline(polyline: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polyline.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lng / 1e5, lat / 1e5]);
  }

  return coords;
}