import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Clock, 
  Shield, 
  Star, 
  Plane, 
  MapPin, 
  CheckCircle,
  Calendar,
  Phone,
  ArrowRight
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
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* Navigation Wrapper (Simulated since header is global) */}
        
        {/* Hero Section */}
        <section className="relative py-20 sm:py-36 px-4 sm:px-6 overflow-hidden bg-black text-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8 z-10">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 animate-fade-in">Sea-Tac Executive Transfers</h3>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-white leading-tight tracking-tight">
                Seattle Airport <br />
                <span className="text-gold">Limo Service</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-lg text-neutral-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed uppercase tracking-widest">
                Reliable, punctual, and sophisticated transportation for discerning travelers. We monitor your flight 24/7 to ensure seamless Sea-Tac arrivals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl border-b-4 border-gold-dark flex items-center justify-center gap-3 active:scale-95 transition-transform">
                    <Calendar className="h-4 w-4" />
                    Book Sea-Tac Ride
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-neutral-800 text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <Phone className="h-4 w-4" />
                    Call (206) 327-4411
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[300px] sm:h-[500px] lg:h-[600px] grayscale hover:grayscale-0 transition-all duration-1000">
               <Image 
                src="/fleet_black_bg.png" 
                alt="Seattle Airport Limo - Fleet at Sea-Tac" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>
          </div>
          
          {/* Decorative Plane Icon Background */}
          <div className="absolute -top-20 -right-20 opacity-5 pointer-events-none">
            <Plane className="h-[400px] w-[400px] text-gold -rotate-12" />
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 bg-neutral-900 border-y border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Standard</h3>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-white">Why Book With Luna?</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  title: "Flight Tracking",
                  desc: "We monitor all commercial flights in real-time. If you're early or late, we adjust to you.",
                  icon: <Globe className="h-8 w-8 text-gold" />
                },
                {
                  title: "Meet & Greet",
                  desc: "Your chauffeur awaits at baggage claim with a personalized digital signage.",
                  icon: <CheckCircle className="h-8 w-8 text-gold" />
                },
                {
                  title: "Wait Time Included",
                  desc: "Enjoy 60 minutes of complimentary wait time on all international arrivals.",
                  icon: <Clock className="h-8 w-8 text-gold" />
                },
                {
                  title: "Fixed Pricing",
                  desc: "No hidden fees, no surge pricing. Know your exact rate before you ride.",
                  icon: <Shield className="h-8 w-8 text-gold" />
                }
              ].map((benefit, i) => (
                <div key={i} className="p-8 bg-black border border-neutral-800 hover:border-gold/30 transition-all text-center space-y-6">
                  <div className="flex justify-center">{benefit.icon}</div>
                  <h4 className="font-serif text-lg font-black italic uppercase text-white tracking-wide">{benefit.title}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed italic">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section (SEO Heavy) */}
        <section className="py-24 px-4 sm:px-6 bg-black">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black italic uppercase text-white border-l-4 border-gold pl-8">
                The Premier Sea-Tac Limo Experience
              </h2>
              <div className="grid md:grid-cols-2 gap-12 text-neutral-400 text-sm leading-relaxed font-medium uppercase tracking-tight">
                <p>
                  Navigating the Pacific Northwest's busiest transit hub should be an experience of absolute comfort, not stress. Luna Limo provides a seamless transition from the runway to your final destination. Whether you are arriving for a corporate summit in Downtown Seattle or returning home to Bellevue, our chauffeurs provide a sanctuary of luxury.
                </p>
                <p>
                  Our airport transfer services go beyond simple transportation. From the moment you touch down at Seattle-Tacoma International Airport (SEA), our dispatch team manages every logistical detail. Our fleet of late-model SUVs and Executive Sedans are meticulously cleaned and stocked with premium amenities, ensuring your post-flight journey is nothing short of exceptional.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-white">Seattle proper</h4>
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-loose">
                  Executive transport to the Financial District, Capitol Hill, Queen Anne, and South Lake Union.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-white">Eastside Hubs</h4>
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-loose">
                  Reliable transfers to Bellevue, Redmond (Microsoft Campus), Kirkland, and Issaquah.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gold" />
                  <h4 className="font-serif font-black italic uppercase text-white">Terminal Access</h4>
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-loose">
                  Direct curbside drop-offs and baggage claim pickups for all major airlines and private FBOs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-24 px-4 sm:px-6 bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">Concierge Clarification</h3>
              <h2 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white">SEA-TAC FAQ</h2>
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
                  a: "Our Premium SUVs accommodate up to 6-7 passengers with luggage, while our Executive Sedans are perfect for up to 3 passengers."
                },
                {
                  q: "Are car seats available for family airport travel?",
                  a: "Yes, we provide booster and toddler seats upon request. Please specify your requirements during the booking process."
                }
              ].map((faq, i) => (
                <div key={i} className="p-8 bg-black border border-neutral-800 group hover:border-gold/30 transition-all">
                  <h4 className="font-serif font-black italic uppercase text-lg text-gold mb-3">{faq.q}</h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-black relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gold/5 blur-[150px] rounded-full translate-y-32" />
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl font-black italic uppercase text-white mb-12 leading-tight">
              Arrive In <span className="text-gold">Seattle</span> With Style
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-widest border-b-4 border-gold-dark shadow-2xl">
                  Secure Your Reservation
                </Button>
              </Link>
              <Link href="tel:+12063274411" className="w-full sm:w-auto">
                 <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-widest transition-all gap-3">
                  <Phone className="h-5 w-5" />
                  Direct Priority line
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

       {/* Footer */}
       <footer className="bg-neutral-900 border-t border-neutral-800 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <h2 className="font-serif text-3xl font-black italic uppercase text-gold">Luna Limo</h2>
          <nav className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
            <Link href="/fleet" className="hover:text-gold transition-colors">Fleet</Link>
            <Link href="/reservations" className="hover:text-gold transition-colors">Reservations</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">Support</Link>
          </nav>
          <div className="pt-8 border-t border-neutral-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-600">
              © 2026 Luna Limo. Professional Excellence Dedicated To Your Journey.
            </p>
            <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600">
               <span>Seattle Limo Service</span>
               <span>Sea-Tac Airport Transfer</span>
            </div>
          </div>
        </div>
      </footer>

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
