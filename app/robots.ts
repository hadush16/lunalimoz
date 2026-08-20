import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api/",
        "/_next/",
        "/proxy.ts"
      ],
    },
    sitemap: "https://lunalimoz.com/sitemap.xml",
  };
}
