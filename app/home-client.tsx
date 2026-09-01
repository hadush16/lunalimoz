"use client";

import * as React from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/booking/location-input";
import { SearchResult } from "@/lib/tomtom/search";
import { 
  ShieldCheck, 
  Clock, 
  Plane, 
  Sparkles, 
  ArrowRight, 
  Car, 
  Users, 
  Luggage, 
  Briefcase, 
  Star,
  ChevronRight,
  ChevronLeft,
  Globe,
  Trophy,
  Compass,
  Phone,
  Calendar
} from "lucide-react";
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from "@/components/ui/animated-section";

const fleetPreview = [
  {
    name: "Cadillac Escalade ESV",
    category: "Executive SUV",
    capacity: 6,
    luggage: 6,
    image: "/fleet_black_bg.png",
    desc: "The pinnacle of executive group transportation, offering lavish legroom and unmatched luggage capacity."
  },
  {
    name: "Mercedes-Benz S-Class",
    category: "First-Class Sedan",
    capacity: 3,
    luggage: 3,
    image: "/fleet_white_bg.png",
    desc: "Unrivaled acoustic isolation, executive rear seating, and smooth dynamic luxury for business leaders."
  },
  {
    name: "Lincoln Navigator L",
    category: "Luxury Extended SUV",
    capacity: 6,
    luggage: 6,
    image: "/fleet_black_bg.png",
    desc: "Refined American prestige with extended cargo space and captain seating for premier event arrivals."
  },
  {
    name: "Mercedes-Benz Sprinter",
    category: "VIP Chauffeur Coach",
    capacity: 14,
    luggage: 14,
    image: "/fleet_black_bg.png",
    desc: "Stand-up headroom, custom leather seating, and corporate presentation connectivity for larger delegations."
  }
];

