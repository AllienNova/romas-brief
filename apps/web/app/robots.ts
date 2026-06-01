import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: [
      "https://romasbrief.vercel.app/sitemap.xml",
      "https://romasbrief.vercel.app/news-sitemap.xml",
    ],
    host: "https://romasbrief.vercel.app",
  };
}
