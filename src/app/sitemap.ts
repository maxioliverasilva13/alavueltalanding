import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getLandingData } from "@/lib/api";
import { landingPublicUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const subdomain = h.get("x-subdomain");
  if (!subdomain) return [];

  const data = await getLandingData(subdomain);
  if (!data?.empresa) return [];

  const url = landingPublicUrl(subdomain);
  const lastModified = new Date();

  return [
    {
      url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

export const dynamic = "force-dynamic";
