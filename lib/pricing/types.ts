export interface MileageTier {
  from_mile: number;
  to_mile?: number; // undefined or null = infinity
  per_mile_cents: number;
}

export interface VehicleRateData {
  vehicle_slug: string;
  display_name: string;
  base_fare_cents: number;
  per_mile_cents: number;
  per_minute_cents: number;
  hourly_rate_cents: number;
  hourly_minimum_hours: number;
  minimum_fare_cents: number;
  max_passengers: number;
  max_bags: number;
  is_bookable: boolean;
  sort_order: number;
  tiers: MileageTier[];
}

export interface SurchargeData {
  key: string;
  label: string;
  type: "flat" | "percent";
  amount: number; // cents for flat, basis points for percent (e.g. 1025 = 10.25%, 2000 = 20%)
  is_active: boolean;
  extra_config?: string;
}

export interface TripQuoteParams {
  trip_type: "point_to_point" | "hourly" | "airport";
  vehicle: VehicleRateData;
  distance_miles: number;
  duration_minutes: number;
  hourly_hours?: number;
  pickup_datetime_utc: number; // timestamp in ms
  is_airport_pickup?: boolean;
  is_airport_dropoff?: boolean;
  meet_and_greet?: boolean;
  child_seats_count?: number;
  extra_stops_count?: number;
  gratuity_percent?: number; // e.g. 20 for 20%, customer adjustable
  active_surcharges?: SurchargeData[];
  rate_card_version: number;
}

export interface LineItem {
  id: string;
  label: string;
  amount_cents: number;
  details?: string;
}

export interface PricingQuoteResult {
  vehicle_slug: string;
  display_name: string;
  trip_type: "point_to_point" | "hourly" | "airport";
  rate_card_version: number;
  distance_miles: number;
  duration_minutes: number;
  line_items: LineItem[];
  subtotal_cents: number;
  gratuity_cents: number;
  gratuity_percent: number;
  tax_cents: number;
  tax_rate_percent: number;
  total_cents: number;
  created_at: number;
  expires_at: number;
}
