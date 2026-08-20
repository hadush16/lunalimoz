import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Map, 
  Wine, 
  Camera, 
  Music, 
  Users, 
  CheckCircle2,
  ChevronRight,
  Star
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
      title: "Woodinville Wine Safely",
      desc: "Visit Washington's premier wineries without the worry. Our chauffeurs handle the driving so you can savor every glass."
    },
    {
      icon: <Compass className="h-6 w-6 text-gold" />,
      title: "Tailored Sightseeing",
      desc: "From the Space Needle to Snoqualmie Falls, create a custom itinerary that fits your group's unique interests."
    },
    {
      icon: <Users className="h-6 w-6 text-gold" />,
      title: "Group Flexibility",
      desc: "Our high-capacity SUVs and multi-passenger limos mean the whole group can enjoy the journey together."
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <main>
        {/* Leisure Hero Section */}
        <section className="relative min-h-[75vh] flex items-center pt-24 overflow-hidden">
          <Image
            src="/fleet.png"
            alt="Seattle city tour fleet"
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover scale-105 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-black/50 z-[1] backdrop-blur-[1px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="max-w-3xl space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gold/10 border border-gold/20 rounded-none backdrop-blur-md">
                <Compass className="h-3 w-3 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold">Discover The Northwest</span>
              </div>
              
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black italic uppercase leading-[0.9] tracking-tighter">
                Seattle <span className="text-gold">City</span> & <br />
                Wine Tours
              </h1>
              
              <p className="text-sm sm:text-lg text-neutral-300 max-w-xl font-medium leading-relaxed uppercase tracking-widest leading-loose">
                Uncover the hidden gems of Seattle and the world-class wineries of Woodinville from the luxury of your private limousine.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Link href="/booking">
                  <Button className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all">
                    Book A Private Tour
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white hover:text-black text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-sm transition-all">
                    Custom Itinerary Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Highlights */}
        <section className="py-24 border-b border-neutral-900">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
            {highlights.map((item, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rotate-45 flex items-center justify-center group-hover:bg-gold transition-all duration-500">
                  <div className="-rotate-45 group-hover:text-black transition-colors">{item.icon}</div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-black italic uppercase text-white">{item.title}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Destination Section */}
        <section className="py-32 bg-neutral-950/40 relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-20 items-center">
             <div className="flex-1 space-y-12">
                <div className="space-y-4">
                   <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.5em]">The Ultimate Package</h2>
                   <h3 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tight">Luxury Beyond The Destination</h3>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-neutral-400 text-lg leading-relaxed uppercase font-black font-sans tracking-widest">
                    Your journey through <span className="text-white">Chateau Ste. Michelle</span>, <span className="text-white">Delille Cellars</span>, or the <span className="text-white">Pike Place Market</span> isn't just about where you go—it's about the <span className="text-gold">comfort and elegance</span> of how you get there.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                   {[
                     "Iced Premium Bar Service available",
                     "Bluetooth Audio for custom playlists",
                     "Flexible hourly rates & wait service",
                     "Local Seattle-expert chauffeurs",
                     "Multiple photography stops included",
                     "Door-to-door hotel service"
                   ].map((feature, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <CheckCircle2 className="h-4 w-4 text-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">{feature}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="flex-1 w-full max-w-2xl relative">
                <div className="absolute -inset-10 bg-gold/5 blur-[120px] rounded-full" />
                <div className="relative aspect-[16/10] bg-neutral-900 border border-neutral-800 p-2 overflow-hidden">
                   <Image 
                    src="/luxury_hero_bg.png" 
                    alt="Luxury Tour Vehicle in Seattle" 
                    width={800}
                    height={500}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="w-full h-full object-cover filter brightness-75 hover:brightness-100 transition-all duration-1000"
                   />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-neutral-900 border border-neutral-800 p-8 max-w-[200px] space-y-3">
                   <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-gold fill-gold" />)}
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300">"The absolute best way to see the city. Our driver knew all the best photo spots!"</p>
                   <p className="text-[8px] font-bold text-gold italic">— Sarah J., Corporate Retreat</p>
                </div>
             </div>
           </div>
        </section>

        {/* Leisure Call to Action */}
        <section className="py-32 relative text-center">
           <div className="max-w-4xl mx-auto px-6 space-y-12">
              <h3 className="font-serif text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-tight">
                WRITE YOUR OWN <br />
                <span className="text-gold italic">SEATTLE STORY</span>
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Link href="/booking">
                   <Button className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl">
                     Book Your Tour Limo
                   </Button>
                 </Link>
                 <Link href="tel:+12063274411">
                    <Button variant="outline" className="w-full sm:w-auto border-neutral-800 hover:border-gold hover:text-gold text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all">
                      Inquire Custom Packages
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
