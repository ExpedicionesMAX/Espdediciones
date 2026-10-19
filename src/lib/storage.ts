import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

/**
 * Acceso a Supabase Storage (solo servidor: usa la service role key, que
 * nunca llega al navegador). Las fotos viven en el bucket; la base guarda
 * solo su URL pública y sus datos.
 */

export const UPLOAD_FOLDERS = ["expediciones", "galeria", "nosotros", "sitio"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  return url && key ? { url: url.replace(/\/$/, ""), key, bucket } : null;
}

export function getStorage(): { client: SupabaseClient; bucket: string } | null {
  const c = config();
  if (!c) return null;
  return { client: createClient(c.url, c.key, { auth: { persistSession: false } }), bucket: c.bucket };
}

/** Prefijo de las URLs públicas de nuestro bucket. */
function publicPrefix(): string | null {
  const c = config();
  return c ? `${c.url}/storage/v1/object/public/${c.bucket}/` : null;
}

/** ¿La URL es un archivo de nuestro propio bucket? (Solo esas se aceptan para la galería.) */
export function isOwnStorageUrl(url: string): boolean {
  const prefix = publicPrefix();
  return !!prefix && url.startsWith(prefix) && !url.slice(prefix.length).includes("..");
}

function pathFromUrl(url: string): string | null {
  const prefix = publicPrefix();
  if (!prefix || !isOwnStorageUrl(url)) return null;
  return decodeURIComponent(url.slice(prefix.length).split("?")[0]);
}

/** Extrae todas las URLs de nuestro bucket que aparecen en un valor (texto, JSON, arrays). */
export function ownUrlsIn(value: unknown): string[] {
  const prefix = publicPrefix();
  if (!prefix || value == null) return [];
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...new Set(text.match(new RegExp(`${escaped}[^"\\s,)\\]]+`, "g")) ?? [])];
}

/**
 * ¿Algo del sitio todavía usa esta URL? Revisa todas las tablas y campos que
 * guardan imágenes. Ante cualquier error responde «sí» (nunca borrar a ciegas).
 */
async function isReferenced(url: string): Promise<boolean> {
  try {
    const [gallery, exps, days, pages, testimonials, destinations, guides, settings] = await Promise.all([
      prisma.galleryPhoto.count({ where: { url } }),
      prisma.expedition.count({
        where: { OR: [{ coverImage: url }, { ogImage: url }, { gallery: { has: url } }] },
      }),
      prisma.itineraryDay.count({ where: { images: { has: url } } }),
      prisma.page.count({ where: { coverImage: url } }),
      prisma.testimonial.count({ where: { photo: url } }),
      prisma.destination.count({ where: { OR: [{ coverImage: url }, { gallery: { has: url } }] } }),
      prisma.guide.count({ where: { photo: url } }),
      prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: { logoUrl: true, faviconUrl: true, homeContent: true, customTripContent: true, texts: true },
      }),
    ]);
    if (gallery + exps + days + pages + testimonials + destinations + guides > 0) return true;
    return !!settings && JSON.stringify(settings).includes(url);
  } catch (e) {
    console.error("[storage] no se pudo verificar referencias", e);
    return true;
  }
}

/**
 * Borra del bucket los archivos que ya no usa ninguna parte del sitio.
 * Se llama DESPUÉS de guardar el cambio en la base. Silencioso ante errores:
 * en el peor caso queda un archivo huérfano, nunca se rompe una imagen en uso.
 */
export async function removeStorageFilesIfUnreferenced(urls: string[]): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  const candidates = [...new Set(urls)].filter(isOwnStorageUrl);
  const toRemove: string[] = [];
  for (const url of candidates) {
    if (await isReferenced(url)) continue;
    const path = pathFromUrl(url);
    if (path) toRemove.push(path);
  }
  if (toRemove.length === 0) return;
  const { error } = await storage.client.storage.from(storage.bucket).remove(toRemove);
  if (error) console.error("[storage] no se pudieron borrar archivos", error.message);
}

/** URLs que estaban en `before` y ya no están en `after` (candidatas a limpiar). */
export function removedUrls(before: unknown, after: unknown): string[] {
  const now = new Set(ownUrlsIn(after));
  return ownUrlsIn(before).filter((u) => !now.has(u));
}
