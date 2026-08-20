import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Calendar, 
  Camera, 
  GlassWater, 
  Sparkles, 
  Gem, 
  CheckCircle2,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Seattle Wedding Limo | Luxury Wedding Transportation - Luna Limo",
  description: "Make your special day perfect with Seattle's premier wedding limo service. Elegant bridal cars, wedding party transportation, and professional chauffeurs. Red carpet service included.",
  keywords: ["Luna Limo", "Seattle wedding limo", "wedding transportation Seattle", "bridal car Seattle", "wedding chauffeur Seattle", "luxury wedding car Seattle", "prom limo Seattle"],
  alternates: {
    canonical: "https://lunalimoz.com/services/seattle-wedding-limo"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How far in advance should I book a wedding limo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking your wedding limo 6-12 months in advance, especially for peak wedding season (May-October). This ensures availability of your preferred vehicle."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide decorations for wedding vehicles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer customizable vehicle decorations including ribbons, flowers, and 'Just Married' signs upon request. Please discuss your preferences during booking."
      }
    },
    {
      "@type": "Question",
      "name": "Can you coordinate multiple vehicles for a wedding party?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. Luna Limo can coordinate a fleet of matching vehicles for the entire wedding party, including shuttles for guests between venues."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Wedding Limo Service",
  "provider": {
    "@type": "Organization",
    "name": "Luna Limo",
    "url": "https://lunalimoz.com"
  },
  "areaServed": {
    "@type": "City",
    "name": "Seattle"
  },
  "description": "Luxury wedding limousine service with red carpet, champagne toast, and professional chauffeurs for your special day in Seattle.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "299.00",
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
    { "@type": "ListItem", "position": 3, "name": "Wedding Limo", "item": "https://lunalimoz.com/services/seattle-wedding-limo" }
  ]
};

export default function WeddingLimoPage() {
  const steps = [
    {
      icon: <Sparkles className="h-6 w-6 text-gold" />,
      title: "Red Carpet Standard",
      desc: "Every wedding comes with a full red-carpet rollout to ensure your grand entrance is truly unforgettable."
    },
    {
      icon: <GlassWater className="h-6 w-6 text-gold" />,
      title: "Complimentary Toast",
      desc: "Chilled premium refreshments and a complimentary champagne toast to celebrate your first journey together."
    },
    {
      icon: <Camera className="h-6 w-6 text-gold" />,
      title: "Photo-Ready Fleet",
      desc: "Our vehicles are meticulously detailed 2 hours before pickup to ensure they are pristine for your wedding photos."
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <main>
        {/* Wedding Hero Section */}
        <section className="relative min-h-[75vh] flex items-center pt-24 overflow-hidden">
          <Image
            src="/fleet.png"
            alt="Wedding limo fleet"
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover scale-105 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-[1]" />
          <div className="absolute inset-0 bg-black/40 z-[1] backdrop-blur-[1px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-none backdrop-blur-xl">
                <Heart className="h-3 w-3 text-gold fill-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Your Special Day, Our Elite Care</span>
              </div>
              
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black italic uppercase leading-[0.9] tracking-tighter">
                Seattle <span className="text-gold">Wedding</span> <br />
                Limo Excellence
              </h1>
              
              <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-widest leading-loose">
                Arrive in elegance. From the morning preparations to the grand exit, our wedding specialists manage every detail of your transportation so you can focus on the magic.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link href="/booking">
                  <Button className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all">
                    Check Wedding Dates
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white hover:text-black text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-sm transition-all">
                    Custom Wedding Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Wedding Promise */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-24 space-y-4">
                <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.5em]">The Wedding Promise</h2>
                <h3 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tighter">Impeccable Logistics For Your Vows</h3>
             </div>

            <div className="grid lg:grid-cols-3 gap-16">
              {steps.map((step, i) => (
                <div key={i} className="text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rotate-45 flex items-center justify-center">
                      <div className="-rotate-45">{step.icon}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-serif text-2xl font-black italic uppercase text-white">{step.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Wedding Gallery / Info */}
        <section className="py-32 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
             <div className="relative order-2 md:order-1">
                <div className="aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden group">
                  <Image 
                    src="/contact.png" 
                    alt="Luxury Wedding Getaway Car" 
                    width={600}
                    height={750}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>
                <div className="absolute -top-10 -left-10 w-48 h-48 border border-gold/30 hidden lg:block -z-10" />
             </div>

             <div className="space-y-12 order-1 md:order-2">
                <div className="space-y-4">
                   <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.5em]">A Perfect Fit</h2>
                   <h3 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tight">Fleet Options for Every Guest</h3>
                </div>
                
                <p className="text-neutral-400 text-lg leading-relaxed font-black font-sans uppercase tracking-widest">
                   From the <span className="text-white">classic luxury of an S-Class sedan</span> for the couple, to <span className="text-white">high-capacity stretch limousines</span> for the wedding party, we provide a unified fleet aesthetic.
                </p>

                <div className="space-y-6">
                  {[
                    "Customizable vehicle decorations (available upon request)",
                    "Coordinated route planning for multiple photo locations",
                    "Shuttle services for guests between venue and hotel",
                    "Professional chauffeurs in full formal attire",
                    "Stress-free itinerary management"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8">
                   <Link href="tel:+12063274411" className="inline-flex flex-col gap-2 group">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 group-hover:text-gold transition-colors">Speak with a Wedding Specialist</span>
                      <span className="font-serif text-4xl font-black italic uppercase text-white group-hover:text-gold transition-colors tracking-tighter">(206) 327-4411</span>
                   </Link>
                </div>
             </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-32 bg-black border-t border-neutral-900">
           <div className="max-w-4xl mx-auto px-12 text-center space-y-12">
              <Gem className="h-12 w-12 text-gold mx-auto" />
              <h2 className="font-serif text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
                LOCK IN YOUR <br />
                WEDDING DATE TODAY
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link href="/booking">
                   <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.4em] shadow-gold/20 shadow-2xl">
                     Book Your Fleet
                   </Button>
                 </Link>
                 <Link href="/contact">
                   <Button variant="outline" className="w-full sm:w-auto border-neutral-800 hover:border-white text-white rounded-none px-12 py-8 text-[11px] font-black uppercase tracking-[0.4em]">
                     Inquiry Wedding Packages
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
