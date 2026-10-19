import "server-only";
import { prisma } from "@/lib/prisma";
import { classifyMedia } from "@/lib/media";
import { getHomeContent } from "@/lib/page-content";
import type { LibraryImage } from "@/components/admin/CoverImageField";

/**
 * Fotos ya subidas que se pueden elegir como portada de un viaje: las del
 * propio viaje, las de la Galería Fotográfica y las de «Nuestra historia».
 * Elegir una solo copia su URL: el archivo sigue siendo el mismo y la galería
 * de origen no cambia.
 */
export async function getCoverLibrary(tripGallery: string[] = []): Promise<LibraryImage[]> {
  const [gallery, { stored }] = await Promise.all([
    prisma.galleryPhoto
      .findMany({ orderBy: [{ order: "asc" }], select: { url: true, title: true }, take: 300 })
      .catch(() => []),
    getHomeContent(),
  ]);

  const out: LibraryImage[] = [];
  const seen = new Set<string>();
  const add = (url: string, label: string, group: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, label, group });
  };

  tripGallery
    .filter((u) => classifyMedia(u).type === "image")
    .forEach((u, i) => add(u, `Foto ${i + 1} del viaje`, "Fotos de este viaje"));
  gallery.forEach((g, i) => add(g.url, g.title || `Foto ${i + 1} de la galería`, "Galería Fotográfica"));
  stored.story.images.forEach((s, i) => add(s.url, s.title || s.alt || `Foto ${i + 1}`, "Nuestra historia"));
  return out;
}
