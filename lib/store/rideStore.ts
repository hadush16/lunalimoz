import { create } from "zustand";
import type { SearchResult } from "@/lib/tomtom/search";
import type { RouteResult } from "@/lib/tomtom/routing";
import type { CarType } from "@/lib/pricing";

export type BookingStep = "pickup" | "destination" | "route" | "car" | "confirm" | "complete";

interface RideState {
  step: BookingStep;
  pickup: SearchResult | null;
  destination: SearchResult | null;
  route: RouteResult | null;
  selectedCar: CarType | null;
  carTypes: CarType[];
  
  isLoadingRoute: boolean;
  isLoadingSearch: boolean;
  isBooking: boolean;
  
  error: string | null;

  setStep: (step: BookingStep) => void;
  setPickup: (pickup: SearchResult | null) => void;
  setDestination: (destination: SearchResult | null) => void;
  setRoute: (route: RouteResult | null) => void;
  setSelectedCar: (car: CarType | null) => void;
  setCarTypes: (cars: CarType[]) => void;
  
  setLoadingRoute: (loading: boolean) => void;
  setLoadingSearch: (loading: boolean) => void;
  setBooking: (booking: boolean) => void;
  setError: (error: string | null) => void;
  
  reset: () => void;
  canProceedToStep: (step: BookingStep) => boolean;
}

const initialState = {
  step: "pickup" as BookingStep,
  pickup: null,
  destination: null,
  route: null,
  selectedCar: null,
  carTypes: [],
  
  isLoadingRoute: false,
  isLoadingSearch: false,
  isBooking: false,
  
  error: null,
};

export const useRideStore = create<RideState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  
  setPickup: (pickup) => set({ pickup }),
  setDestination: (destination) => set({ destination }),
  setRoute: (route) => set({ route }),
  setSelectedCar: (selectedCar) => set({ selectedCar }),
  setCarTypes: (carTypes) => set({ carTypes }),
  
  setLoadingRoute: (isLoadingRoute) => set({ isLoadingRoute }),
  setLoadingSearch: (isLoadingSearch) => set({ isLoadingSearch }),
  setBooking: (isBooking) => set({ isBooking }),
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
  
  canProceedToStep: (step) => {
    const state = get();
    
    switch (step) {
      case "pickup":
        return true;
      case "destination":
        return !!state.pickup;
      case "route":
        return !!state.pickup && !!state.destination;
      case "car":
        return !!state.route;
      case "confirm":
        return !!state.selectedCar;
      case "complete":
        return true;
      default:
        return false;
    }
  },
}));