export default function HomeClient() {
  const router = useRouter();
  const [searchData, setSearchData] = React.useState({
    pickup: null as SearchResult | null,
    destination: null as SearchResult | null,
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
  });

  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      carouselRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
    <div className="bg-background text-foreground selection:bg-gold/30 min-h-screen transition-colors duration-200">
      <main>
        {/* Cinematic Hero Section */}
        <section className="relative min-h-[90vh] lg:min-h-[88vh] flex items-center pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          {/* Background Image Layer */}
          <NextImage
            src="/luxury_hero_bg.png"
            alt="Luxury chauffeur fleet in Seattle"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover scale-105 z-0"
          />
          {/* Layered Luxury Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/60 z-[1]" />
          <div className="absolute inset-0 bg-black/30 z-[1]" />
          
          <div className="max-w-7xl mx-auto relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 w-full">
            {/* Left Column: Headline & Hero Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
              <AnimatedSection variant="fadeUp" delay={0.05}>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold">
                    Seattle&apos;s Elite Chauffeur Standard
                  </span>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fadeUp" delay={0.15}>
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase text-white leading-[1.05] tracking-tight">
                  Luxury Moves <br />
                  <span className="text-gradient-gold">With You.</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection variant="fadeUp" delay={0.25}>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed uppercase tracking-wider">
                  Bespoke executive black car transportation tailored around your schedule. Uncompromising discretion, flight tracking, and pristine comfort across Seattle and the Eastside.
                </p>
              </AnimatedSection>

              {/* Trust Badges */}
              <AnimatedSection variant="fadeUp" delay={0.35}>
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 pt-2 text-left">
                  <div className="bg-black/60 border border-white/10 p-3 backdrop-blur-sm">
                    <Plane className="h-4 w-4 text-gold mb-1" />
                    <p className="text-[9px] font-black uppercase text-white tracking-wider">Sea-Tac Direct</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Flight Monitored</p>
                  </div>
                  <div className="bg-black/60 border border-white/10 p-3 backdrop-blur-sm">
                    <ShieldCheck className="h-4 w-4 text-gold mb-1" />
                    <p className="text-[9px] font-black uppercase text-white tracking-wider">Top Safety</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Vetted Chauffeurs</p>
                  </div>
                  <div className="bg-black/60 border border-white/10 p-3 backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-gold mb-1" />
                    <p className="text-[9px] font-black uppercase text-white tracking-wider">24/7 Service</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Always on time</p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fadeUp" delay={0.45}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link href="tel:+12063274411" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-xl border-b-2 border-gold-dark flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Phone className="h-4 w-4" />
                      Call (206) 327-4411
                    </Button>
                  </Link>
                  <Link href="/fleet" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white hover:text-black rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-sm transition-all">
                      Explore Fleet
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Column: Floating Luxury Booking Panel */}
            <div className="w-full lg:w-[440px]">
              <AnimatedSection variant="scale" delay={0.2}>
                <div className="bg-card/95 text-foreground backdrop-blur-xl border border-border p-6 sm:p-8 shadow-2xl relative group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
                  
                  <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
                    <h3 className="font-serif text-xl sm:text-2xl font-black italic uppercase text-foreground">
                      Quick <span className="text-gold">Reservation</span>
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-gold fill-gold" /> Instant Rate
                    </span>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-4 relative z-10">
                    <div className="space-y-1.5">
                      <label htmlFor="pickup-select" className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                        Pickup Location
                      </label>
                      <LocationInput 
                        id="pickup-select"
                        placeholder="Airport, Hotel, or Address"
                        value={searchData.pickup}
                        onChange={(location) => setSearchData({...searchData, pickup: location})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="dropoff-select" className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                        Destination
                      </label>
                      <LocationInput 
                        id="dropoff-select"
                        placeholder="Where would you like to go?"
                        value={searchData.destination}
                        onChange={(location) => setSearchData({...searchData, destination: location})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="res-date" className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] ml-1">
                          Date
                        </label>
                        <div className="relative">
                          <input 
                            id="res-date"
                            type="date"
                            className="w-full bg-secondary border border-border text-foreground p-3 text-xs font-bold focus:border-gold outline-none transition-colors"
                            value={searchData.date}
                            onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="res-time" className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] ml-1">
                          Time
                        </label>
                        <div className="relative">
                          <input 
                            id="res-time"
                            type="time"
                            className="w-full bg-secondary border border-border text-foreground p-3 text-xs font-bold focus:border-gold outline-none transition-colors"
                            value={searchData.time}
                            onChange={(e) => setSearchData({...searchData, time: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-black uppercase tracking-[0.25em] mt-2 border-b-2 border-gold-dark shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Check Availability</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Fleet Showcase Section with Carousel */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" /> The Luxury Collection
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
                  Executive <span className="text-gold">Fleet</span>
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCarousel("left")}
                    className="w-10 h-10 border border-border hover:border-gold flex items-center justify-center text-muted-foreground hover:text-gold transition-colors bg-card shadow-sm"
                    aria-label="Previous fleet slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel("right")}
                    className="w-10 h-10 border border-border hover:border-gold flex items-center justify-center text-muted-foreground hover:text-gold transition-colors bg-card shadow-sm"
                    aria-label="Next fleet slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <Link href="/fleet" className="text-xs font-black uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1">
                  All Specs <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Scrollable & Snap Fleet Container */}
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 scrollbar-none no-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {fleetPreview.map((car, idx) => (
                <div 
                  key={idx} 
                  className="min-w-[280px] sm:min-w-[320px] lg:min-w-[300px] flex-1 snap-start bg-card border border-border p-6 flex flex-col justify-between group hover:border-gold/60 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/10] bg-secondary border border-border/50 overflow-hidden">
                      <NextImage
                        src={car.image}
                        alt={car.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-background/80 text-gold border border-gold/30 backdrop-blur-sm">
                          {car.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-black italic uppercase text-foreground group-hover:text-gold transition-colors">
                        {car.name}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3 text-gold" /> {car.capacity} Pax</span>
                        <span className="flex items-center gap-1"><Luggage className="h-3 w-3 text-gold" /> {car.luggage} Bags</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-3 line-clamp-2">
                        {car.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border">
                    <Link href={`/booking?car=${encodeURIComponent(car.name)}`}>
                      <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 group-hover:shadow-gold/20">
                        <Calendar className="h-3.5 w-3.5" />
                        Reserve
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elite Services Grid */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-card border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto space-y-16">
            <AnimatedSection variant="fadeUp" className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">
                Tailored Mobility
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
                Concierge Services
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                From punctual Sea-Tac airport transfers to all-day executive charters, Luna Limo delivers precision for every itinerary.
              </p>
            </AnimatedSection>

            <AnimatedStaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  title: "Airport Transfers",
                  desc: "Punctual, stress-free transfers to and from Sea-Tac International with real-time flight tracking.",
                  icon: <Globe className="h-7 w-7 text-gold" />,
                  href: "/services/seattle-airport-limo"
                },
                {
                  title: "Corporate Travel",
                  desc: "Quiet mobile-office experience for high-stakes business meetings, corporate summits, and executives.",
                  icon: <Briefcase className="h-7 w-7 text-gold" />,
                  href: "/services/executive-chauffeur-seattle"
                },
                {
                  title: "Special Events",
                  desc: "Prestigious red-carpet transit for weddings, galas, anniversaries, and VIP milestones.",
                  icon: <Trophy className="h-7 w-7 text-gold" />,
                  href: "/services/seattle-wedding-limo"
                },
                {
                  title: "City Charters",
                  desc: "Flexible hourly chauffeur disposal for customized Seattle city tours, dining, and shopping trips.",
                  icon: <Compass className="h-7 w-7 text-gold" />,
                  href: "/services/seattle-city-tour-limo"
                }
              ].map((service, i) => (
                <AnimatedStaggerItem key={i}>
                  <Link href={service.href} className="group block h-full">
                    <div className="h-full bg-secondary/50 border border-border p-8 hover:border-gold/50 transition-all duration-300 relative flex flex-col justify-between group-hover:-translate-y-1 shadow-sm">
                      <div>
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                          {service.icon}
                        </div>
                        <h3 className="font-serif font-black italic uppercase text-lg sm:text-xl text-foreground mb-3">
                          {service.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                      <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gold">
                        <span>Learn More</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </AnimatedStaggerItem>
              ))}
            </AnimatedStaggerContainer>
          </div>
        </section>

        {/* The Seattle Advantage / Why Choose Luna */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection variant="slideLeft" className="relative aspect-[4/3] bg-secondary border border-border overflow-hidden">
              <NextImage
                src="/fleet_black_bg.png"
                alt="Luna Limo Executive Chauffeur in Seattle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Concierge Discretion</span>
                <p className="font-serif text-xl font-black italic uppercase">Seattle &amp; Bellevue Regional Authority</p>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="slideRight" className="space-y-6">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">
                The Luna Standard
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground tracking-tight leading-tight">
                Punctuality Is Our Primary Luxury.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                In executive travel, time is the single asset you cannot replenish. At Luna Limo, our drivers arrive at least 15 minutes prior to scheduled pickup, tracking your flight status in real time to adapt to any schedule shifts.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-card border border-border shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-gold mb-2" />
                  <h4 className="font-serif text-sm font-black italic uppercase text-foreground">Strict Discretion</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Non-disclosure trained private chauffeurs.</p>
                </div>
                <div className="p-4 bg-card border border-border shadow-sm">
                  <Plane className="h-5 w-5 text-gold mb-2" />
                  <h4 className="font-serif text-sm font-black italic uppercase text-foreground">Flight Tracking</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Automatic Sea-Tac delay &amp; arrival adjustments.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-md">
                    Book Your Ride Now
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">
                    Direct: (206) 327-4411
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-card border-b border-border transition-colors">
          <div className="max-w-4xl mx-auto space-y-12">
            <AnimatedSection variant="fadeUp" className="text-center space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">
                Inquiries &amp; Policies
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground">
                Frequently Asked
              </h2>
            </AnimatedSection>

            <AnimatedStaggerContainer className="space-y-4">
              {[
                {
                  q: "How far in advance should I book my chauffeur?",
                  a: "We recommend booking at least 24 hours in advance for airport transfers and 48 hours for special events or multi-vehicle group logistics to guarantee vehicle class availability."
                },
                {
                  q: "What happens if my inbound flight to Sea-Tac is delayed?",
                  a: "We track your flight number in real time. Your pickup time and driver dispatch automatically sync to your actual touchdown time, with complimentary wait time included."
                },
                {
                  q: "Do you offer Meet and Greet inside Sea-Tac airport?",
                  a: "Yes. Our executive airport service includes baggage claim meet-and-greet with a personalized digital signage upon request."
                },
                {
                  q: "What is your cancellation and modification policy?",
                  a: "Cancellations made 24 hours prior to the scheduled pickup receive a full refund. Same-day modifications can be arranged directly via our 24/7 dispatch desk."
                }
              ].map((faq, i) => (
                <AnimatedStaggerItem key={i}>
                  <div className="p-6 bg-secondary/50 border border-border space-y-2 shadow-sm">
                    <h3 className="font-serif font-black italic uppercase text-base sm:text-lg text-foreground flex items-center gap-2.5">
                      <span className="text-xs font-sans not-italic border border-gold/40 px-2 py-0.5 text-gold font-bold">Q</span>
                      {faq.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed pl-8">
                      {faq.a}
                    </p>
                  </div>
                </AnimatedStaggerItem>
              ))}
            </AnimatedStaggerContainer>
          </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-secondary text-foreground relative overflow-hidden border-t border-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
          <AnimatedSection variant="scale" className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tight text-foreground">
              Ready For <span className="text-gradient-gold">First-Class</span> Travel?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
              Experience executive transportation tailored to your precision. Available 24/7 across Seattle, Bellevue, Redmond, and Sea-Tac.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-10 py-7 text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
                  Reserve Online
                </Button>
              </Link>
              <Link href="tel:+12063274411" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-card rounded-none px-10 py-7 text-xs font-black uppercase tracking-[0.2em]">
                  Call (206) 327-4411
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </main>
    </div>
  );
}
