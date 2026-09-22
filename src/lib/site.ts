import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SocialLinks = {
  instagram?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  x?: string;
  vimeo?: string;
};

export type SiteSettingsData = {
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  social: SocialLinks;
  primaryColor: string;
  accentColor: string;
  theme: string;
  homeExpsTitle: string;
  homeExpsSubtitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  homeWhyTitle: string | null;
  homeWhyItems: string[];
  reviewsLabel: string | null;
  reviewsUrl: string | null;
};

const DEFAULT_TEXTS = {
  homeExpsTitle: "Próximas expediciones",
  homeExpsSubtitle: "Salidas guiadas con cupos limitados.",
  ctaTitle: "¿Buscás una expedición a medida?",
  ctaText: "Contanos qué tenés en mente y armamos la travesía con vos.",
  ctaButton: "Escribinos",
};

const FALLBACK: SiteSettingsData = {
  siteName: "Cumbre",
  tagline: "Expediciones, montañismo y fotografía de naturaleza",
  logoUrl: null,
  whatsappNumber: null,
  contactEmail: null,
  contactPhone: null,
  social: {},
  primaryColor: "#1c1917",
  accentColor: "#ea580c",
  theme: "cinematic",
  ...DEFAULT_TEXTS,
  homeWhyTitle: null,
  homeWhyItems: [],
  reviewsLabel: null,
  reviewsUrl: null,
};

/** Configuración global del sitio (fila singleton). Cacheada por request. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s) return FALLBACK;
    return {
      siteName: s.siteName,
      tagline: s.tagline,
      logoUrl: s.logoUrl,
      whatsappNumber: s.whatsappNumber,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      social: (s.social as SocialLinks) ?? {},
      primaryColor: s.primaryColor,
      accentColor: s.accentColor,
      theme: s.theme,
      homeExpsTitle: s.homeExpsTitle || DEFAULT_TEXTS.homeExpsTitle,
      homeExpsSubtitle: s.homeExpsSubtitle || DEFAULT_TEXTS.homeExpsSubtitle,
      ctaTitle: s.ctaTitle || DEFAULT_TEXTS.ctaTitle,
      ctaText: s.ctaText || DEFAULT_TEXTS.ctaText,
      ctaButton: s.ctaButton || DEFAULT_TEXTS.ctaButton,
      homeWhyTitle: s.homeWhyTitle,
      homeWhyItems: s.homeWhyItems ?? [],
      reviewsLabel: s.reviewsLabel,
      reviewsUrl: s.reviewsUrl,
    };
  } catch {
    return FALLBACK;
  }
});
