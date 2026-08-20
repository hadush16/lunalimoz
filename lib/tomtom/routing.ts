import { getApiKey } from "@/lib/tomtom/config";

export interface RouteResult {
  distance: number;
  duration: number;
  distanceInKm: number;
  durationInMinutes: number;
  coordinates: [number, number][];
  routeGeoJSON: any;
}

interface RouteResponse {
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

async function fetchWithKey(url: string, apiKey: string): Promise<any> {
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${separator}key=${apiKey}`;
  
  const response = await fetch(fullUrl);
  const data = await response.json();
  
  if (!response.ok) {
    console.error("Routing API error:", response.status, data);
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return data;
}

export async function calculateRouteBetween(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("TomTom API key not configured");
    return null;
  }

  try {
    const pickupCoord = `${Number(pickup.lat).toFixed(6)},${Number(pickup.lng).toFixed(6)}`;
    const destCoord = `${Number(destination.lat).toFixed(6)},${Number(destination.lng).toFixed(6)}`;
    const baseUrl = `https://api.tomtom.com/routing/1/calculateRoute/${pickupCoord}:${destCoord}/json?travelMode=car&traffic=true&routeType=fastest`;
    
    const response = await fetchWithKey(baseUrl, apiKey) as RouteResponse;

    if (!response?.routes?.[0]) {
      console.error("No route found");
      return null;
    }

    const route = response.routes[0];
    const summary = route.summary;

    let coordinates: [number, number][] = [];
    
    if (route.geometry?.polyline) {
      const polyline = route.geometry.polyline;
      
      if (polyline.includes(',')) {
        coordinates = parseSimplePolyline(polyline);
      } else {
        coordinates = decodePolyline(polyline);
      }
    }

    return {
      distance: summary.lengthInMeters,
      duration: summary.travelTimeInSeconds,
      distanceInKm: summary.lengthInMeters / 1000,
      durationInMinutes: Math.round(summary.travelTimeInSeconds / 60),
      coordinates,
      routeGeoJSON: route.geometry,
    };
  } catch (error) {
    console.error("TomTom routing error:", error);
    return null;
  }
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