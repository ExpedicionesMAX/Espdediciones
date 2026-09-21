import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { TEXT_DEFAULTS, type SiteTexts } from "@/lib/site-texts-schema";

/** Devuelve todos los textos del sitio: los guardados sobre los defaults. Cacheado por request. */
export const getSiteTexts = cache(async (): Promise<SiteTexts> => {
  const out: SiteTexts = { ...TEXT_DEFAULTS };
  try {
    const s = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { texts: true },
    });
    const stored = (s?.texts as Record<string, unknown> | null) ?? {};
    for (const [k, v] of Object.entries(stored)) {
      if (typeof v === "string" && v.trim()) out[k] = v;
    }
  } catch {
    // usa los defaults
  }
  return out;
});
