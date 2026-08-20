import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ConvexProvider } from "@/lib/convex/provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "@/lib/env";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"], display: "swap" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], variable: "--font-serif", weight: "400", display: "swap" });

export const metadata: Metadata = {
  applicationName: "Luna Limo",
  title: {
    default: "Luna Limo | Luxury Chauffeur & Executive Car Service Seattle",
    template: "%s | Luna Limo"
  },
  description: "Experience the pinnacle of luxury travel with Luna Limo. Seattle's premier chauffeur service for executive airport transfers, corporate events, and bespoke private journeys. 24/7 reliability and professional service.",
  keywords: ["Luna Limo", "Seattle Limo", "Chauffeur Service Seattle", "Airport Transfer Seattle", "Luxury Car Service", "Executive Transportation", "Black Car Service", "Sea-Tac Limo"],
  authors: [{ name: "Luna Limo" }],
  creator: "Luna Limo",
  publisher: "Luna Limo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Luna Limo | Elite Chauffeur & Executive Car Service",
    description: "Seattle's premier luxury transportation provider. Professional chauffeurs and a high-end fleet for every journey.",
    url: "https://lunalimoz.com",
    siteName: "Luna Limo",
    locale: "en_US",
    type: "website",
    images: ["/luna-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna Limo | Luxury Chauffeur Service",
    description: "Experience luxury travel in Seattle with Luna Limo. Professional, reliable, and elegant.",
    images: ["/luna-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/luna-logo.png?v=1",
    shortcut: "/luna-logo.png?v=1",
    apple: "/luna-logo.png?v=1",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Luna Limo",
    "alternateName": "Luna Limoz",
    "image": "https://lunalimoz.com/luna-logo.png",
    "@id": "https://lunalimoz.com",
    "url": "https://lunalimoz.com",
    "telephone": "+12063274411",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1902 E Yesler way",
      "addressLocality": "Seattle",
      "addressRegion": "WA",
      "postalCode": "98122",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.6062,
      "longitude": -122.3321
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://facebook.com/lunalimo",
      "https://instagram.com/lunalimo"
    ],
    "areaServed": [
      { "@type": "City", "name": "Seattle" },
      { "@type": "City", "name": "Bellevue" },
      { "@type": "City", "name": "Redmond" },
      { "@type": "City", "name": "Kirkland" },
      { "@type": "City", "name": "Tacoma" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Luna Limo",
    "alternateName": "Luna Limoz",
    "url": "https://lunalimoz.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lunalimoz.com/fleet?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Luna Limo",
    "url": "https://lunalimoz.com",
    "logo": "https://lunalimoz.com/luna-logo.png",
    "sameAs": [
      "https://facebook.com/lunalimo",
      "https://instagram.com/lunalimo"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-206-327-4411",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  }
];

import { Header } from "@/components/global/header";
import { Footer } from "@/components/global/footer";
import { WhatsAppSupport } from "@/components/global/whatsapp-support";
import { PushAlertManager } from "@/components/global/push-alert-manager";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased dark`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="h-full min-h-screen bg-background text-foreground font-sans flex flex-col">
          <ConvexProvider>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <WhatsAppSupport />
            <PushAlertManager />
          </ConvexProvider>
          <Suspense fallback={null}>
            <Analytics />
            <SpeedInsights />
          </Suspense>
          <GoogleAnalytics gaId="G-RTFJR2VRZG" />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}