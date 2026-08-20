"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  Calendar,
  ChevronRight,
  Star,
  Globe,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Compass,
  Trophy,
  Quote,
  Zap,
  Car,
  Clock
} from "lucide-react";
import NextImage from "next/image";
import { LocationInput } from "@/components/booking/location-input";
import { SearchResult } from "@/lib/tomtom/search";

export default function HomeClient() {
  const router = useRouter();
  const [searchData, setSearchData] = React.useState({
    pickup: null as SearchResult | null,
    destination: null as SearchResult | null,
    date: new Date().toISOString().split("T")[0],
    time: ""
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.pickup) params.set("p", searchData.pickup.address.freeformAddress);
    if (searchData.destination) params.set("d", searchData.destination.address.freeformAddress);
    if (searchData.date) params.set("date", searchData.date);
    if (searchData.time) params.set("time", searchData.time);
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-12 sm:pt-20 pb-8 sm:pb-32 px-4 sm:px-6 overflow-hidden text-white">
          {/* Background Image Layer */}
          <NextImage
            src="/luxury_hero_bg.png"
            alt="Luxury chauffeur fleet at night"
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover scale-105 z-0"
          />
          {/* Sophisticated Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60 z-[1] backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-black/40 z-[1]" />
          
          <div className="max-w-7xl mx-auto relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 w-full">
            {/* Left Column: Text */}
            <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase text-white leading-[1.1] tracking-tighter">
                Seattle Limo Service & <br />
                <span className="text-gold">Luxury Chauffeur</span>
              </h1>

              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed uppercase tracking-widest">
                Luna Limo delivers a bespoke transportation experience tailored for those who demand excellence. 
                The ultimate in <span className="text-gold">discretion, safety, and sophistication</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-10 py-7 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl border-b-4 border-gold-dark flex items-center justify-center gap-3 active:scale-95 transition-transform">
                    <Phone className="h-4 w-4" />
                    Call +1 (206) 327-4411
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Minimal Search Form */}
            <div className="w-full lg:w-[450px] animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 p-8 sm:p-10 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-colors" />
                
                <h3 className="font-serif text-xl sm:text-2xl font-black italic uppercase text-white mb-8 border-b border-neutral-800 pb-4">
                  Quick <span className="text-gold">Reservation</span>
                </h3>

                <form onSubmit={handleSearch} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label htmlFor="pickup-select" className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] ml-1">Pickup Location</label>
                    <LocationInput 
                      id="pickup-select"
                      placeholder="Airport, Hotel, or Office"
                      value={searchData.pickup}
                      onChange={(location) => setSearchData({...searchData, pickup: location})}
                      className="bg-black/60 border-neutral-800 text-white font-bold h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dropoff-select" className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] ml-1">Drop-off Destination</label>
                    <LocationInput 
                      id="dropoff-select"
                      placeholder="Where are you heading?"
                      value={searchData.destination}
                      onChange={(location) => setSearchData({...searchData, destination: location})}
                      className="bg-black/60 border-neutral-800 text-white font-bold h-12"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="res-date" className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] ml-1">Preferred Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
                        <input 
                          id="res-date"
                          type="date"
                          className="w-full bg-black/60 border border-neutral-800 text-white p-4 pl-12 text-xs font-bold focus:border-gold outline-none transition-all [color-scheme:dark]"
                          value={searchData.date}
                          onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="res-time" className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] ml-1">Arrival Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
                        <input 
                          id="res-time"
                          type="time"
                          className="w-full bg-black/60 border border-neutral-800 text-white p-4 pl-12 text-xs font-bold focus:border-gold outline-none transition-all [color-scheme:dark]"
                          value={searchData.time}
                          onChange={(e) => setSearchData({...searchData, time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-8 text-xs font-black uppercase tracking-[0.3em] mt-4 border-b-4 border-gold-dark active:translate-y-1 transition-all"
                  >
                    Check Availability
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl h-[100px] sm:h-[200px] md:h-[400px] mt-12 sm:mt-20 lg:-mt-20 z-0">
            <NextImage
              src="/fleet_black_bg.png"
              alt="Luna Limo Fleet"
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-contain opacity-40 lg:opacity-100 grayscale hover:grayscale-0 transition-all duration-1000"
              loading="lazy"
            />
          </div>
        </section>

        {/* Elite Services Grid */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-black relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">Our Expertise</h3>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black italic uppercase text-white leading-tight">
                Elite Travel Solutions
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  title: "Airport Transfers",
                  desc: "Punctual, stress-free transfers to and from Sea-Tac International.",
                  icon: <Globe className="h-8 w-8 text-gold" />
                },
                {
                  title: "Corporate Travel",
                  desc: "Professional black car service for executive meetings and business events.",
                  icon: <Briefcase className="h-8 w-8 text-gold" />
                },
                {
                  title: "Special Occasions",
                  desc: "Luxurious transportation for weddings, anniversaries, and red-carpet events.",
                  icon: <Trophy className="h-8 w-8 text-gold" />
                },
                {
                  title: "City Charters",
                  desc: "Custom hourly service for city tours, shopping, or dinner bookings.",
                  icon: <Compass className="h-8 w-8 text-gold" />
                }
              ].map((service, i) => (
                <div key={i} className="group p-6 sm:p-8 bg-neutral-900 border border-neutral-800 hover:border-gold/50 transition-all duration-500 relative">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">{service.icon}</div>
                  <h4 className="font-serif font-black italic uppercase text-xl text-white mb-4">{service.title}</h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                    {service.desc}
                  </p>
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gold transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Section with Background */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-black overflow-hidden border-t border-neutral-900">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 w-full max-w-[500px] lg:max-w-none">
              <NextImage
                src="/fleet_black_bg.png"
                alt="Luxury Car and Seattle Skyline"
                width={600}
                height={400}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-black italic uppercase text-white leading-tight">
                Seattle Luxury Transportation | Your Premier Choice For Reliability.
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
                Luxury is more than a car—it's the peace of mind that your driver is already there. At Luna Limo, we know that your time is your most valuable asset. We are an elite transportation provider, dedicated to delivering precision and comfort for every mile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white rounded-none px-8 py-6 text-[11px] font-black uppercase tracking-widest border-b-2 border-neutral-700">
                    Call: (206) 327-4411
                  </Button>
                </Link>
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-8 py-6 text-[11px] font-black uppercase tracking-widest border-b-4 border-gold-dark">
                    Book Your Ride Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-neutral-900 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">Common Inquiries</h3>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black italic uppercase text-white">
                Frequently Asked
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How far in advance should I book?",
                  a: "We recommend booking at least 24 hours in advance for airport transfers and 48 hours for special events to ensure full vehicle availability."
                },
                {
                  q: "What is your cancellation policy?",
                  a: "Cancellations made 24 hours prior to the scheduled pickup receive a full refund. Same-day cancellations may incur a standard fee."
                },
                {
                  q: "Do you offer meet and greet at Sea-Tac?",
                  a: "Yes, our executive airport service includes a baggage claim meet-and-greet with a personalized name board."
                },
                {
                  q: "Are your vehicles smoke-free?",
                  a: "Absolutely. All vehicles in our fleet are strictly non-smoking to ensure a premium environment for all guests."
                }
              ].map((faq, i) => (
                <div key={i} className="group p-6 bg-black border border-neutral-800 hover:border-gold/30 transition-all">
                  <h4 className="font-serif font-black italic uppercase text-lg text-gold mb-3 flex items-center gap-3">
                    <span className="text-xs font-sans not-italic border border-gold/40 px-2 py-0.5 rounded text-gold/60">Q</span>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed pl-10">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Black Section / CTA */}
        <section className="bg-neutral-900 py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-gold rotate-45 flex items-center justify-center">
                  <div className="bg-neutral-900 w-full h-full transform scale-90 border-4 border-gold" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gold font-serif font-black text-4xl italic uppercase tracking-tighter">L</span>
                </div>
              </div>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black italic uppercase text-white leading-tight">
              Our Chauffeur Driven Services
            </h2>

            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-bold tracking-widest px-4 uppercase max-w-2xl mx-auto">
              Reliable airport transfers, executive corporate services, and bespoke special event transportation across the Seattle region.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="tel:+12063274411" className="w-full sm:w-auto">
                <Button size="lg" className="bg-white hover:bg-neutral-100 text-black rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] w-full">
                  Call: (206) 327-4411
                </Button>
              </Link>
              <Link href="/booking" className="w-full sm:w-auto">
                <Button size="lg" className="bg-gold hover:bg-gold-dark text-white rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] w-full">
                  Book Your Ride Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
