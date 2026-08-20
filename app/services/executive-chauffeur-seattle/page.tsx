import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Clock, 
  MapPin, 
  Coffee, 
  Wifi, 
  Lock, 
  Briefcase, 
  PhoneCall, 
  CheckCircle2,
  Car
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
      title: "Umpromising Discretion",
      desc: "Our chauffeurs are trained in executive-level privacy and nondisclosure for your sensitive business travels."
    },
    {
      icon: <Clock className="h-6 w-6 text-gold" />,
      title: "Absolute Punctuality",
      desc: "In business, time is the only currency. We arrive 15 minutes early, every single time, without exception."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-gold" />,
      title: "Corporate Accounts",
      desc: "Streamlined billing and priority booking for Seattle's leading enterprises and executive teams."
    }
  ];

  const features = [
    "Complimentary High-Speed Wi-Fi",
    "Bottled Water & Premium Refreshments",
    "USB & Multi-Device Charging Ports",
    "Expert Knowledge of Seattle Traffic Patterns",
    "Bilingual Chauffeurs Available Upon Request",
    "Real-Time Schedule Monitoring"
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <main>
        {/* Luxury Hero Section */}
        <section className="relative min-h-[70vh] flex items-center pt-24 overflow-hidden">
          <Image
            src="/fleet_black_bg.png"
            alt="Executive chauffeur fleet"
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover scale-105 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-black/40 z-[1]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gold/10 border border-gold/20 rounded-none backdrop-blur-md">
                <Lock className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Elite Executive Standard</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black italic uppercase italic leading-[0.95] tracking-tighter">
                Executive <span className="text-gold">Chauffeur</span> <br />
                Service Seattle
              </h1>
              
              <p className="text-sm sm:text-lg text-neutral-300 max-w-xl font-medium leading-relaxed uppercase tracking-wider">
                Experience the pinnacle of corporate mobility. Our dedicated executive chauffeurs provide seamless, quiet, and professional transportation across the Pacific Northwest.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/booking">
                  <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-10 py-7 text-[10px] font-black uppercase tracking-[0.3em] border-b-4 border-gold-dark">
                    Reserve Your Chauffeur
                  </Button>
                </Link>
                <Link href="tel:+12063274411">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:border-gold hover:text-gold text-white rounded-none px-10 py-7 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm">
                    Corporate Concierge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-24 border-b border-neutral-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="group p-8 bg-neutral-950 border border-neutral-900 hover:border-gold/30 transition-all duration-500">
                  <div className="mb-6 inline-block p-4 bg-neutral-900 group-hover:bg-gold transition-colors">
                    {benefit.icon}
                  </div>
                  <h3 className="font-serif text-xl font-black italic uppercase mb-4 text-white">{benefit.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium uppercase tracking-[0.05em]">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Service Value */}
        <section className="py-24 bg-neutral-950/50">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.5em]">The Corporate Standard</h2>
                <h3 className="font-serif text-3xl sm:text-5xl font-black italic uppercase italic tracking-tight">Your Office On The Move</h3>
              </div>
              
              <div className="prose prose-invert prose-neutral max-w-none">
                <p className="text-neutral-400 text-lg leading-relaxed">
                  Navigating Seattle's traffic between Amazon HQ, the Waterfront, and Eastside tech hubs requires more than just a driver—it requires a mobile state-of-the-art office. 
                </p>
                <p className="text-neutral-500 font-medium">
                  Whether you are finalizing a tech merger or preparing for a board meeting at the Columbia Center, our executive fleet is equipped to ensure your productivity never pauses.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square">
               <div className="absolute inset-0 bg-gold/10 animate-pulse" />
               <div className="absolute inset-0 border border-neutral-800 rotate-3 group-hover:rotate-0 transition-transform duration-700" />
               <Image 
                 src="/fleet.png" 
                 alt="Luxury Executive Sedan Interior" 
                 width={600}
                 height={600}
                 sizes="(max-width: 1024px) 100vw, 50vw"
                 loading="lazy"
                 className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black border border-neutral-800 p-8 hidden md:flex flex-col justify-center gap-2">
                  <p className="text-gold font-serif text-4xl font-black italic tracking-tighter">0%</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">Compromise on Safety & Discretion</p>
               </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold z-0" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 z-[1]" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-12 text-black">
             <h3 className="font-serif text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-tight">
               ELEVATE YOUR CORPORATE <br />
               TRAVEL STANDARDS
             </h3>
             <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link href="/booking">
                 <Button className="bg-black hover:bg-neutral-900 text-white rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-[0.3em] w-full sm:w-auto shadow-2xl">
                   Open Corporate Account
                 </Button>
               </Link>
                <Link href="/contact">
                 <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-[0.3em] w-full sm:w-auto transition-all">
                   Contact Logistics Team
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
