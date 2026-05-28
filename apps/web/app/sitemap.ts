import type { MetadataRoute } from "next";

const BASE_URL = "https://romasbrief.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/regions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/listen`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/issues`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Category pages
    { url: `${BASE_URL}/categories/ai`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/categories/clinical-rt`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/categories/physics`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/categories/regulatory`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/categories/guidelines`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/categories/reimbursement`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    // Region pages
    { url: `${BASE_URL}/regions/us`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/regions/europe`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/regions/uk`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/regions/apac`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    // Audience pages
    { url: `${BASE_URL}/for/physicians`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/for/physicists`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/for/dosimetrists`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/for/therapists`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/for/residents`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  return staticRoutes;
}
