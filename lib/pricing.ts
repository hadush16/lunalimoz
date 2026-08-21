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

export const DEFAULT_CAR_TYPES: CarType[] = [
  {
    _id: "sedan",
    name: "Executive Sedan",
    description: "The ultimate business-class experience with Mercedes-Benz S-Class or BMW 7-Series. Optimal comfort and soundproofing.",
    image: "/executive_sedan.png",
    baseFare: 25,
    perKmRate: 2.5,
    perMinuteRate: 0.5,
    hourlyRate: 120,
    multiplier: 1.0,
    capacity: 3,
    isActive: true,
    createdAt: Date.now(),
  },
  {
    _id: "suv",
    name: "Luxury SUV",
    description: "Commanding presence with Cadillac Escalade or Lincoln Navigator. First-class travel for up to 6 passengers.",
    image: "/luxury_suv.png",
    baseFare: 40,
    perKmRate: 4.5,
    perMinuteRate: 0.8,
    hourlyRate: 180,
    multiplier: 1.5,
    capacity: 6,
    isActive: true,
    createdAt: Date.now(),
  },
  {
    _id: "electric",
    name: "Premium Electric",
    description: "The future of elite transit. Silent performance from Tesla Model S or Lucid Air with zero emissions.",
    image: "/premium_electric.png",
    baseFare: 30,
    perKmRate: 3.2,
    perMinuteRate: 0.6,
    hourlyRate: 140,
    multiplier: 1.2,
    capacity: 3,
    isActive: true,
    createdAt: Date.now(),
  },
  {
    _id: "van",
    name: "Executive Van",
    description: "Bespoke group logistics for up to 14 passengers. Custom Mercedes-Benz Sprinter with captain chairs.",
    image: "/executive_van.png",
    baseFare: 60,
    perKmRate: 5.5,
    perMinuteRate: 1.0,
    hourlyRate: 220,
    multiplier: 2.0,
    capacity: 14,
    isActive: true,
    createdAt: Date.now(),
  },
];

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
