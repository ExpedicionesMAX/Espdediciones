import { z } from "zod";
import { optString, optUrl } from "./fields";

// Slugs que ya usan rutas del sitio: una página no puede pisarlos.
export const RESERVED_SLUGS = [
  "expediciones",
  "destinos",
  "guias",
  "contacto",
  "admin",
  "api",
  "ficha",
];

export const pageInputSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  slug: optString,
  subtitle: optString,
  content: optString,
  coverImage: optUrl,
  published: z.coerce.boolean().default(false),
  showInMenu: z.coerce.boolean().default(false),
  menuOrder: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().default(0),
  ),
  seoTitle: optString,
  seoDescription: optString,
});

export type PageInput = z.infer<typeof pageInputSchema>;
