"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  CheckCircle,
  Clock,
  Car,
  Users,
  Briefcase,
  Luggage,
  Plus,
  Minus,
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Info,
  Plane
} from "lucide-react";
import { LocationInput } from "@/components/booking/location-input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/map/map-wrapper";
import { useRideStore } from "@/lib/store/rideStore";
import { createCheckoutSession } from "@/lib/convex/api";
import { calculateRouteBetween, type RouteResult } from "@/lib/tomtom/routing";

const DEFAULT_ROUTE: RouteResult = {
  distance: 18500,
  duration: 1500,
  distanceInKm: 18.5,
  durationInMinutes: 25,
  coordinates: [],
  routeGeoJSON: null,
};
import { formatDuration, formatDistance } from "@/lib/utils";
import { formatPrice, calculatePrice, calculateHourlyPrice } from "@/lib/pricing";
import type { CarType } from "@/lib/pricing";
import { useSearchParams } from "next/navigation";
import { geocodeAddress } from "@/lib/tomtom/search";
import type { SearchResult } from "@/lib/tomtom/search";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DEFAULT_CAR_TYPES: CarType[] = [
  {
    _id: "sedan" as any,
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
    _id: "suv" as any,
    name: "Luxury SUV",
    description: "Commanding presence with Cadillac Escalade or Lincoln Navigator. First-class travel for up to 6 passengers.",
    image: "/luxury_suv.png",
    baseFare: 40,
    perKmRate: 4.5,
    perMinuteRate: 0.8,
    hourlyRate: 180,
    multiplier: 1.4,
    capacity: 6,
    isActive: true,
    createdAt: Date.now(),
  },
  {
    _id: "electric" as any,
    name: "Premium Electric",
    description: "Silent innovation with Tesla Model S or Lucid Air. Future-focused luxury for the modern traveler.",
    image: "/premium_electric.png",
    baseFare: 35,
    perKmRate: 3.5,
    perMinuteRate: 0.7,
    hourlyRate: 150,
    multiplier: 1.2,
    capacity: 4,
    isActive: true,
    createdAt: Date.now(),
  },
  {
    _id: "van" as any,
    name: "Executive Van",
    description: "Custom Mercedes Sprinter with high-ceiling and captain's chairs. Luxury logistics for groups up to 14.",
    image: "/executive_van.png",
    baseFare: 65,
    perKmRate: 5.5,
    perMinuteRate: 1.2,
    hourlyRate: 250,
    multiplier: 1.8,
    capacity: 14,
    isActive: true,
    createdAt: Date.now(),
  },
];

interface BookingOptions {
  passengers: number;
  luggage: number;
  accessible: boolean;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightDetails?: string;
  hourlyDuration: number;
}

type ServiceType = "point_to_point" | "hourly";
type BookingStep = "trip" | "vehicle" | "review";
import { isValidConvex } from "@/lib/convex/provider";

export default function BookingClient() {
  if (!isValidConvex) {
    return <BookingClientUI dbCarTypes={null} />;
  }
  return <BookingClientConnected />;
}

function BookingClientConnected() {
  const dbCarTypes = useQuery(api.carTypes.list);
  return <BookingClientUI dbCarTypes={dbCarTypes} />;
}

