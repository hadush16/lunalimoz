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
  Star,
  Calendar,
  Luggage,
  Accessibility,
  Plus,
  Minus,
  ChevronRight,
  Info,
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { LocationInput } from "@/components/booking/location-input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/map/map-wrapper";
import { useRideStore } from "@/lib/store/rideStore";
import { createCheckoutSession } from "@/lib/convex/api";
import { calculateRouteBetween } from "@/lib/tomtom/routing";
import { formatDuration, formatDistance } from "@/lib/utils";
import { formatPrice, calculatePrice, calculateHourlyPrice } from "@/lib/pricing";
import type { CarType } from "@/lib/pricing";
import { useSearchParams } from "next/navigation";
import { geocodeAddress } from "@/lib/tomtom/search";
import type { SearchResult } from "@/lib/tomtom/search";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


interface BookingOptions {
  passengers: number;
  luggage: number;
  accessible: boolean;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hourlyDuration: number;
}

type ServiceType = "point_to_point" | "hourly";
type BookingStep = "trip" | "vehicle" | "review";

export default function BookingClient() {
  const searchParams = useSearchParams();
  const dbCarTypes = useQuery(api.carTypes.list);

  const activeCarTypes = React.useMemo(() => {
    return dbCarTypes?.filter((car: CarType) => car.isActive) || [];
  }, [dbCarTypes]);

  const {
    pickup,
    destination,
    route,
    selectedCar,
    isLoadingRoute,
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
    pickupTime: "",
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
    const routeResult = await calculateRouteBetween(
      { lat: pickupLoc.position.lat, lng: pickupLoc.position.lon },
      { lat: destLoc.position.lat, lng: destLoc.position.lon },
    );
    setRoute(routeResult);
    setLoadingRoute(false);
    return routeResult;
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
      setSelectedCar(activeCarTypes[0]);
    }
  }, [activeCarTypes, selectedCar, setSelectedCar]);

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
    return pickup && destination && route && options.pickupDate && options.pickupTime;
  };

  const isVehicleStepValid = () => {
    return selectedCar;
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
    return options.customerName.trim() && isEmailValid(options.customerEmail) && options.customerPhone.trim();
  };

  const goToNextStep = () => {
    if (bookingStep === "trip" && isTripStepValid()) {
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
    if (serviceType === "point_to_point" && (!pickup || !destination || !route)) return;

    setConfirmError("");
    setBooking(true);

    try {
      const { url } = await createCheckoutSession({
        pickupAddress: pickup?.address.freeformAddress || "Hourly Service",
        destinationAddress: destination?.address.freeformAddress || "To Be Determined",
        pickupLat: pickup?.position.lat || 0,
        pickupLng: pickup?.position.lon || 0,
        destLat: destination?.position.lat || 0,
        destLng: destination?.position.lon || 0,
        distance: route?.distanceInKm || 0,
        duration: route?.durationInMinutes || 0,
        carTypeName: selectedCar.name,
        carTypeMultiplier: selectedCar.multiplier,
        price: pricing.totalPrice,
        passengers: options.passengers,
        luggage: options.luggage,
        accessible: options.accessible,
        serviceType,
        hourlyDuration: serviceType === "hourly" ? options.hourlyDuration : undefined,
        pickupDate: options.pickupDate,
        pickupTime: options.pickupTime || undefined,
        customerName: options.customerName,
        customerEmail: options.customerEmail,
        customerPhone: options.customerPhone,
      });

      if (url) {
        window.location.href = url;
      } else {
        setConfirmError("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setConfirmError(message);
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
      pickupTime: "",
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

  const dbSettings = useQuery(api.settings.get);
  const minimumFare = dbSettings?.minimumFare || 0;

  const pricing = selectedCar
    ? serviceType === "hourly"
      ? calculateHourlyPrice(selectedCar, options.hourlyDuration, 1.0, minimumFare)
      : route
        ? calculatePrice(selectedCar, route.distanceInKm, route.durationInMinutes, 1.0, minimumFare)
        : null
    : null;

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
        <main className="max-w-4xl mx-auto py-20 px-4 sm:px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8 border border-gold/20">
            <CheckCircle className="h-12 w-12 text-gold" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-black italic uppercase mb-4 text-white">
            Booking <span className="text-gold">Confirmed</span>
          </h2>
          <p className="text-neutral-400 mb-12 font-bold uppercase tracking-widest text-xs">
            Your luxury ride has been reserved. Our concierge will contact you shortly.
          </p>

          <Card className="max-w-md mx-auto p-8 mb-12 border-neutral-800 shadow-2xl bg-neutral-900 text-left rounded-none">
            <h3 className="font-serif font-black italic uppercase text-xl mb-6 pb-2 border-b border-neutral-800 text-gold">Booking Summary</h3>
            <div className="space-y-4">
              {serviceType === "point_to_point" ? (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Pickup</span>
                    <span className="text-sm font-bold text-right truncate max-w-[200px]">{pickup?.address.freeformAddress}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Destination</span>
                    <span className="text-sm font-bold text-right truncate max-w-[200px]">{destination?.address.freeformAddress}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Service</span>
                  <span className="text-sm font-bold text-right">{options.hourlyDuration} Hours</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Vehicle</span>
                <span className="text-sm font-bold italic">{selectedCar?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Passengers</span>
                <span className="text-sm font-bold">{options.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Luggage</span>
                <span className="text-sm font-bold">{options.luggage}</span>
              </div>
              {pricing && (
                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-neutral-900 font-black uppercase text-[11px] tracking-widest">Total Paid</span>
                  <span className="text-2xl font-serif font-black italic text-gold">
                    {formatPrice(pricing.totalPrice)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Button onClick={handleReset} className="bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-lg">
            Book Another Ride
          </Button>
        </main>
      </div>
    );
  }

  const stepTitles: Record<BookingStep, string> = {
    trip: "Trip Details",
    vehicle: "Select Vehicle",
    review: "Review & Confirm",
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full pb-28 lg:pb-0">

      <div className="bg-[#111111] py-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between md:justify-center gap-2 md:gap-0">
            <Step
              num="1"
              title="Trip"
              active={bookingStep === "trip"}
              complete={bookingStep === "vehicle" || bookingStep === "review"}
            />
            <div className="flex-1 h-px bg-white/5 md:mx-4" />
            <Step
              num="2"
              title="Vehicle"
              active={bookingStep === "vehicle"}
              complete={bookingStep === "review"}
            />
            <div className="flex-1 h-px bg-white/5 md:mx-4" />
            <Step
              num="3"
              title="Review"
              active={bookingStep === "review"}
              complete={false}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-full">
          <div className="lg:col-span-7 order-first min-w-0">
            <div className="flex items-center gap-4 mb-8">
              {bookingStep !== "trip" && (
                <button
                  onClick={goToPreviousStep}
                  className="w-10 h-10 flex items-center justify-center border border-neutral-700 hover:border-gold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-neutral-400" />
                </button>
              )}
              <h2 className="text-2xl sm:text-3xl font-serif font-black italic uppercase text-white border-b-2 border-gold inline-block pb-1">
                {stepTitles[bookingStep]}
              </h2>
            </div>

            {bookingStep === "trip" && (
              <div className="space-y-10 animate-fade-in">
                {serviceType === "point_to_point" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Pickup Location</label>
                      <LocationInput
                        placeholder="Enter pickup location (e.g. SEA Airport)"
                        value={pickup}
                        onChange={handlePickupSelect}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Drop-off Location</label>
                      <LocationInput
                        placeholder="Enter destination (e.g. Hotel or Address)"
                        value={destination}
                        onChange={handleDestinationSelect}
                      />
                    </div>
                  </>
                )}

                {serviceType === "hourly" && (
                  <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gold" />
                      <h3 className="font-serif text-lg font-black italic uppercase text-white">Hourly Service</h3>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                      Reserve a vehicle and chauffeur by the hour. Perfect for events, meetings, or flexible itineraries.
                    </p>
                    <div className="flex items-center gap-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Duration</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateOption("hourlyDuration", Math.max(1, options.hourlyDuration - 1))}
                          className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="w-16 h-10 bg-black border border-neutral-800 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{options.hourlyDuration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateOption("hourlyDuration", Math.min(12, options.hourlyDuration + 1))}
                          className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest ml-2">HOURS</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={options.pickupDate}
                        onChange={(e) => updateOption("pickupDate", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-4 rounded-none text-sm font-bold text-white outline-none focus:border-gold transition-colors appearance-none"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={options.pickupTime}
                        onChange={(e) => updateOption("pickupTime", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-4 rounded-none text-sm font-bold text-white outline-none focus:border-gold transition-colors"
                      />
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Service Type</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setServiceType("point_to_point")}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${serviceType === "point_to_point" ? "border-gold bg-gold/10" : "border-neutral-800 bg-neutral-900"}`}>
                        {serviceType === "point_to_point" && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-tight ${serviceType === "point_to_point" ? "text-gold" : "text-neutral-400"}`}>Point-to-Point</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setServiceType("hourly")}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${serviceType === "hourly" ? "border-gold bg-gold/10" : "border-neutral-800 bg-neutral-900"}`}>
                        {serviceType === "hourly" && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-tight ${serviceType === "hourly" ? "text-gold" : "text-neutral-400"}`}>Hourly Service</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex justify-end pt-4">
                  <Button
                    onClick={goToNextStep}
                    disabled={!isTripStepValid()}
                    className="font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
                  >
                    Continue to Vehicle Selection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === "vehicle" && (
              <div className="space-y-10 animate-fade-in">
                <div className="space-y-2 sm:space-y-4">
                  {activeCarTypes.length === 0 ? (
                    <div className="py-20 text-center border border-neutral-800 bg-neutral-900/30">
                      <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Retrieving Elite Fleet...</p>
                    </div>
                  ) : (
                    activeCarTypes.map((car) => (
                      <button
                        key={car.name}
                        onClick={() => handleCarSelect(car)}
                        className={`w-full flex items-center gap-3 sm:gap-6 p-3 sm:p-5 transition-all border border-neutral-800 hover:bg-neutral-900/50 ${selectedCar?.name === car.name ? "bg-neutral-900 border-l-4 border-l-gold border-neutral-700" : "opacity-60"
                          }`}
                      >
                        <div className="hidden sm:flex w-28 h-20 bg-neutral-800/50 items-center justify-center flex-shrink-0 border border-neutral-800 relative overflow-hidden group">
                          <Image
                            src={car.image || "/fleet_black_bg.png"}
                            alt={car.name}
                            fill
                            className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <Car className="h-8 w-8 text-white relative z-10 opacity-80" />
                        </div>
                        <div className="flex sm:hidden w-10 h-10 bg-neutral-800/60 items-center justify-center flex-shrink-0 border border-neutral-800">
                          <Car className="h-5 w-5 text-gold" />
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-serif text-sm sm:text-lg text-white truncate">{car.name}</h4>
                          <p className="hidden sm:block text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mt-0.5 whitespace-normal line-clamp-1">{car.description}</p>
                          <div className="flex items-center gap-3 sm:gap-6 mt-1 sm:mt-2">
                            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              <Users className="h-3 w-3 text-gold inline mr-1" />{car.capacity}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              <Luggage className="h-3 w-3 text-gold inline mr-1" />{car.capacity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="hidden sm:block text-[9px] font-semibold uppercase tracking-widest text-neutral-500 mb-1">From</p>
                          <p className="font-serif text-lg sm:text-2xl text-gold">{formatPrice(serviceType === "hourly" ? (car.hourlyRate || car.baseFare * 4) : car.baseFare)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {selectedCar && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Passengers & Luggage</label>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-neutral-900/50 border border-neutral-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-gold" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Passengers</p>
                            <p className="text-xs text-neutral-400">Max {selectedCar.capacity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjustPassengers(-1)}
                            disabled={options.passengers <= 1}
                            className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-10 h-8 bg-black border border-neutral-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{options.passengers}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => adjustPassengers(1)}
                            disabled={options.passengers >= selectedCar.capacity}
                            className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-neutral-900/50 border border-neutral-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Luggage className="h-5 w-5 text-gold" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Luggage</p>
                            <p className="text-xs text-neutral-400">Max 10</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjustLuggage(-1)}
                            disabled={options.luggage <= 0}
                            className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-10 h-8 bg-black border border-neutral-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{options.luggage}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => adjustLuggage(1)}
                            disabled={options.luggage >= 10}
                            className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
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
                    className="font-sans border-neutral-700 hover:border-gold text-white rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] transition-all"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Trip
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    disabled={!isVehicleStepValid()}
                    className="hidden lg:flex font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
                  >
                    Continue to Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === "review" && (
              <div className="space-y-10 animate-fade-in">
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-black italic uppercase text-white border-b border-neutral-800 pb-2">Passenger Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <User className="h-3 w-3" /> Full Name
                      </label>
                      <input
                        value={options.customerName}
                        onChange={(e) => updateOption("customerName", e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-4 rounded-none text-sm font-bold text-white outline-none focus:border-gold transition-colors placeholder:text-neutral-700 font-sans"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email Address
                        </label>
                        <input
                          type="email"
                          value={options.customerEmail}
                          onChange={(e) => { setEmailError(""); updateOption("customerEmail", e.target.value); }}
                          onBlur={() => validateEmail(options.customerEmail)}
                          placeholder="email@example.com"
                          className={`w-full bg-neutral-900 border px-4 py-4 rounded-none text-sm font-bold text-white outline-none transition-colors placeholder:text-neutral-700 font-sans ${emailError ? "border-red-500 focus:border-red-500" : "border-neutral-800 focus:border-gold"}`}
                        />
                        {emailError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{emailError}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                          <Phone className="h-3 w-3" /> Phone Number
                        </label>
                        <input
                          type="tel"
                          value={options.customerPhone}
                          onChange={(e) => updateOption("customerPhone", e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full bg-neutral-900 border border-neutral-800 px-4 py-4 rounded-none text-sm font-bold text-white outline-none focus:border-gold transition-colors placeholder:text-neutral-700 font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-5">
                  <h3 className="font-serif text-lg font-black italic uppercase text-gold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Trip Information
                  </h3>
                  {serviceType === "point_to_point" ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Pickup</span>
                        <span className="text-sm font-bold text-right">{pickup?.address.freeformAddress}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Destination</span>
                        <span className="text-sm font-bold text-right">{destination?.address.freeformAddress}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Service</span>
                      <span className="text-sm font-bold text-right">{options.hourlyDuration} Hours Charter</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Date & Time</span>
                    <span className="text-sm font-bold text-right">{options.pickupDate} at {options.pickupTime || "TBD"}</span>
                  </div>
                  {route && (
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Est. Duration</span>
                      <span className="text-sm font-bold text-right">{formatDuration(route.durationInMinutes)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-5">
                  <h3 className="font-serif text-lg font-black italic uppercase text-gold flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle
                  </h3>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Class</span>
                    <span className="text-sm font-bold italic text-right">{selectedCar?.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Passengers</span>
                    <span className="text-sm font-bold text-right">{options.passengers}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Luggage</span>
                    <span className="text-sm font-bold text-right">{options.luggage}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    onClick={goToPreviousStep}
                    variant="outline"
                    className="font-sans border-neutral-700 hover:border-gold text-white rounded-none py-6 px-8 text-xs font-black uppercase tracking-[0.2em] transition-all"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Vehicle
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 order-last lg:order-last min-w-0">
            <div className="lg:sticky lg:top-28 self-start max-w-full">
              <Card className="rounded-none shadow-2xl border border-neutral-800 overflow-hidden bg-neutral-900 max-w-full">
                <div className="bg-black py-4 px-6 border-b border-neutral-800">
                  <h3 className="text-white font-black uppercase tracking-[0.3em] text-[12px] text-center">Trip Summary</h3>
                </div>

                <div className="p-0 overflow-hidden">
                  {serviceType === "point_to_point" && bookingStep !== "review" && (
                    <div className="w-full h-[200px] sm:h-[300px] border-b border-neutral-800 grayscale hover:grayscale-0 transition-all duration-700 relative overflow-hidden">
                      <MapComponent
                        pickup={pickup ? { lat: pickup.position.lat, lng: pickup.position.lon } : null}
                        destination={destination ? { lat: destination.position.lat, lng: destination.position.lon } : null}
                        routeCoordinates={route?.coordinates}
                      />
                      {!route && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-white/60 text-center">Enter Locations to View Route</p>
                        </div>
                      )}
                    </div>
                  )}

                  {serviceType === "hourly" && bookingStep !== "review" && (
                    <div className="h-[200px] sm:h-[300px] border-b border-neutral-800 flex items-center justify-center bg-neutral-900">
                      <div className="text-center space-y-4">
                        <Clock className="h-12 w-12 text-gold/40 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Hourly Charter</p>
                        <p className="font-serif font-black italic text-3xl text-white">{options.hourlyDuration} Hours</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                    {bookingStep === "review" && (
                      <div className="space-y-4 border-b border-neutral-800 pb-6">
                        {serviceType === "point_to_point" && pickup && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Pickup</p>
                              <p className="text-sm font-bold">{pickup.address.freeformAddress}</p>
                            </div>
                          </div>
                        )}
                        {serviceType === "point_to_point" && destination && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Destination</p>
                              <p className="text-sm font-bold">{destination.address.freeformAddress}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Date & Time</p>
                            <p className="text-sm font-bold">{options.pickupDate} at {options.pickupTime || "TBD"}</p>
                          </div>
                        </div>
                        {selectedCar && (
                          <div className="flex items-start gap-3">
                            <Car className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Vehicle</p>
                              <p className="text-sm font-bold italic">{selectedCar.name}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Users className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Passengers / Luggage</p>
                            <p className="text-sm font-bold">{options.passengers} / {options.luggage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {serviceType === "point_to_point" && route && bookingStep !== "review" && (
                      <div className="flex justify-between items-center bg-black p-4 border-l-2 border-gold outline outline-1 outline-neutral-800">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Distance</p>
                          <p className="text-sm font-black italic">{formatDistance(route.distanceInKm)}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Duration</p>
                          <p className="text-sm font-black italic">{formatDuration(route.durationInMinutes)}</p>
                        </div>
                      </div>
                    )}

                    {bookingStep !== "review" && (
                      <div className="bg-black p-4 border-l-2 border-gold outline outline-1 outline-neutral-800">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Passengers</p>
                            <p className="text-sm font-black italic">{options.passengers}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Luggage</p>
                            <p className="text-sm font-black italic">{options.luggage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {pricing ? (
                      <div className="text-center space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Estimated Total:</p>
                        <p className="font-serif font-black italic text-4xl sm:text-5xl lg:text-6xl text-gold">
                          {formatPrice(pricing.totalPrice)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-[#111111] px-6 border border-neutral-800">
                        <Info className="h-6 w-6 text-gold/40 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 leading-relaxed max-w-[200px] mx-auto">
                          {serviceType === "point_to_point"
                            ? "Enter trip details to see pricing guide"
                            : "Select a vehicle to see hourly pricing"}
                        </p>
                      </div>
                    )}

                    {bookingStep === "review" && (
                      <div className="space-y-4 hidden lg:block">
                        {confirmError && (
                          <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-wider">{confirmError}</p>
                        )}
                        <Button
                          onClick={handleConfirm}
                          disabled={!isReviewStepValid() || isBooking}
                          className="w-full font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-8 text-xs font-black uppercase tracking-[0.3em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
                        >
                          {isBooking ? (
                            <>
                              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Confirm & Pay
                            </>
                          )}
                        </Button>
                        <p className="text-[9px] font-bold text-neutral-500 text-center uppercase tracking-widest leading-relaxed">
                          By confirming, you agree to our <Link href="#" className="text-gold underline decoration-gold/30">Terms</Link> and <Link href="#" className="text-gold underline decoration-gold/30">Policy</Link>.
                        </p>
                      </div>
                    )}

                    {bookingStep !== "review" && (
                      <div className="space-y-4 hidden lg:block">
                        <Button
                          onClick={goToNextStep}
                          disabled={bookingStep === "trip" ? !isTripStepValid() : !isVehicleStepValid()}
                          className="w-full font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-8 text-xs font-black uppercase tracking-[0.3em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
                        >
                          {bookingStep === "trip" ? "Select Vehicle" : "Review Booking"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-neutral-800 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {confirmError && bookingStep === "review" && (
          <div className="absolute bottom-full left-0 right-0 bg-red-950/90 border-t border-red-900 px-4 py-2 text-center backdrop-blur-md">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{confirmError}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
              {bookingStep === "trip" ? "Est. Total" : "Total"}
            </p>
            <p className="font-serif font-black italic text-xl text-gold truncate leading-none mt-1">
              {pricing ? formatPrice(pricing.totalPrice) : "---"}
            </p>
          </div>
          <div className="flex-shrink-0 w-[60%] sm:w-[50%]">
            {bookingStep === "review" ? (
              <Button
                onClick={handleConfirm}
                disabled={!isReviewStepValid() || isBooking}
                className="w-full font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-6 sm:py-7 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
              >
                {isBooking ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  <>
                    <ShieldCheck className="mr-1.5 sm:mr-2 h-4 w-4" />
                    <span className="truncate">Confirm & Pay</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={bookingStep === "trip" ? !isTripStepValid() : !isVehicleStepValid()}
                className="w-full font-sans bg-gold hover:bg-gold-dark text-white rounded-none py-6 sm:py-7 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:bg-neutral-800 disabled:text-neutral-500 transition-all active:translate-y-1"
              >
                <span className="truncate">{bookingStep === "trip" ? "Select Vehicle" : "Review"}</span>
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 flex-shrink-0" />
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
    <div className={`flex items-center gap-2 md:gap-3 transition-all ${active ? "opacity-100" : "opacity-40"}`}>
      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black italic text-[10px] md:text-sm border-2 ${active || complete ? "bg-gold border-gold text-white" : "border-white/20 text-white"}`}>
        {complete ? <CheckCircle className="h-3 w-3 md:h-4 md:h-4" /> : num}
      </div>
      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:block ${active || complete ? "text-white" : "text-white/40"}`}>
        {title}
      </span>
    </div>
  );
}
