import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are never indexed; only production is.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
