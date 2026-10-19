import "server-only";
import { prisma } from "@/lib/prisma";

export type GalleryPhotoPublic = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  title: string | null;
  description: string | null;
  alt: string | null;
};

/** Cuántas fotos se cargan por tanda en la galería pública. */
export const GALLERY_PAGE_SIZE = 36;

/** Fotos PUBLICADAS de la galería, en el orden elegido en el panel. Los borradores nunca salen. */
export async function getPublishedGallery(
  skip = 0,
  take = GALLERY_PAGE_SIZE,
): Promise<{ photos: GalleryPhotoPublic[]; hasMore: boolean }> {
  const rows = await prisma.galleryPhoto.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    skip,
    take: take + 1,
    select: { id: true, url: true, width: true, height: true, title: true, description: true, alt: true },
  });
  return { photos: rows.slice(0, take), hasMore: rows.length > take };
}
