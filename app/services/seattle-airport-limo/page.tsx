import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Clock, 
  Shield, 
  MapPin, 
  CheckCircle,
  Calendar,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Seattle Airport Limo Service | Sea-Tac Luxury Transfers - Luna Limo",
  description: "Premier Seattle airport limo service to and from Sea-Tac International. 24/7 punctual chauffeurs, flat rates, flight tracking, and luxury fleet. Book your airport transfer today.",
  keywords: ["Luna Limo", "Sea-Tac limo service", "Seattle airport transfer", "airport limo Seattle", "Sea-Tac chauffeur", "luxury airport car Seattle", "airport black car Seattle"],
  alternates: {
    canonical: "https://lunalimoz.com/services/seattle-airport-limo"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Where do I meet my driver at Sea-Tac?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our standard service is curbside pickup. For 'Meet & Greet' service, your chauffeur will wait at the arrival level baggage claim for your specific flight with a name board."
      }
    },
    {
      "@type": "Question",
      "name": "What if my flight is delayed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No need to worry. We track your flight number in real-time and adjust your pickup time automatically. We will be there whenever you land."
      }
    },
    {
      "@type": "Question",
      "name": "How many passengers can you accommodate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our Premium SUVs accommodate up to 6-7 passengers with luggage, while our Executive Sedans are perfect for up to 3 passengers."
      }
    },
    {
      "@type": "Question",
      "name": "Are car seats available for family airport travel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we provide booster and toddler seats upon request. Please specify your requirements during the booking process."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Airport Limo Service",
  "provider": {
    "@type": "Organization",
    "name": "Luna Limo",
    "url": "https://lunalimoz.com"
  },
  "areaServed": {
    "@type": "City",
    "name": "Seattle"
  },
  "description": "Professional airport limousine service to and from Sea-Tac Airport with luxury vehicles and experienced chauffeurs. Flight tracking, meet & greet, and fixed pricing included.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "75.00",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lunalimoz.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://lunalimoz.com/services" },
    { "@type": "ListItem", "position": 3, "name": "Airport Limo", "item": "https://lunalimoz.com/services/seattle-airport-limo" }
  ]
};

export default function AirportLimoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left space-y-6 z-10">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">
                Sea-Tac Executive Transfers
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
                Seattle Airport <br />
                <span className="text-gold">Limo Service</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Reliable, punctual, and sophisticated transportation for discerning travelers. We monitor your flight 24/7 in real time to ensure seamless Sea-Tac arrivals and terminal pickups.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Sea-Tac Ride
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call (206) 327-4411
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[280px] sm:h-[400px] lg:h-[450px]">
              <Image 
                src="/fleet_black_bg.png" 
                alt="Seattle Airport Limo - Fleet at Sea-Tac" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain grayscale hover:grayscale-0 transition-all duration-700 p-4"
                priority
              />
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 sm:py-24 bg-card border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Standard</span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground">Why Book With Luna?</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  title: "Flight Tracking",
                  desc: "We monitor all commercial and private flights in real-time. If your arrival shifts, your chauffeur auto-syncs.",
                  icon: <Globe className="h-7 w-7 text-gold" />
                },
                {
                  title: "Meet & Greet",
                  desc: "Your chauffeur awaits at baggage claim with a personalized digital iPad name board upon request.",
                  icon: <CheckCircle className="h-7 w-7 text-gold" />
                },
                {
                  title: "Wait Time Included",
                  desc: "Enjoy up to 60 minutes of complimentary wait time on international flights and 30 mins on domestic flights.",
                  icon: <Clock className="h-7 w-7 text-gold" />
                },
                {
                  title: "Fixed Pricing",
                  desc: "Transparent upfront flat rates with zero surge pricing, tolls, or hidden surcharge surprises.",
                  icon: <Shield className="h-7 w-7 text-gold" />
                }
              ].map((benefit, i) => (
                <div key={i} className="p-6 sm:p-8 bg-secondary/50 border border-border text-center space-y-4 shadow-sm">
                  <div className="flex justify-center">{benefit.icon}</div>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section (SEO Heavy) */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30 border-b border-border transition-colors">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black italic uppercase text-foreground border-l-4 border-gold pl-4">
                The Premier Sea-Tac Airport Limo Experience
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                <p>
                  Navigating the Pacific Northwest&apos;s busiest transit hub should be an experience of absolute comfort, not stress. Luna Limo provides a seamless transition from the runway to your final destination. Whether you are arriving for a corporate summit in Downtown Seattle or returning home to Bellevue, our chauffeurs provide a sanctuary of luxury.
                </p>
                <p>
                  Our airport transfer services go beyond simple transportation. From the moment you touch down at Seattle-Tacoma International Airport (SEA) or Boeing Field (BFI), our dispatch team manages every logistical detail. Our fleet of late-model SUVs and Executive Sedans are meticulously cleaned and stocked with premium amenities.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="p-4 bg-card border border-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-foreground">Seattle Proper</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Financial District, Capitol Hill, Queen Anne, South Lake Union, and waterfront hotels.
                </p>
              </div>
              <div className="p-4 bg-card border border-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-foreground">Eastside Hubs</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct transfers to Bellevue, Redmond tech campuses, Kirkland, Mercer Island, and Sammamish.
                </p>
              </div>
              <div className="p-4 bg-card border border-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-foreground">Terminal Access</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct curbside drop-offs and baggage claim pickups for all major airlines and private FBOs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-b border-border transition-colors">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Concierge Clarification</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black italic uppercase text-foreground">Sea-Tac FAQ</h2>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "Where do I meet my driver at Sea-Tac?",
                  a: "Our standard service is curbside pickup. For 'Meet & Greet' service, your chauffeur will wait at the arrival level baggage claim for your specific flight with a name board."
                },
                {
                  q: "What if my flight is delayed?",
                  a: "No need to worry. We track your flight number in real-time and adjust your pickup time automatically. We will be there whenever you land."
                },
                {
                  q: "How many passengers can you accommodate?",
                  a: "Our Premium SUVs accommodate up to 6 passengers with luggage, while our Executive Sedans are perfect for up to 3 passengers. For larger groups, our Sprinter vans seat 14."
                },
                {
                  q: "Are child car seats available for airport travel?",
                  a: "Yes, we provide booster and forward/rear-facing toddler car seats upon request. Please specify your requirements when reserving."
                }
              ].map((faq, i) => (
                <div key={i} className="p-6 bg-secondary/50 border border-border space-y-2 shadow-sm">
                  <h3 className="font-serif font-black italic uppercase text-base text-foreground">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative flex items-center justify-center overflow-hidden border-t border-border">
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6 space-y-6">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground leading-tight">
              Arrive In <span className="text-gradient-gold">Seattle</span> With Ease
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-xl">
                  Secure Your Reservation
                </Button>
              </Link>
              <Link href="tel:+12063274411" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-card rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest gap-2">
                  <Phone className="h-4 w-4" />
                  Direct Priority Line
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  );
}
