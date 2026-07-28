import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "alavueltaapp.pro";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const subdomain = h.get("x-subdomain");

  if (subdomain) {
    const origin = `https://${subdomain}.${ROOT_DOMAIN}`;
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${origin}/sitemap.xml`,
      host: origin,
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
