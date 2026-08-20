export interface CarType {
  _id?: string;
  name: string;
  description: string;
  image: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  hourlyRate?: number;
  multiplier: number;
  capacity: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PricingResult {
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  multiplier: number;
  totalPrice: number;
}

export function calculatePrice(
  carType: CarType,
  distanceKm: number,
  durationMinutes: number,
  dynamicMultiplier: number = 1.0,
  minimumFare: number = 0
): PricingResult {
  const baseFare = carType.baseFare;
  const distanceCharge = distanceKm * carType.perKmRate * carType.multiplier;
  const timeCharge = durationMinutes * carType.perMinuteRate * carType.multiplier;
  const multiplier = carType.multiplier * dynamicMultiplier;

  const subtotal = baseFare + distanceCharge + timeCharge;
  let totalPrice = Math.round(subtotal * 100) / 100;
  if (totalPrice < minimumFare) {
    totalPrice = minimumFare;
  }

  return {
    baseFare,
    distanceCharge: Math.round(distanceCharge * 100) / 100,
    timeCharge: Math.round(timeCharge * 100) / 100,
    multiplier,
    totalPrice,
  };
}

export function calculateHourlyPrice(
  carType: CarType,
  hours: number,
  dynamicMultiplier: number = 1.0,
  minimumFare: number = 0
): PricingResult {
  const hourlyCharge = hours * (carType.hourlyRate || 0) * carType.multiplier * dynamicMultiplier;
  let totalPrice = Math.round(hourlyCharge * 100) / 100;
  
  if (totalPrice < minimumFare) {
    totalPrice = minimumFare;
  }

  return {
    baseFare: 0,
    distanceCharge: 0,
    timeCharge: Math.round(hourlyCharge * 100) / 100,
    multiplier: carType.multiplier * dynamicMultiplier,
    totalPrice,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
