"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
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
  Plane,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
  FileText
} from "lucide-react";
import { LocationInput } from "@/components/booking/location-input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/map/map-wrapper";
import { useRideStore } from "@/lib/store/rideStore";
import { createCheckoutSession } from "@/lib/convex/api";
import { calculateRouteBetween, type RouteResult } from "@/lib/tomtom/routing";
import { formatDuration, formatDistance } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";
import { calculateTripQuote } from "@/lib/pricing/engine";
import { SupportedTripType, VehicleClassKey } from "@/lib/pricing/types";
import { geocodeAddress, type SearchResult } from "@/lib/tomtom/search";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isValidConvex } from "@/lib/convex/provider";

const DEFAULT_ROUTE: RouteResult = {
  distance: 24140, // ~15 miles
  duration: 1500,  // 25 mins
  distanceInKm: 24.14,
  durationInMinutes: 25,
  coordinates: [],
  routeGeoJSON: null,
};

const DEFAULT_CAR_TYPES = [
  {
    _id: "s_class" as any,
    id: "s-class",
    name: "Mercedes-Benz S-Class",
    description: "The benchmark of luxury sedans. Handcrafted leather interior, active noise cancellation, and supreme comfort.",
    image: "/executive_sedan.png",
    baseFare: 35.0,
    perMileRate: 5.5,
    perKmRate: 3.4,
    perMinuteRate: 0.6,
    hourlyRate: 150.0,
    hourlyMin: 2,
    minFare: 100.0,
    multiplier: 1.0,
    capacity: 3,
    luggageCapacity: 3,
    isActive: true,
  },
  {
    _id: "escalade" as any,
    id: "escalade-esv",
    name: "Cadillac Escalade ESV",
    description: "The pinnacle of executive SUV luxury with extended legroom and massive cargo capacity. Ideal for airport transfers.",
    image: "/luxury_suv.png",
    baseFare: 40.0,
    perMileRate: 6.5,
    perKmRate: 4.0,
    perMinuteRate: 0.8,
    hourlyRate: 180.0,
    hourlyMin: 2,
    minFare: 120.0,
    multiplier: 1.2,
    capacity: 6,
    luggageCapacity: 6,
    isActive: true,
  },
  {
    _id: "navigator" as any,
    id: "navigator-l",
    name: "Lincoln Navigator L",
    description: "American prestige with extended wheelbase, premium Revel sound system, and first-class captain chairs.",
    image: "/fleet_black_bg.png",
    baseFare: 40.0,
    perMileRate: 6.5,
    perKmRate: 4.0,
    perMinuteRate: 0.8,
    hourlyRate: 180.0,
    hourlyMin: 2,
    minFare: 120.0,
    multiplier: 1.2,
    capacity: 6,
    luggageCapacity: 6,
    isActive: true,
  },
  {
    _id: "sprinter" as any,
    id: "sprinter",
    name: "Mercedes-Benz Sprinter",
    description: "High-ceiling executive van with custom leather captain chairs and spacious luggage hold for large groups.",
    image: "/executive_van.png",
    baseFare: 65.0,
    perMileRate: 7.5,
    perKmRate: 4.65,
    perMinuteRate: 1.2,
    hourlyRate: 220.0,
    hourlyMin: 3,
    minFare: 180.0,
    multiplier: 1.5,
    capacity: 14,
    luggageCapacity: 14,
    isActive: true,
  },
];

