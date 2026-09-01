import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Clock, 
  Lock, 
  Briefcase, 
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Executive Chauffeur Seattle | Corporate Car Service - Luna Limo",
  description: "Elite executive chauffeur services in Seattle. Professional private drivers for corporate travel, business meetings, and high-profile events. Discretion and luxury guaranteed.",
  keywords: ["Luna Limo", "executive chauffeur Seattle", "corporate car service Seattle", "private driver Seattle", "business travel Seattle", "luxury chauffeur Seattle", "corporate transportation Seattle"],
  alternates: {
    canonical: "https://lunalimoz.com/services/executive-chauffeur-seattle"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you offer corporate accounts for businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Luna Limo offers streamlined corporate accounts with priority booking, consolidated billing, and dedicated account managers for Seattle businesses."
      }
    },
    {
      "@type": "Question",
      "name": "Can I book a chauffeur for multiple days?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We offer daily, weekly, and monthly chauffeur services for extended business trips, conferences, and ongoing corporate transportation needs."
      }
    },
    {
      "@type": "Question",
      "name": "What areas do you serve for executive transportation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We serve the entire Seattle metropolitan area including Downtown Seattle, Bellevue, Redmond, Kirkland, and surrounding areas."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Executive Chauffeur Service",
  "provider": {
    "@type": "Organization",
    "name": "Luna Limo",
    "url": "https://lunalimoz.com"
  },
  "areaServed": {
    "@type": "City",
    "name": "Seattle"
  },
  "description": "Professional executive chauffeur service for corporate travel, business meetings, and high-profile events in Seattle.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "95.00",
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
    { "@type": "ListItem", "position": 3, "name": "Executive Chauffeur", "item": "https://lunalimoz.com/services/executive-chauffeur-seattle" }
  ]
};

export default function ExecutiveChauffeurPage() {
  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-gold" />,
      title: "Uncompromising Discretion",
      desc: "Our chauffeurs are strictly trained in executive confidentiality and nondisclosure for your sensitive business travels."
    },
    {
      icon: <Clock className="h-6 w-6 text-gold" />,
      title: "Absolute Punctuality",
      desc: "In business, time is the ultimate currency. We arrive early, every single time, without exception."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-gold" />,
      title: "Corporate Accounts",
      desc: "Streamlined billing, itemized receipts, and priority dispatch for Seattle's leading executive teams."
    }
  ];

  const features = [
    "Complimentary High-Speed Wi-Fi & Device Charging",
    "Bottled Water & Chilled Refreshments",
    "Quiet Cabin Environment For Calls",
    "Expert Knowledge Of Seattle & Eastside Traffic Patterns",
    "Bilingual & Suit-Attired Chauffeurs",
    "Real-Time Schedule & Flight Monitoring"
  ];

  return (
    <div className="bg-background text-foreground min-h-screen font-sans transition-colors duration-200">
      <main>
        {/* Luxury Hero Section */}
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
                <Lock className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Elite Corporate Standard</span>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
                Executive <span className="text-gold">Chauffeur</span> <br />
                Service Seattle
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Experience the pinnacle of corporate mobility. Our dedicated executive chauffeurs provide seamless, quiet, and discreet transportation across Seattle, Bellevue, and Redmond.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    Reserve Your Chauffeur
                  </Button>
                </Link>
                <Link href="tel:+12063274411" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">
                    Corporate Concierge
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[280px] sm:h-[400px] lg:h-[450px]">
              <Image 
                src="/fleet_black_bg.png" 
                alt="Executive Chauffeur Fleet Seattle" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain grayscale hover:grayscale-0 transition-all duration-700 p-4"
                priority
              />
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-16 sm:py-24 bg-card border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="p-8 bg-secondary/50 border border-border text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                    {benefit.icon}
                  </div>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Service Value */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Corporate Standard</span>
                <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground">Your Mobile Executive Suite</h2>
              </div>
              
              <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  Navigating Seattle traffic between Amazon HQ, the waterfront, and Eastside tech campuses requires more than just a driver—it requires a mobile sanctuary.
                </p>
                <p>
                  Whether you are finalizing a tech acquisition or preparing for a board meeting at the Columbia Center, our executive fleet is configured to ensure continuous productivity and calm.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                    <span className="text-xs font-bold text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-card border border-border overflow-hidden">
               <Image 
                 src="/fleet.png" 
                 alt="Luxury Executive Sedan Fleet" 
                 fill
                 sizes="(max-width: 1024px) 100vw, 50vw"
                 loading="lazy"
                 className="object-cover grayscale hover:grayscale-0 transition-all duration-700 p-4"
               />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative overflow-hidden border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
             <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase leading-tight text-foreground">
               Elevate Your Corporate <br />
               <span className="text-gradient-gold">Travel Standards</span>
             </h2>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
               <Link href="/booking" className="w-full sm:w-auto">
                 <Button className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest w-full sm:w-auto shadow-xl">
                   Reserve Executive Ride
                 </Button>
               </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                 <Button variant="outline" className="border-border text-foreground hover:bg-card rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest w-full sm:w-auto">
                   Corporate Accounts
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