function BookingClientUI({ dbCarTypes }: { dbCarTypes: any }) {
  const searchParams = useSearchParams();

  const activeCarTypes = React.useMemo(() => {
    const list = dbCarTypes?.filter((car: CarType) => car.isActive) || [];
    return list.length > 0 ? list : DEFAULT_CAR_TYPES;
  }, [dbCarTypes]);

  const {
    pickup,
    destination,
    route,
    selectedCar,
    isBooking,
    step,
    setPickup,
    setDestination,
    setRoute,
    setSelectedCar,
    setLoadingRoute,
    setBooking,
    setStep,
  } = useRideStore();

  const [serviceType, setServiceType] = React.useState<ServiceType>("point_to_point");

  const [options, setOptions] = React.useState<BookingOptions>({
    passengers: 1,
    luggage: 1,
    accessible: false,
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "12:00",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    hourlyDuration: 2,
  });

  const [bookingStep, setBookingStep] = React.useState<BookingStep>("trip");
  const [emailError, setEmailError] = React.useState("");
  const [confirmError, setConfirmError] = React.useState("");

  const fetchRoute = async (pickupLoc: SearchResult, destLoc: SearchResult) => {
    setLoadingRoute(true);
    try {
      const routeResult = await calculateRouteBetween(
        { lat: pickupLoc.position.lat, lng: pickupLoc.position.lon },
        { lat: destLoc.position.lat, lng: destLoc.position.lon },
      );
      if (routeResult) {
        setRoute(routeResult);
      } else {
        setRoute(DEFAULT_ROUTE);
      }
    } catch {
      setRoute(DEFAULT_ROUTE);
    } finally {
      setLoadingRoute(false);
    }
  };

  const hasInitializedFromParams = React.useRef(false);

  React.useEffect(() => {
    if (hasInitializedFromParams.current) return;

    const initFromParams = async () => {
      const pParam = searchParams.get("p");
      const dParam = searchParams.get("d");
      const dateParam = searchParams.get("date");
      const timeParam = searchParams.get("time");

      if (!pParam && !dParam && !dateParam && !timeParam) return;

      hasInitializedFromParams.current = true;

      setOptions(prev => ({
        ...prev,
        pickupDate: dateParam || prev.pickupDate,
        pickupTime: timeParam || prev.pickupTime,
      }));

      try {
        let resolvedPickup = null;
        let resolvedDestination = null;

        if (pParam) {
          resolvedPickup = await geocodeAddress(pParam);
          if (resolvedPickup) {
            setPickup(resolvedPickup);
          }
        }

        if (dParam) {
          resolvedDestination = await geocodeAddress(dParam);
          if (resolvedDestination) {
            setDestination(resolvedDestination);
          }
        }

        if (resolvedPickup && resolvedDestination) {
          await fetchRoute(resolvedPickup, resolvedDestination);
        }
      } catch (error) {
        console.error("Initialization from params failed:", error);
      }
    };

    initFromParams();
  }, [searchParams]);

  React.useEffect(() => {
    if (activeCarTypes.length > 0 && !selectedCar) {
      const carParam = searchParams.get("car");
      if (carParam) {
        const match = activeCarTypes.find((c: CarType) => c.name.toLowerCase() === carParam.toLowerCase());
        if (match) {
          setSelectedCar(match);
          return;
        }
      }
      setSelectedCar(activeCarTypes[0]);
    }
  }, [activeCarTypes, selectedCar, setSelectedCar, searchParams]);

  const handlePickupSelect = async (location: SearchResult | null) => {
    setPickup(location);
    if (location && destination) {
      await fetchRoute(location, destination);
    }
  };

  const handleDestinationSelect = async (location: SearchResult | null) => {
    setDestination(location);
    if (pickup && location) {
      await fetchRoute(pickup, location);
    }
  };

  const handleCarSelect = (car: CarType) => {
    setSelectedCar(car);
    if (options.passengers > car.capacity) {
      setOptions(prev => ({ ...prev, passengers: car.capacity }));
    }
  };

  const isTripStepValid = () => {
    if (serviceType === "hourly") {
      return options.pickupDate && options.pickupTime;
    }
    return pickup && destination && options.pickupDate && options.pickupTime;
  };

  const isVehicleStepValid = () => {
    return selectedCar !== null;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isReviewStepValid = () => {
    return options.customerName.trim() !== "" && isEmailValid(options.customerEmail) && options.customerPhone.trim() !== "";
  };

  const goToNextStep = () => {
    if (bookingStep === "trip" && isTripStepValid()) {
      if (serviceType === "point_to_point" && !route) {
        setRoute(DEFAULT_ROUTE);
      }
      setBookingStep("vehicle");
    } else if (bookingStep === "vehicle" && isVehicleStepValid()) {
      setBookingStep("review");
    }
  };

  const goToPreviousStep = () => {
    if (bookingStep === "vehicle") {
      setBookingStep("trip");
    } else if (bookingStep === "review") {
      setBookingStep("vehicle");
    }
  };

  const handleConfirm = async () => {
    if (!selectedCar || !pricing || !isReviewStepValid()) return;
    if (serviceType === "point_to_point" && (!pickup || !destination)) return;

    setConfirmError("");
    setBooking(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: options.customerName,
          customerEmail: options.customerEmail,
          customerPhone: options.customerPhone,
          flightDetails: options.flightDetails || "",
          pickupAddress: pickup?.address.freeformAddress || "Seattle-Tacoma Intl Airport (SEA)",
          destinationAddress: destination?.address.freeformAddress || "Downtown Seattle Waterfront",
          pickupDate: options.pickupDate,
          pickupTime: options.pickupTime || "12:00",
          carTypeName: selectedCar.name,
          price: pricing.totalPrice,
          passengers: options.passengers,
          luggage: options.luggage,
          serviceType,
          hourlyDuration: serviceType === "hourly" ? options.hourlyDuration : undefined,
          distance: currentRoute?.distanceInKm || 18.5,
          duration: currentRoute?.durationInMinutes || 25,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        window.location.href = `/track-booking?id=${encodeURIComponent(data.booking.id)}`;
        return;
      } else {
        setConfirmError(data.error || "Failed to submit reservation.");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setConfirmError("Failed to submit reservation. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const handleReset = () => {
    setPickup(null);
    setDestination(null);
    setRoute(null);
    setSelectedCar(activeCarTypes[0] || null);
    setStep("pickup");
    setBookingStep("trip");
    setServiceType("point_to_point");
    setOptions({
      passengers: 1,
      luggage: 1,
      accessible: false,
      pickupDate: new Date().toISOString().split("T")[0],
      pickupTime: "12:00",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      hourlyDuration: 2,
    });
  };

  const updateOption = (
    key: keyof BookingOptions,
    value: string | number | boolean,
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const adjustPassengers = (delta: number) => {
    const maxPassengers = selectedCar?.capacity || 10;
    setOptions(prev => ({
      ...prev,
      passengers: Math.max(1, Math.min(prev.passengers + delta, maxPassengers)),
    }));
  };

  const adjustLuggage = (delta: number) => {
    setOptions(prev => ({
      ...prev,
      luggage: Math.max(0, Math.min(prev.luggage + delta, 10)),
    }));
  };

  const minimumFare = 0;

  const currentRoute = route || (pickup && destination ? { distanceInKm: 18.5, durationInMinutes: 25, coordinates: [] } : null);

  const pricing = selectedCar
    ? serviceType === "hourly"
      ? calculateHourlyPrice(selectedCar, options.hourlyDuration, 1.0, minimumFare)
      : currentRoute
        ? calculatePrice(selectedCar, currentRoute.distanceInKm, currentRoute.durationInMinutes, 1.0, minimumFare)
        : null
    : null;

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors">
        <main className="max-w-4xl mx-auto py-16 sm:py-24 px-4 sm:px-6 text-center space-y-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/30">
            <CheckCircle className="h-10 w-10 text-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-foreground">
              Reservation <span className="text-gold">Received</span>
            </h2>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
              Your luxury chauffeur request has been dispatched. Our concierge team is reviewing your route.
            </p>
          </div>

          <Card className="max-w-md mx-auto p-6 sm:p-8 border-border shadow-xl bg-card text-left rounded-none space-y-6">
            <h3 className="font-serif font-black italic uppercase text-lg pb-2 border-b border-border text-gold">
              Trip Itinerary
            </h3>
            <div className="space-y-3.5 text-xs">
              {serviceType === "point_to_point" ? (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Pickup</span>
                    <span className="font-bold text-foreground text-right truncate max-w-[200px]">{pickup?.address.freeformAddress || "Seattle-Tacoma Intl Airport (SEA)"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Destination</span>
                    <span className="font-bold text-foreground text-right truncate max-w-[200px]">{destination?.address.freeformAddress || "Downtown Seattle Waterfront"}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Service</span>
                  <span className="font-bold text-foreground text-right">{options.hourlyDuration} Hours Charter</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Date &amp; Time</span>
                <span className="font-bold text-foreground">{options.pickupDate} at {options.pickupTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Vehicle</span>
                <span className="font-bold text-foreground italic">{selectedCar?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Passengers / Bags</span>
                <span className="font-bold text-foreground">{options.passengers} Passengers, {options.luggage} Bags</span>
              </div>
              {pricing && (
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-foreground font-black uppercase text-[10px] tracking-widest">Estimated Fare</span>
                  <span className="text-2xl font-serif font-black italic text-gold">
                    {formatPrice(pricing.totalPrice)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Button onClick={handleReset} className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-10 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-lg">
            Book Another Ride
          </Button>
        </main>
      </div>
    );
  }

  const stepTitles: Record<BookingStep, string> = {
    trip: "1. Trip Itinerary",
    vehicle: "2. Vehicle Selection",
    review: "3. Review & Details",
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full pb-32 lg:pb-12 transition-colors">

      {/* Stepper Header */}
      <div className="bg-secondary/60 py-3.5 border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between md:justify-center gap-2 md:gap-0">
            <Step
              num="1"
              title="Trip Details"
              active={bookingStep === "trip"}
              complete={bookingStep === "vehicle" || bookingStep === "review"}
            />
            <div className="flex-1 h-px bg-border md:mx-6 max-w-[80px]" />
            <Step
              num="2"
              title="Select Fleet"
              active={bookingStep === "vehicle"}
              complete={bookingStep === "review"}
            />
            <div className="flex-1 h-px bg-border md:mx-6 max-w-[80px]" />
            <Step
              num="3"
              title="Review & Details"
              active={bookingStep === "review"}
              complete={false}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-full">
          {/* Main Booking Controls */}
          <div className="lg:col-span-7 order-first min-w-0">
            <div className="flex items-center gap-4 mb-8">
              {bookingStep !== "trip" && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-gold transition-colors bg-card"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black italic uppercase text-foreground border-b-2 border-gold inline-block pb-1">
                {stepTitles[bookingStep]}
              </h2>
            </div>

            {bookingStep === "trip" && (
              <div className="space-y-8 animate-fade-in">
                {/* Service Type Toggle */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceType("point_to_point")}
                      className={`p-4 border text-left transition-all ${
                        serviceType === "point_to_point"
                          ? "bg-card border-gold shadow-sm"
                          : "bg-secondary/50 border-border opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-black italic uppercase text-sm text-foreground">Point-to-Point</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${serviceType === "point_to_point" ? "border-gold" : "border-muted-foreground"}`}>
                          {serviceType === "point_to_point" && <div className="w-2 h-2 rounded-full bg-gold" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">Airport transfers &amp; one-way direct travel</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceType("hourly")}
                      className={`p-4 border text-left transition-all ${
                        serviceType === "hourly"
                          ? "bg-card border-gold shadow-sm"
                          : "bg-secondary/50 border-border opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-black italic uppercase text-sm text-foreground">Hourly Charter</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${serviceType === "hourly" ? "border-gold" : "border-muted-foreground"}`}>
                          {serviceType === "hourly" && <div className="w-2 h-2 rounded-full bg-gold" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">Flexible chauffeur by the hour for events &amp; meetings</p>
                    </button>
                  </div>
                </div>

                {serviceType === "point_to_point" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" /> Pickup Location
                      </label>
                      <LocationInput
                        placeholder="Enter pickup location (e.g. SEA Airport or Hotel)"
                        value={pickup}
                        onChange={handlePickupSelect}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" /> Drop-off Destination
                      </label>
                      <LocationInput
                        placeholder="Enter destination (e.g. Bellevue, Redmond, or Address)"
                        value={destination}
                        onChange={handleDestinationSelect}
                      />
                    </div>
                  </div>
                )}

                {serviceType === "hourly" && (
                  <div className="bg-card border border-border p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gold" />
                      <h3 className="font-serif text-lg font-black italic uppercase text-foreground">Charter Duration</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Select how many hours you require dedicated chauffeur disposal. Minimum 2 hours.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => updateOption("hourlyDuration", Math.max(1, options.hourlyDuration - 1))}
                        className="w-11 h-11 bg-secondary border border-border flex items-center justify-center text-foreground hover:border-gold transition-colors"
                        aria-label="Decrease hours"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-20 h-11 bg-secondary border border-border flex items-center justify-center">
                        <span className="text-base font-bold text-foreground">{options.hourlyDuration} hrs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateOption("hourlyDuration", Math.min(12, options.hourlyDuration + 1))}
                        className="w-11 h-11 bg-secondary border border-border flex items-center justify-center text-foreground hover:border-gold transition-colors"
                        aria-label="Increase hours"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pickup Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={options.pickupDate}
                        onChange={(e) => updateOption("pickupDate", e.target.value)}
                        className="w-full bg-secondary border border-border px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pickup Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={options.pickupTime}
                        onChange={(e) => updateOption("pickupTime", e.target.value)}
                        className="w-full bg-secondary border border-border px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex justify-end pt-4">
                  <Button
                    onClick={goToNextStep}
                    disabled={!isTripStepValid()}
                    className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <span>Choose Vehicle</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === "vehicle" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-3">
                  {activeCarTypes.map((car: CarType) => {
                    const isSelected = selectedCar?.name === car.name;
                    return (
                      <button
                        key={car.name}
                        type="button"
                        onClick={() => handleCarSelect(car)}
                        className={`w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-5 transition-all border text-left cursor-pointer ${
                          isSelected 
                            ? "bg-card border-gold border-l-4 shadow-md" 
                            : "bg-secondary/40 border-border opacity-80 hover:opacity-100 hover:border-gold/40"
                        }`}
                      >
                        <div className="w-20 sm:w-28 h-16 sm:h-20 bg-secondary flex items-center justify-center flex-shrink-0 border border-border/50 relative overflow-hidden">
                          <Image
                            src={car.image || "/fleet_black_bg.png"}
                            alt={car.name}
                            fill
                            sizes="120px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base sm:text-lg font-black italic uppercase text-foreground truncate">
                              {car.name}
                            </h4>
                            {isSelected && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-gold/15 text-gold border border-gold/30">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 mt-0.5">
                            {car.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-gold" /> {car.capacity} Passengers
                            </span>
                            <span className="flex items-center gap-1">
                              <Luggage className="h-3 w-3 text-gold" /> {car.capacity} Luggage
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">From</p>
                          <p className="font-serif text-lg sm:text-2xl font-black italic text-gold">
                            {formatPrice(serviceType === "hourly" ? (car.hourlyRate || car.baseFare * 4) : car.baseFare)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCar && (
                  <div className="bg-card border border-border p-6 space-y-4 shadow-sm">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Passenger &amp; Luggage Count
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Passengers */}
                      <div className="bg-secondary/50 border border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-gold" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Passengers</p>
                            <p className="text-[9px] text-muted-foreground">Max {selectedCar.capacity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjustPassengers(-1)}
                            disabled={options.passengers <= 1}
                            className="w-9 h-9 bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30"
                            aria-label="Decrease passengers"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <div className="w-10 h-9 bg-card border border-border flex items-center justify-center font-bold text-sm text-foreground">
                            {options.passengers}
                          </div>
                          <button
                            type="button"
                            onClick={() => adjustPassengers(1)}
                            disabled={options.passengers >= selectedCar.capacity}
                            className="w-9 h-9 bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30"
                            aria-label="Increase passengers"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Luggage */}
                      <div className="bg-secondary/50 border border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Luggage className="h-5 w-5 text-gold" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Luggage</p>
                            <p className="text-[9px] text-muted-foreground">Standard bags</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjustLuggage(-1)}
                            disabled={options.luggage <= 0}
                            className="w-9 h-9 bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30"
                            aria-label="Decrease luggage"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <div className="w-10 h-9 bg-card border border-border flex items-center justify-center font-bold text-sm text-foreground">
                            {options.luggage}
                          </div>
                          <button
                            type="button"
                            onClick={() => adjustLuggage(1)}
                            disabled={options.luggage >= 10}
                            className="w-9 h-9 bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30"
                            aria-label="Increase luggage"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    onClick={goToPreviousStep}
                    variant="outline"
                    className="border-border text-foreground rounded-none py-6 px-6 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    disabled={!isVehicleStepValid()}
                    className="hidden lg:flex bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>Review &amp; Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === "review" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-5 bg-card border border-border p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground border-b border-border pb-2">
                    Primary Passenger Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gold" /> Full Name *
                      </label>
                      <input
                        value={options.customerName}
                        onChange={(e) => updateOption("customerName", e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full bg-secondary border border-border px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gold" /> Email Address *
                        </label>
                        <input
                          type="email"
                          value={options.customerEmail}
                          onChange={(e) => { setEmailError(""); updateOption("customerEmail", e.target.value); }}
                          onBlur={() => validateEmail(options.customerEmail)}
                          placeholder="client@executive.com"
                          className={`w-full bg-secondary border px-4 py-3.5 text-sm font-bold text-foreground outline-none transition-colors ${emailError ? "border-red-500" : "border-border focus:border-gold"}`}
                        />
                        {emailError && <p className="text-[10px] font-bold text-red-500">{emailError}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gold" /> Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={options.customerPhone}
                          onChange={(e) => updateOption("customerPhone", e.target.value)}
                          placeholder="(206) 555-0199"
                          className="w-full bg-secondary border border-border px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-gold" /> Flight Number / Notes (Optional)
                      </label>
                      <input
                        value={options.flightDetails || ""}
                        onChange={(e) => updateOption("flightDetails", e.target.value)}
                        placeholder="e.g. DL 1482 - Terminal B Sea-Tac"
                        className="w-full bg-secondary border border-border px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    onClick={goToPreviousStep}
                    variant="outline"
                    className="border-border text-foreground rounded-none py-6 px-6 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Fleet
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Summary Sidebar */}
          <div className="lg:col-span-5 order-last min-w-0">
            <div className="lg:sticky lg:top-24 self-start max-w-full">
              <Card className="rounded-none shadow-xl border border-border overflow-hidden bg-card">
                <div className="bg-secondary py-3.5 px-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-foreground font-black uppercase tracking-[0.25em] text-xs">
                    Reservation Summary
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gold">
                    Luna Executive
                  </span>
                </div>

                <div className="p-0">
                  {serviceType === "point_to_point" && (
                    <div className="w-full h-[180px] sm:h-[220px] border-b border-border relative overflow-hidden bg-secondary">
                      <MapComponent
                        pickup={pickup ? { lat: pickup.position.lat, lng: pickup.position.lon } : null}
                        destination={destination ? { lat: destination.position.lat, lng: destination.position.lon } : null}
                        routeCoordinates={route?.coordinates}
                      />
                      {!route && !pickup && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white text-center">
                            Enter route locations for map preview
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 space-y-6">
                    <div className="space-y-3.5 text-xs">
                      {serviceType === "point_to_point" ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pickup</p>
                              <p className="font-bold text-foreground">{pickup?.address.freeformAddress || "Seattle-Tacoma Intl Airport (SEA)"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Destination</p>
                              <p className="font-bold text-foreground">{destination?.address.freeformAddress || "Downtown Seattle Waterfront"}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-gold shrink-0" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Service Mode</p>
                            <p className="font-bold text-foreground">{options.hourlyDuration} Hours Dedicated Charter</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2.5">
                        <Calendar className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Schedule</p>
                          <p className="font-bold text-foreground">{options.pickupDate} at {options.pickupTime}</p>
                        </div>
                      </div>

                      {selectedCar && (
                        <div className="flex items-start gap-2.5">
                          <Car className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Vehicle Class</p>
                            <p className="font-bold text-foreground italic">{selectedCar.name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Calculation Box */}
                    <div className="p-4 bg-secondary border border-border text-center space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                        Estimated Total Fare
                      </p>
                      <p className="font-serif font-black italic text-3xl sm:text-4xl text-gold">
                        {pricing ? formatPrice(pricing.totalPrice) : "---"}
                      </p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        All-inclusive Seattle transit rate
                      </p>
                    </div>

                    {/* Action in Sidebar (Desktop) */}
                    <div className="hidden lg:block space-y-3">
                      {confirmError && (
                        <p className="text-[10px] font-bold text-destructive text-center uppercase tracking-wider">{confirmError}</p>
                      )}

                      {bookingStep === "review" ? (
                        <Button
                          onClick={handleConfirm}
                          disabled={!isReviewStepValid() || isBooking}
                          className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-7 text-xs font-black uppercase tracking-[0.25em] shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {isBooking ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Transmitting...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Confirm Reservation
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={goToNextStep}
                          disabled={bookingStep === "trip" ? !isTripStepValid() : !isVehicleStepValid()}
                          className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-7 text-xs font-black uppercase tracking-[0.25em] shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          <span>{bookingStep === "trip" ? "Continue to Fleet" : "Continue to Details"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-card/95 border-t border-border px-4 py-3 z-40 backdrop-blur-md shadow-2xl">
        {confirmError && bookingStep === "review" && (
          <div className="mb-2 bg-destructive/20 border border-destructive px-3 py-1 text-center">
            <p className="text-[10px] font-bold text-destructive uppercase">{confirmError}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="font-serif font-black italic text-lg text-gold leading-tight">
              {pricing ? formatPrice(pricing.totalPrice) : "---"}
            </p>
          </div>
          <div className="flex-1 max-w-[65%]">
            {bookingStep === "review" ? (
              <Button
                onClick={handleConfirm}
                disabled={!isReviewStepValid() || isBooking}
                className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50"
              >
                {isBooking ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Confirm Ride"}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={bookingStep === "trip" ? !isTripStepValid() : !isVehicleStepValid()}
                className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{bookingStep === "trip" ? "Select Fleet" : "Review"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, active, complete }: { num: string; title: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-2 md:gap-2.5 transition-all ${active ? "opacity-100" : "opacity-50"}`}>
      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black italic text-[10px] md:text-xs border-2 ${
        active || complete 
          ? "bg-gold border-gold text-primary-foreground" 
          : "border-border text-muted-foreground"
      }`}>
        {complete ? <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" /> : num}
      </div>
      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:block ${
        active || complete ? "text-foreground" : "text-muted-foreground"
      }`}>
        {title}
      </span>
    </div>
  );
}
