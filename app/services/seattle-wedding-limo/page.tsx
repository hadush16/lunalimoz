import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  GlassWater, 
  Sparkles, 
  Gem, 
  CheckCircle2, 
  Camera 
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
      desc: "Every wedding transfer comes with a red-carpet rollout to ensure your grand entrance is truly unforgettable."
    },
    {
      icon: <GlassWater className="h-6 w-6 text-gold" />,
      title: "Complimentary Toast",
      desc: "Chilled premium refreshments and a complimentary champagne toast to celebrate your first ride as newlyweds."
    },
    {
      icon: <Camera className="h-6 w-6 text-gold" />,
      title: "Photo-Ready Fleet",
      desc: "Our vehicles are meticulously detailed prior to arrival to ensure pristine backdrops for your wedding photography."
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen font-sans transition-colors duration-200">
      <main>
        {/* Wedding Hero Section */}
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
                <Heart className="h-3.5 w-3.5 text-gold fill-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Your Special Day, Our Elite Care</span>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
                Seattle <span className="text-gold">Wedding</span> <br />
                Limo Service
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Arrive in timeless elegance. From bridal party transfers to the newlywed grand exit, our wedding coordinators manage every logistical detail so you can savor every moment.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    Reserve Wedding Fleet
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">
                    Wedding Concierge
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[280px] sm:h-[400px] lg:h-[450px]">
              <Image 
                src="/fleet.png" 
                alt="Seattle Wedding Limousine Fleet" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain grayscale hover:grayscale-0 transition-all duration-700 p-4"
                priority
              />
            </div>
          </div>
        </section>

        {/* The Wedding Promise */}
        <section className="py-16 sm:py-24 bg-card border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-12 sm:mb-16 space-y-3">
                <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Wedding Promise</span>
                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground">Impeccable Logistics For Your Vows</h2>
             </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="p-8 bg-secondary/50 border border-border text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Wedding Gallery / Info */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
             <div className="space-y-6">
                <div className="space-y-2">
                   <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">A Perfect Fit</span>
                   <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground">Fleet Options For Every Occasion</h2>
                </div>
                
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                   From late-model executive SUVs and sedans for the couple to high-capacity Mercedes-Benz Sprinter vans for the bridal party and guests, we ensure unified luxury styling across all vehicles.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    "Customizable vehicle decorations upon advance request",
                    "Coordinated route planning for multiple scenic photo locations",
                    "Continuous shuttle options for guests between venue and hotels",
                    "Chauffeurs in full professional black-tie formal attire",
                    "Direct liaison with your wedding planner or venue coordinator"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                       <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                       <span className="text-xs font-bold text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                   <Link href="tel:+12063274411" className="inline-flex flex-col gap-1 group">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-gold transition-colors">Speak With A Wedding Specialist</span>
                      <span className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-foreground group-hover:text-gold transition-colors">(206) 327-4411</span>
                   </Link>
                </div>
             </div>

             <div className="relative aspect-[4/3] bg-card border border-border overflow-hidden">
                <Image 
                  src="/luxury_suv.png" 
                  alt="Luxury Wedding Getaway Car" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  className="object-contain p-6 grayscale hover:grayscale-0 transition-all duration-700"
                />
             </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative overflow-hidden border-t border-border">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <Gem className="h-10 w-10 text-gold mx-auto" />
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase leading-tight text-foreground">
                Secure Your <span className="text-gradient-gold">Wedding Date</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                 <Link href="/booking" className="w-full sm:w-auto">
                   <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-xl">
                     Book Your Fleet
                   </Button>
                 </Link>
                 <Link href="/contact" className="w-full sm:w-auto">
                   <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-card rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest">
                     Custom Packages
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
