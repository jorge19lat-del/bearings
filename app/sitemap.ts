import type { MetadataRoute } from "next";
import { entryHref, getAllSeries, siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const series = getAllSeries();
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/series`, changeFrequency: "monthly", priority: 0.8 },
    ...series.map((s) => ({ url: `${base}/series/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...series.flatMap((s) =>
      s.entries.map((e) => ({ url: `${base}${entryHref(s, e)}`, changeFrequency: "yearly" as const, priority: 0.9 }))
    ),
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