type ServiceType = SupportedTripType;
type BookingWizardStep = 1 | 2 | 3 | 4;

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCarTypes = React.useMemo(() => {
    const list = dbCarTypes?.filter((car: any) => car.isActive) || [];
    return list.length > 0 ? list : DEFAULT_CAR_TYPES;
  }, [dbCarTypes]);

  const {
    pickup,
    destination,
    route,
    selectedCar,
    setPickup,
    setDestination,
    setRoute,
    setSelectedCar,
    setLoadingRoute,
  } = useRideStore();

  const [currentStep, setCurrentStep] = React.useState<BookingWizardStep>(1);
  const [serviceType, setServiceType] = React.useState<ServiceType>("point_to_point");

  // Options & Add-ons state
  const [passengers, setPassengers] = React.useState(1);
  const [luggage, setLuggage] = React.useState(1);
  const [accessible, setAccessible] = React.useState(false);
  const [pickupDate, setPickupDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [pickupTime, setPickupTime] = React.useState("12:00");
  const [hourlyDuration, setHourlyDuration] = React.useState(2);
  const [flightNumber, setFlightNumber] = React.useState("");
  const [specialInstructions, setSpecialInstructions] = React.useState("");
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);
  const [discountCodeInput, setDiscountCodeInput] = React.useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = React.useState("");

  // Customer Contact & Policy Acceptance
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [policyAccepted, setPolicyAccepted] = React.useState(false);
  const [showPolicyModal, setShowPolicyModal] = React.useState(false);

  // Status & Error states
  const [isRedirectingToStripe, setIsRedirectingToStripe] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const availableOptionalServices = useQuery(api.pricing.getAvailableServices) || [
    { id: "meet_greet", name: "Airport Meet & Greet with Signage", price: 35.0 },
    { id: "child_seat", name: "Child Safety Car Seat", price: 25.0 },
    { id: "extra_stop", name: "Additional Intermediate Stop", price: 30.0 },
    { id: "champagne", name: "Chilled Champagne & Refreshment Package", price: 75.0 },
    { id: "luggage_assist", name: "Executive White-Glove Luggage Concierge", price: 20.0 },
  ];

  const activePolicy = useQuery(api.policies.getActivePolicy);

  // Set default selected car
  React.useEffect(() => {
    if (!selectedCar && activeCarTypes.length > 0) {
      setSelectedCar(activeCarTypes[0]);
    }
  }, [selectedCar, activeCarTypes, setSelectedCar]);

  const getVehicleKey = React.useCallback((car: any): VehicleClassKey => {
    const name = (car?.id || car?.name || "").toLowerCase();
    if (name.includes("escalade")) return "escalade-esv";
    if (name.includes("navigator")) return "navigator-l";
    if (name.includes("sprinter")) return "sprinter";
    return "s-class";
  }, []);

  const distanceKm = route?.distanceInKm || 24.14;
  const distanceMiles = Math.round(distanceKm * 0.621371 * 10) / 10;
  const durationMinutes = route?.durationInMinutes || 25;

  const isAirportPickup = (pickup?.address?.freeformAddress || "").toLowerCase().includes("sea") || (pickup?.address?.freeformAddress || "").toLowerCase().includes("airport") || serviceType === "airport";
  const isAirportDropoff = (destination?.address?.freeformAddress || "").toLowerCase().includes("sea") || (destination?.address?.freeformAddress || "").toLowerCase().includes("airport");

  // Local fallback engine computation (runs immediately and synchronously)
  const localQuote = React.useMemo(() => {
    const vehicleKey = getVehicleKey(selectedCar);
    return calculateTripQuote({
      vehicle_class: vehicleKey,
      trip_type: serviceType,
      distance_miles: distanceMiles,
      duration_minutes: durationMinutes,
      hourly_hours: serviceType === "hourly" ? hourlyDuration : undefined,
      pickup_datetime: `${pickupDate}T${pickupTime}:00`,
      pickup_address: pickup?.address?.freeformAddress,
      dropoff_address: destination?.address?.freeformAddress,
      is_airport_pickup: isAirportPickup,
      is_airport_dropoff: isAirportDropoff,
      meet_and_greet: selectedServiceIds.includes("meet_greet"),
      child_seats: selectedServiceIds.includes("child_seat") ? 1 : 0,
      extra_stops: selectedServiceIds.includes("extra_stop") ? 1 : 0,
      discount_code: appliedDiscountCode || undefined,
    });
  }, [
    getVehicleKey,
    selectedCar,
    serviceType,
    distanceMiles,
    durationMinutes,
    hourlyDuration,
    pickupDate,
    pickupTime,
    pickup,
    destination,
    isAirportPickup,
    isAirportDropoff,
    selectedServiceIds,
    appliedDiscountCode,
  ]);

  // Server quote query: updates live when route, vehicle, date, time, services, or discount change
  const serverQuote = useQuery(api.pricing.calculateQuote, {
    carTypeName: selectedCar?.name || "Mercedes-Benz S-Class",
    distanceKm,
    durationMinutes,
    serviceType,
    hourlyDuration,
    pickupDate,
    pickupTime,
    pickupAddress: pickup?.address?.freeformAddress,
    destinationAddress: destination?.address?.freeformAddress,
    selectedServiceIds,
    discountCode: appliedDiscountCode || undefined,
  });

  const effectiveFinalAmount = serverQuote?.finalAmount || (localQuote.total_cents / 100);

  // Fetch route when locations change
  const fetchRoute = async (pickupLoc: SearchResult, destLoc: SearchResult) => {
    setLoadingRoute(true);
    try {
      const routeResult = await calculateRouteBetween(
        { lat: pickupLoc.position.lat, lng: pickupLoc.position.lon },
        { lat: destLoc.position.lat, lng: destLoc.position.lon }
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

  // URL param pre-fill on mount
  const hasInitializedFromParams = React.useRef(false);
  React.useEffect(() => {
    if (hasInitializedFromParams.current) return;
    const pParam = searchParams.get("p");
    const dParam = searchParams.get("d");
    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time");
    const typeParam = searchParams.get("type");

    if (!pParam && !dParam && !dateParam && !timeParam && !typeParam) return;
    hasInitializedFromParams.current = true;

    if (dateParam) setPickupDate(dateParam);
    if (timeParam) setPickupTime(timeParam);
    if (typeParam && ["point_to_point", "round_trip", "hourly", "airport"].includes(typeParam)) {
      setServiceType(typeParam as ServiceType);
    }

    const initFromParams = async () => {
      try {
        let resolvedPickup = null;
        let resolvedDestination = null;
        if (pParam) {
          resolvedPickup = await geocodeAddress(pParam);
          if (resolvedPickup) setPickup(resolvedPickup);
        }
        if (dParam) {
          resolvedDestination = await geocodeAddress(dParam);
          if (resolvedDestination) setDestination(resolvedDestination);
        }
        if (resolvedPickup && resolvedDestination) {
          await fetchRoute(resolvedPickup, resolvedDestination);
        }
      } catch (err) {
        console.error("Geocoding URL params failed:", err);
      }
    };
    initFromParams();
  }, [searchParams, setPickup, setDestination]);

  const toggleOptionalService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleApplyDiscount = () => {
    if (!discountCodeInput.trim()) return;
    setAppliedDiscountCode(discountCodeInput.trim().toUpperCase());
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscountCode("");
    setDiscountCodeInput("");
  };

  const handleProceedToPayment = async () => {
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Please enter the passenger or primary contact name.");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setErrorMessage("Please enter a valid confirmation email address.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("Please enter a valid mobile telephone number for SMS dispatch updates.");
      return;
    }
    if (!policyAccepted) {
      setErrorMessage("You must read and agree to the Luna Limo Cancellation & No-Show Policy before proceeding.");
      return;
    }

    setIsRedirectingToStripe(true);

    try {
      const selectedServicesList = availableOptionalServices.filter((s: any) =>
        selectedServiceIds.includes(s.id)
      );

      const pickupCoord = pickup?.position || { lat: 47.6062, lon: -122.3321 };
      const destCoord = destination?.position || { lat: 47.4502, lon: -122.3088 };

      const checkoutData = {
        carTypeName: selectedCar?.name || "Mercedes-Benz S-Class",
        distance: distanceKm,
        duration: durationMinutes,
        distanceMiles,
        durationMinutes,
        serviceType,
        hourlyDuration: serviceType === "hourly" ? hourlyDuration : undefined,
        carTypeMultiplier: selectedCar?.multiplier || 1.0,
        price: effectiveFinalAmount,
        signedQuoteToken: serverQuote?.signedQuoteToken,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        pickupAddress: pickup?.address?.freeformAddress || "Seattle, WA",
        destinationAddress:
          serviceType === "hourly"
            ? "Hourly Charter Service"
            : destination?.address?.freeformAddress || "Seattle-Tacoma International Airport (SEA)",
        pickupLat: pickupCoord.lat,
        pickupLng: pickupCoord.lon,
        destLat: destCoord.lat,
        destLng: destCoord.lon,
        passengers,
        luggage,
        accessible,
        pickupDate,
        pickupTime,
        flightNumber: flightNumber.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        optionalServices: selectedServicesList,
        discountCode: appliedDiscountCode || undefined,
        policyAccepted: true,
        policyVersion: activePolicy?.version || "1.0",
      };

      const result = await createCheckoutSession(checkoutData);

      if (result.url) {
        window.location.href = result.url;
      } else {
        router.push("/booking/success?session_id=mock_session");
      }
    } catch (err: any) {
      console.error("Payment redirect error:", err);
      setErrorMessage(err.message || "Failed to initiate secure checkout session. Please try again.");
      setIsRedirectingToStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-black italic uppercase text-foreground">
                  Luna Limo Cancellation &amp; No-Show Policy
                </h3>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="py-6 space-y-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {activePolicy?.content}
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                onClick={() => {
                  setPolicyAccepted(true);
                  setShowPolicyModal(false);
                }}
                className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-6 py-4 text-xs font-black uppercase tracking-widest shadow-md"
              >
                I Understand &amp; Agree
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero / Header Section */}
      <section className="bg-secondary/40 border-b border-border py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-[9px] font-black uppercase tracking-widest">
              Authoritative Reservation Engine
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Reserve Your <span className="text-gold">Chauffeur</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl">
            Experience bespoke luxury transportation across the Greater Seattle and Puget Sound region. Guaranteed upfront rates, verified chauffeurs, and effortless Stripe checkout.
          </p>
        </div>
      </section>

      {/* Booking Stepper Navigation */}
      <div className="border-b border-border bg-card/60 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between overflow-x-auto gap-2 sm:gap-4 text-xs">
          {[
            { step: 1, label: "1. Route & Schedule" },
            { step: 2, label: "2. Select Vehicle" },
            { step: 3, label: "3. Amenities & Options" },
            { step: 4, label: "4. Review & Payment" },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => {
                if (item.step < currentStep || (pickup && (destination || serviceType === "hourly"))) {
                  setCurrentStep(item.step as BookingWizardStep);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-none transition-all uppercase tracking-wider font-black text-[10px] whitespace-nowrap ${
                currentStep === item.step
                  ? "bg-gold text-primary-foreground shadow-sm"
                  : currentStep > item.step
                  ? "text-gold hover:text-gold-dark"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {currentStep > item.step ? <Check className="h-3 w-3" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Booking Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Wizard Steps */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: ROUTE & SERVICE TYPE */}
            {currentStep === 1 && (
              <div className="bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
                  <div>
                    <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">
                      Service &amp; Itinerary
                    </h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                      Choose transit mode and specify pickup location
                    </p>
                  </div>
                  
                  {/* Service Type Toggle */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-secondary p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => setServiceType("point_to_point")}
                      className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        serviceType === "point_to_point"
                          ? "bg-gold text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Point to Point
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("round_trip")}
                      className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        serviceType === "round_trip"
                          ? "bg-gold text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Round Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("airport")}
                      className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        serviceType === "airport"
                          ? "bg-gold text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Airport Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("hourly")}
                      className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        serviceType === "hourly"
                          ? "bg-gold text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Hourly Charter
                    </button>
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      {serviceType === "airport" ? "Pickup Airport Terminal / Address *" : "Pickup Address / Airport Terminal *"}
                    </label>
                    <LocationInput
                      placeholder={serviceType === "airport" ? "Enter Sea-Tac terminal or hotel..." : "Enter pickup address, hotel, or Sea-Tac terminal..."}
                      value={pickup}
                      onChange={(loc: SearchResult | null) => {
                        setPickup(loc);
                        if (loc && destination) fetchRoute(loc, destination);
                      }}
                    />
                  </div>

                  {serviceType !== "hourly" ? (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        {serviceType === "round_trip" ? "Turnaround / Destination Address *" : "Destination Address / Venue *"}
                      </label>
                      <LocationInput
                        placeholder="Enter destination address or Sea-Tac airport..."
                        value={destination}
                        onChange={(loc: SearchResult | null) => {
                          setDestination(loc);
                          if (pickup && loc) fetchRoute(pickup, loc);
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        Charter Duration (Minimum 2 Hours) *
                      </label>
                      <div className="flex items-center gap-4 bg-secondary p-4 border border-border">
                        <button
                          type="button"
                          onClick={() => setHourlyDuration((h) => Math.max(2, h - 1))}
                          className="p-2 border border-border hover:border-gold text-foreground transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-serif text-xl font-black italic text-gold min-w-[4rem] text-center">
                          {hourlyDuration} Hours
                        </span>
                        <button
                          type="button"
                          onClick={() => setHourlyDuration((h) => Math.min(24, h + 1))}
                          className="p-2 border border-border hover:border-gold text-foreground transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-muted-foreground uppercase font-bold ml-auto">
                          Dedicated chauffeur at your disposal
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Pickup Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={pickupDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Pickup Time *
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Route Map Preview */}
                {pickup && (destination || serviceType === "hourly") && (
                  <div className="pt-4 space-y-2">
                    <div className="h-56 w-full border border-border overflow-hidden relative">
                      <MapComponent
                        pickup={pickup?.position ? { lat: pickup.position.lat, lng: pickup.position.lon } : null}
                        destination={destination?.position ? { lat: destination.position.lat, lng: destination.position.lon } : null}
                        routeCoordinates={route?.coordinates}
                      />
                    </div>
                    {serviceType !== "hourly" && route && (
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                        <span>Distance: {formatDistance(route.distanceInKm)} ({Math.round(route.distanceInKm * 0.621371 * 10) / 10} mi{serviceType === "round_trip" ? " each way" : ""})</span>
                        <span>Est. Duration: {formatDuration(route.durationInMinutes)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1 Next Button */}
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      if (!pickup) {
                        setErrorMessage("Please select a valid pickup location.");
                        return;
                      }
                      if (serviceType !== "hourly" && !destination) {
                        setErrorMessage("Please select a valid destination location.");
                        return;
                      }
                      setErrorMessage("");
                      setCurrentStep(2);
                    }}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-8 text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
                  >
                    Select Fleet Vehicle
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: FLEET VEHICLE SELECTION */}
            {currentStep === 2 && (
              <div className="bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <div>
                    <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">
                      Select Vehicle Class
                    </h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                      Choose from our Seattle executive fleet
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Edit Itinerary
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCarTypes.map((car: any) => {
                    const isSelected = selectedCar?.name === car.name;
                    const carKey = getVehicleKey(car);
                    const carQuote = calculateTripQuote({
                      vehicle_class: carKey,
                      trip_type: serviceType,
                      distance_miles: distanceMiles,
                      duration_minutes: durationMinutes,
                      hourly_hours: serviceType === "hourly" ? hourlyDuration : undefined,
                      pickup_datetime: `${pickupDate}T${pickupTime}:00`,
                      pickup_address: pickup?.address?.freeformAddress,
                      dropoff_address: destination?.address?.freeformAddress,
                      is_airport_pickup: isAirportPickup,
                      is_airport_dropoff: isAirportDropoff,
                      meet_and_greet: selectedServiceIds.includes("meet_greet"),
                      child_seats: selectedServiceIds.includes("child_seat") ? 1 : 0,
                      extra_stops: selectedServiceIds.includes("extra_stop") ? 1 : 0,
                      discount_code: appliedDiscountCode || undefined,
                    });

                    return (
                      <div
                        key={car.name}
                        onClick={() => setSelectedCar(car)}
                        className={`border p-6 space-y-4 cursor-pointer transition-all relative ${
                          isSelected
                            ? "bg-secondary border-gold shadow-lg ring-1 ring-gold"
                            : "bg-card border-border hover:border-gold/50"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-4 right-4 bg-gold text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2.5 py-1">
                            Selected Class
                          </span>
                        )}

                        <div className="relative h-32 w-full flex items-center justify-center overflow-hidden">
                          <Image
                            src={car.image || "/fleet_black_bg.png"}
                            alt={car.name}
                            fill
                            className="object-contain"
                          />
                        </div>

                        <div>
                          <h3 className="font-serif text-lg font-black italic uppercase text-foreground">
                            {car.name}
                          </h3>
                          <p className="text-muted-foreground text-xs mt-1 leading-relaxed line-clamp-2 font-medium">
                            {car.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold border-t border-border pt-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gold" /> {car.capacity} Passengers
                          </span>
                          <span className="flex items-center gap-1">
                            <Luggage className="h-3.5 w-3.5 text-gold" /> {car.luggageCapacity || car.capacity} Bags
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black block">
                              {serviceType === "hourly" ? "Total Charter Fare" : "All-Inclusive Upfront"}
                            </span>
                            <span className="font-serif text-xl font-black italic text-gold">
                              {formatPrice(carQuote.total_cents / 100)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={`rounded-none text-[9px] font-black uppercase tracking-widest ${
                              isSelected ? "bg-gold text-primary-foreground" : "border-border"
                            }`}
                          >
                            {isSelected ? "Selected" : "Choose Vehicle"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="border-border text-[10px] font-black uppercase tracking-widest py-6 px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-8 text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2"
                  >
                    Configure Amenities
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PASSENGERS & OPTIONAL SERVICES */}
            {currentStep === 3 && (
              <div className="bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <div>
                    <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">
                      Passengers &amp; Bespoke Services
                    </h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                      Customize your comfort and requirements
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Change Vehicle
                  </Button>
                </div>

                {/* Passenger & Luggage Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary/50 p-6 border border-border">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Passenger Count (Max {selectedCar?.capacity || 6})
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        className="p-3 border border-border hover:border-gold bg-card text-foreground transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-serif text-2xl font-black italic text-gold min-w-[3rem] text-center">
                        {passengers}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(selectedCar?.capacity || 6, p + 1))}
                        className="p-3 border border-border hover:border-gold bg-card text-foreground transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Luggage Bag Count (Max {selectedCar?.luggageCapacity || 6})
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setLuggage((l) => Math.max(0, l - 1))}
                        className="p-3 border border-border hover:border-gold bg-card text-foreground transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-serif text-2xl font-black italic text-gold min-w-[3rem] text-center">
                        {luggage}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLuggage((l) => Math.min(selectedCar?.luggageCapacity || 6, l + 1))}
                        className="p-3 border border-border hover:border-gold bg-card text-foreground transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Services */}
                <div className="space-y-4">
                  <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Available Optional Amenities
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {availableOptionalServices.map((service: any) => {
                      const isChecked = selectedServiceIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleOptionalService(service.id)}
                          className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? "bg-secondary border-gold"
                              : "bg-card border-border hover:border-gold/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-none border flex items-center justify-center ${
                                isChecked ? "bg-gold border-gold text-primary-foreground" : "border-border"
                              }`}
                            >
                              {isChecked && <Check className="h-3.5 w-3.5" />}
                            </div>
                            <span className="text-sm font-bold text-foreground">{service.name}</span>
                          </div>
                          <span className="font-serif text-sm font-black italic text-gold">
                            +{formatPrice(service.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Flight Number & Special Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Plane className="h-3 w-3 text-gold" /> Flight Number (For Airport Pickups)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AS 1245 / DL 842"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Special Chauffeur Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="Gate code, child ages, preferred route..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Promo Discount Code */}
                <div className="p-4 bg-secondary/40 border border-border space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-gold" /> Promotional Discount Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE (e.g. LUNA10)"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-secondary border border-border p-3 text-xs text-foreground focus:border-gold outline-none uppercase font-bold"
                    />
                    {appliedDiscountCode ? (
                      <Button
                        type="button"
                        onClick={handleRemoveDiscount}
                        variant="outline"
                        className="text-[9px] font-black uppercase border-destructive/40 text-destructive rounded-none px-4"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[9px] font-black uppercase tracking-widest px-6"
                      >
                        Apply Code
                      </Button>
                    )}
                  </div>
                  {serverQuote?.discountAmount || localQuote.discount_cents > 0 ? (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                      <Check className="h-3 w-3" /> Code &quot;{appliedDiscountCode}&quot; applied (-{formatPrice(serverQuote?.discountAmount || localQuote.discount_cents / 100)})
                    </p>
                  ) : null}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="border-border text-[10px] font-black uppercase tracking-widest py-6 px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-8 text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2"
                  >
                    Contact &amp; Policy Review
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: CONTACT & POLICY AGREEMENT */}
            {currentStep === 4 && (
              <div className="bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <div>
                    <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">
                      Passenger Contact &amp; Terms
                    </h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                      Finalize confirmation and review cancellation policy
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Edit Options
                  </Button>
                </div>

                {/* Contact Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                      <User className="h-3 w-3 text-gold" /> Full Name (Primary Passenger / Booker) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-gold" /> Confirmation Email *
                      </label>
                      <input
                        type="email"
                        placeholder="eleanor@company.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gold" /> Mobile Phone (For Driver SMS Updates) *
                      </label>
                      <input
                        type="tel"
                        placeholder="(206) 555-0199"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Official Cancellation Policy Agreement Box */}
                <div className="p-6 bg-secondary/60 border border-border space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="policyAgreement"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded-none accent-gold cursor-pointer"
                    />
                    <label htmlFor="policyAgreement" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      <span className="font-bold">I have read and agree to the Luna Limo Cancellation &amp; No-Show Policy and Reservation Terms.</span>
                      <span className="text-muted-foreground block mt-1 text-[11px]">
                        Cancellations 24h+ prior to pickup are free (100% refund). Cancellations under 24h incur up to 50% fee. Within 2 hours, after chauffeur dispatch, or no-shows are charged 100%.
                      </span>
                    </label>
                  </div>
                  <div className="pl-8">
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="text-gold text-[10px] font-black uppercase tracking-widest underline hover:text-gold-dark"
                    >
                      View Full Policy Terms &amp; Conditions
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Final Checkout Button */}
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-auto border-border text-[10px] font-black uppercase tracking-widest py-6 px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>

                  <Button
                    onClick={handleProceedToPayment}
                    disabled={isRedirectingToStripe}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 px-10 text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 group"
                  >
                    {isRedirectingToStripe ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Initiating Stripe Checkout...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-primary-foreground group-hover:scale-110 transition-transform" />
                        Confirm &amp; Pay {formatPrice(effectiveFinalAmount)}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Authoritative Server Price Summary Card */}
          <div className="lg:col-span-4 sticky top-36">
            <Card className="p-6 border-border bg-card shadow-xl rounded-none space-y-6">
              <div className="pb-4 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-gold text-[9px] font-black uppercase tracking-widest block">
                    Authoritative Quote
                  </span>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">
                    {selectedCar?.name || "Vehicle"}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Car className="h-5 w-5" />
                </div>
              </div>

              {/* Itinerary Quick Summary */}
              <div className="space-y-2 text-xs text-muted-foreground font-medium pb-4 border-b border-border">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                  <span className="truncate text-foreground font-bold">
                    {pickup?.address?.freeformAddress || "Pickup location pending"}
                  </span>
                </div>
                {serviceType !== "hourly" && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gold/60 shrink-0 mt-0.5" />
                    <span className="truncate text-foreground font-bold">
                      {destination?.address?.freeformAddress || "Destination pending"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gold" /> {pickupDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gold" /> {pickupTime}
                  </span>
                </div>
              </div>

              {/* Server Itemized Breakdown */}
              <div className="space-y-2.5 text-xs">
                {localQuote.line_items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between ${
                      item.amount_cents < 0
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-foreground font-bold">
                      {item.amount_cents < 0 ? "-" : ""}
                      {formatPrice(Math.abs(item.amount_cents) / 100)}
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t border-border flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                      Total Authoritative Fare
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">
                      All-Inclusive Transparent Price
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-black italic text-gold">
                    {formatPrice(effectiveFinalAmount)}
                  </span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="p-3 bg-secondary/50 border border-border space-y-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-wider text-center">
                <p className="flex items-center justify-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 256-Bit SSL Encrypted Stripe Checkout
                </p>
                <p>Free Cancellation Up To 24 Hours Before Pickup</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
