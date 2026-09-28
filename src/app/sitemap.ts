import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";
import { publicExpeditionWhere } from "@/lib/expeditions-query";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/expediciones`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const [exps, pages] = await Promise.all([
      prisma.expedition.findMany({
        where: publicExpeditionWhere(),
        select: { slug: true, updatedAt: true },
      }),
      prisma.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...exps.map((e) => ({
        url: `${base}/expediciones/${e.slug}`,
        lastModified: e.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...pages.map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
