import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Wine, 
  Users, 
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Seattle City Tours & Woodinville Wine Limo | Luxury Sightseeing - Luna Limo",
  description: "Explore the Pacific Northwest in style. Premium Seattle city tours, Woodinville wine tasting transportation, and private sightseeing in luxury limousines and SUVs.",
  keywords: ["Luna Limo", "Seattle city tour limo", "Woodinville wine tour", "Seattle sightseeing limo", "private wine tour Seattle", "luxury tour car Seattle", "Seattle limo tour"],
  alternates: {
    canonical: "https://lunalimoz.com/services/seattle-city-tour-limo"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long is a typical Seattle city tour?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our Seattle city tours typically range from 3-6 hours depending on your itinerary. We customize each tour to include your preferred landmarks and attractions."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer Woodinville wine tours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our Woodinville wine tours include visits to premier wineries like Chateau Ste. Michelle and Delille Cellars with a professional chauffeur so you can enjoy every tasting safely."
      }
    },
    {
      "@type": "Question",
      "name": "Can you customize the tour route?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. Every tour is fully customizable. Our chauffeurs know the best photo spots and hidden gems throughout Seattle and the Pacific Northwest."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "City Tour & Wine Tour Limo Service",
  "provider": {
    "@type": "Organization",
    "name": "Luna Limo",
    "url": "https://lunalimoz.com"
  },
  "areaServed": {
    "@type": "City",
    "name": "Seattle"
  },
  "description": "Luxury city tour and wine tour limousine service in Seattle and Woodinville. Customizable itineraries with professional chauffeurs.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "150.00",
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
    { "@type": "ListItem", "position": 3, "name": "City Tours", "item": "https://lunalimoz.com/services/seattle-city-tour-limo" }
  ]
};

export default function CityTourLimoPage() {
  const highlights = [
    {
      icon: <Wine className="h-6 w-6 text-gold" />,
      title: "Woodinville Wine Tasting",
      desc: "Tour Washington's premier wineries without the stress. Our chauffeurs handle the driving so you can savor every vintage."
    },
    {
      icon: <Compass className="h-6 w-6 text-gold" />,
      title: "Tailored Sightseeing",
      desc: "From the Space Needle to Snoqualmie Falls, enjoy a customized Pacific Northwest itinerary designed around your preferences."
    },
    {
      icon: <Users className="h-6 w-6 text-gold" />,
      title: "Group Flexibility",
      desc: "Our executive SUVs and Mercedes-Benz Sprinter vans ensure your entire party travels together in climate-controlled luxury."
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen font-sans transition-colors duration-200">
      <main>
        {/* Leisure Hero Section */}
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
                <Compass className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Discover The Northwest</span>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
                Seattle <span className="text-gold">City</span> &amp; <br />
                Wine Tours
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Experience Seattle&apos;s iconic landmarks and Woodinville wine country with a private chauffeur. Personalized itineraries, flexible hourly packages, and door-to-door luxury.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    Book A Private Tour
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">
                    Custom Itinerary
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[280px] sm:h-[400px] lg:h-[450px]">
              <Image 
                src="/fleet.png" 
                alt="Seattle Sightseeing & Wine Tour Limousines" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain grayscale hover:grayscale-0 transition-all duration-700 p-4"
                priority
              />
            </div>
          </div>
        </section>

        {/* Experience Highlights */}
        <section className="py-16 sm:py-24 bg-card border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Curated Experiences</span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground">Northwest Sightseeing Elevated</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {highlights.map((item, i) => (
                <div key={i} className="p-8 bg-secondary/50 border border-border text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Destination Section */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-b border-border transition-colors">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
             <div className="flex-1 space-y-6">
                <div className="space-y-2">
                   <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Tour Experience</span>
                   <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground">Luxury Beyond The Destination</h2>
                </div>
                
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                  Your journey through Chateau Ste. Michelle, DeLille Cellars, Pike Place Market, or Snoqualmie Falls isn&apos;t just about where you go—it&apos;s about the comfort, tranquility, and safety of how you get there.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                   {[
                     "Chilled bottled refreshments & water included",
                     "Bluetooth audio for personalized playlists",
                     "Flexible hourly rates & wait service",
                     "Knowledgeable local Seattle chauffeurs",
                     "Multiple photography stops at scenic lookouts",
                     "Door-to-door hotel and residence pickups"
                   ].map((feature, i) => (
                     <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-xs font-bold text-foreground">{feature}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="flex-1 w-full relative">
                <div className="relative aspect-[4/3] bg-card border border-border overflow-hidden">
                   <Image 
                    src="/luxury_hero_bg.png" 
                    alt="Seattle Sightseeing Chauffeur Service" 
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                   />
                </div>
             </div>
           </div>
        </section>

        {/* Leisure Call to Action */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative text-center border-t border-border">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase leading-tight text-foreground">
                Discover Seattle <br />
                <span className="text-gradient-gold">In Total Comfort</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                 <Link href="/booking" className="w-full sm:w-auto">
                   <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-xl">
                     Book Your Tour Limo
                   </Button>
                 </Link>
                 <Link href="tel:+12063274411" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-card rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest">
                      Custom Itinerary Quote
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
