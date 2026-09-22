import { z } from "zod";
import { clean, optString, optUrl } from "./fields";

export const settingsInputSchema = z.object({
  siteName: z.string().trim().min(1, "El nombre del sitio es obligatorio"),
  tagline: optString,
  logoUrl: optUrl,
  whatsappNumber: optString, // se normaliza a solo dígitos en la acción
  contactEmail: z.preprocess(clean, z.string().email("Email inválido").optional()),
  contactPhone: optString,
  accentColor: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z
      .string()
      .regex(/^#([0-9a-fA-F]{6})$/, "Usá un color hex, ej. #ea580c")
      .default("#ea580c"),
  ),
  displayFont: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(["editorial", "aventura", "impacto", "moderno"]).default("aventura"),
  ),
  social: z
    .object({
      instagram: optUrl,
      youtube: optUrl,
      facebook: optUrl,
      tiktok: optUrl,
      linkedin: optUrl,
      x: optUrl,
      vimeo: optUrl,
    })
    .partial()
    .optional(),
  homeExpsTitle: optString,
  homeExpsSubtitle: optString,
  ctaTitle: optString,
  ctaText: optString,
  ctaButton: optString,
  homeWhyTitle: optString,
  homeWhyItems: z.array(z.string()).default([]),
  reviewsLabel: optString,
  reviewsUrl: optUrl,
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
