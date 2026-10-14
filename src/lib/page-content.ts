import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { normalizeStoredHome, resolveHome, type HomeContent } from "@/lib/home-content";
import {
  normalizeStoredCustomTrip,
  resolveCustomTrip,
  type CustomTripContent,
} from "@/lib/custom-trip-content";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { classifyMedia } from "@/lib/media";

/** Slug de la página del panel cuyo contenido alimenta «Nuestra historia» mientras no se cargue otro. */
export const ABOUT_PAGE_SLUG = "nosotros";

const readContent = cache(async () => {
  try {
    const s = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { homeContent: true, customTripContent: true },
    });
    return { home: s?.homeContent ?? null, customTrip: s?.customTripContent ?? null };
  } catch {
    return { home: null, customTrip: null };
  }
});

/** Contenido del inicio: `stored` = lo cargado en el panel; `content` = lo que se muestra. */
export const getHomeContent = cache(
  async (): Promise<{ stored: HomeContent; content: HomeContent }> => {
    const { home } = await readContent();
    const stored = normalizeStoredHome(home);
    return { stored, content: resolveHome(stored) };
  },
);

export const getCustomTripContent = cache(
  async (): Promise<{ stored: CustomTripContent; content: CustomTripContent }> => {
    const { customTrip } = await readContent();
    const stored = normalizeStoredCustomTrip(customTrip);
    return { stored, content: resolveCustomTrip(stored) };
  },
);

/** Texto de la página «Nosotros» del panel (respaldo de «Nuestra historia»). */
export const getAboutPageFallback = cache(
  async (): Promise<{ title: string; subtitle: string; content: string } | null> => {
    try {
      const page = await prisma.page.findUnique({
        where: { slug: ABOUT_PAGE_SLUG },
        select: { title: true, subtitle: true, content: true, published: true },
      });
      if (!page || !page.published) return null;
      return {
        title: page.title,
        subtitle: page.subtitle ?? "",
        content: (page.content ?? "").replace(/\r\n/g, "\n"),
      };
    } catch {
      return null;
    }
  },
);

/**
 * Fotos reales de los viajes publicados (portadas primero, luego galerías),
 * para usar como respaldo cuando una sección no tiene imagen propia.
 * Nunca inventa imágenes: si no hay viajes con fotos, devuelve [].
 */
export const getTripPhotos = cache(async (): Promise<{ url: string; alt: string }[]> => {
  try {
    const exps = await prisma.expedition.findMany({
      where: publicExpeditionWhere(),
      orderBy: [{ featured: "desc" }, { homeOrder: "asc" }, { name: "asc" }],
      select: { name: true, coverImage: true, gallery: true },
      take: 12,
    });
    const covers = exps
      .filter((e) => e.coverImage)
      .map((e) => ({ url: e.coverImage as string, alt: e.name }));
    const gallery = exps.flatMap((e) =>
      e.gallery
        .filter((g) => classifyMedia(g).type === "image")
        .map((g) => ({ url: g, alt: e.name })),
    );
    const seen = new Set<string>();
    return [...covers, ...gallery].filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
  } catch {
    return [];
  }
});
