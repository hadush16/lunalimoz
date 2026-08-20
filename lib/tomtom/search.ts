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

async function fetchWithKey(url: string, apiKey: string): Promise<any> {
  const fullUrl = `${url}&key=${apiKey}`;
  const response = await fetch(fullUrl);
  const data = await response.json();
  
  if (!response.ok) {
    console.error("TomTom API error:", response.status, data);
    throw new Error(`Request failed with status code ${response.status}: ${data?.message || 'Unknown error'}`);
  }
  return data;
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("TomTom API key not configured");
    return [];
  }

  try {
    const baseUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?limit=8&language=en-US&countrySet=US&lat=47.6062&lon=-122.3321`;
    
    const response = await fetchWithKey(baseUrl, apiKey) as SearchResponse;

    if (!response?.results) return [];

    return response.results.map((result) => ({
      id: result.id,
      address: result.address,
      position: result.position,
      type: result.type,
    }));
  } catch (error) {
    console.error("TomTom search error:", error);
    return [];
  }
}

export async function geocodeAddress(address: string): Promise<SearchResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const baseUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(address)}.json?limit=1&language=en-US&countrySet=US&lat=47.6062&lon=-122.3321`;
    
    const response = await fetchWithKey(baseUrl, apiKey) as SearchResponse;

    if (!response?.results?.[0]) return null;

    const result = response.results[0];
    return {
      id: result.id,
      address: result.address,
      position: result.position,
      type: result.type,
    };
  } catch (error) {
    console.error("TomTom geocode error:", error);
    return null;
  }
}