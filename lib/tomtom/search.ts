import { getApiKey } from "@/lib/tomtom/config";

export interface SearchResult {
  id: string;
  address: {
    freeformAddress: string;
    streetName?: string;
    municipality?: string;
    country?: string;
  };
  position: {
    lat: number;
    lon: number;
  };
  type: string;
}

interface SearchResponse {
  results?: Array<{
    id: string;
    address: {
      freeformAddress: string;
      streetName?: string;
      municipality?: string;
      country?: string;
    };
    position: {
      lat: number;
      lon: number;
    };
    type: string;
  }>;
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const apiKey = getApiKey();
  
  // 1. Attempt TomTom search if a valid non-placeholder key is provided
  if (apiKey && apiKey !== "your_api_key_here" && !apiKey.includes("dummy") && !apiKey.includes("placeholder")) {
    try {
      const baseUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?limit=8&language=en-US&countrySet=US&lat=47.6062&lon=-122.3321&key=${apiKey}`;
      const response = await fetch(baseUrl);
      if (response.ok) {
        const data = (await response.json()) as SearchResponse;
        if (data?.results && data.results.length > 0) {
          return data.results.map((result) => ({
            id: result.id,
            address: result.address,
            position: result.position,
            type: result.type,
          }));
        }
      }
    } catch {
      // Fallback silently to OpenStreetMap Photon
    }
  }

  // 2. Instant Free Fallback (No API Key Required & 0 Console Errors)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lat=47.6062&lon=-122.3321`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.features && Array.isArray(data.features)) {
        return data.features.map((feature: any, idx: number) => {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates || [-122.3321, 47.6062];
          const parts = [
            props.name,
            props.street ? `${props.housenumber || ""} ${props.street}`.trim() : null,
            props.city || props.town || props.district,
            props.state,
            props.country,
          ].filter(Boolean);

          const freeformAddress = parts.length > 0 ? parts.join(", ") : query;

          return {
            id: String(props.osm_id || idx),
            address: {
              freeformAddress,
              streetName: props.street,
              municipality: props.city || props.town || props.state,
              country: props.country,
            },
            position: {
              lat: coords[1],
              lon: coords[0],
            },
            type: props.osm_value || "POI",
          };
        });
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return [];
}

export async function geocodeAddress(address: string): Promise<SearchResult | null> {
  if (!address) return null;

  const results = await searchPlaces(address);
  return results.length > 0 ? results[0] : {
    id: "custom-loc",
    address: { freeformAddress: address, municipality: "Seattle", country: "United States" },
    position: { lat: 47.6062, lon: -122.3321 },
    type: "POI"
  };
}