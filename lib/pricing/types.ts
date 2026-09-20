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

export type SupportedTripType = "point_to_point" | "round_trip" | "hourly" | "airport" | "custom";
export type VehicleClassKey = "s-class" | "escalade-esv" | "navigator-l" | "sprinter";

export interface TripQuoteParams {
  trip_type: SupportedTripType;
  vehicle?: VehicleRateData;
  vehicle_class?: VehicleClassKey | string;
  distance_miles: number;
  duration_minutes: number;
  hourly_hours?: number;
  pickup_datetime?: string;
  pickup_datetime_utc?: number; // timestamp in ms
  pickup_address?: string;
  dropoff_address?: string;
  is_airport_pickup?: boolean;
  is_airport_dropoff?: boolean;
  meet_and_greet?: boolean;
  child_seats?: number;
  child_seats_count?: number;
  extra_stops?: number;
  extra_stops_count?: number;
  gratuity_percent?: number; // e.g. 20 for 20%, customer adjustable
  discount_code?: string;
  discount_amount_cents?: number;
  optional_services?: Array<{ id: string; name: string; price_cents: number }>;
  active_surcharges?: SurchargeData[];
  rate_card_version?: number;
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
  trip_type: SupportedTripType;
  rate_card_version: number;
  distance_miles: number;
  duration_minutes: number;
  line_items: LineItem[];
  base_fare_cents: number;
  mileage_charge_cents: number;
  time_charge_cents: number;
  surcharges_total_cents: number;
  discount_cents: number;
  discount_code?: string;
  subtotal_cents: number;
  gratuity_cents: number;
  gratuity_percent: number;
  tax_cents: number;
  tax_rate_percent: number;
  total_cents: number;
  final_amount_dollars: number;
  currency: string;
  created_at: number;
  expires_at: number;
}
