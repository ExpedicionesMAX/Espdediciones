"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { isOwnStorageUrl, removeStorageFilesIfUnreferenced } from "@/lib/storage";
import { GALLERY_PAGE_SIZE, getPublishedGallery, type GalleryPhotoPublic } from "@/lib/gallery";

/**
 * Galería Fotográfica. Toda escritura exige el permiso de multimedia y se
 * valida en el servidor. Las fotos nuevas entran como BORRADOR.
 */

export type AdminGalleryPhoto = GalleryPhotoPublic & { published: boolean; order: number };
export type GalleryResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const ADMIN_SELECT = {
  id: true,
  url: true,
  width: true,
  height: true,
  title: true,
  description: true,
  alt: true,
  published: true,
  order: true,
} as const;

const dim = z.number().int().min(1).max(20000).nullable().optional();
const newPhotosSchema = z
  .array(z.object({ url: z.string().url().max(1000), width: dim, height: dim }))
  .min(1)
  .max(50);

const optText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().max(max)).optional();

const editSchema = z.object({
  id: z.string().min(1).max(40),
  title: optText(150),
  description: optText(1500),
  alt: optText(250),
});

function revalidate() {
  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
}

/** Registra fotos ya subidas al bucket (como borradores, al final del orden). */
export async function addGalleryPhotos(
  input: { url: string; width: number | null; height: number | null }[],
): Promise<GalleryResult<AdminGalleryPhoto[]>> {
  const user = await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  const parsed = newPhotosSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Los datos de las fotos no son válidos." };
  // Solo archivos de nuestro propio almacenamiento (los sube el panel).
  if (!parsed.data.every((p) => isOwnStorageUrl(p.url))) {
    return { ok: false, error: "Solo se pueden agregar fotos subidas desde el panel." };
  }

  const last = await prisma.galleryPhoto.aggregate({ _max: { order: true } });
  let order = (last._max.order ?? -1) + 1;
  const created = await prisma.$transaction(
    parsed.data.map((p) =>
      prisma.galleryPhoto.create({
        data: { url: p.url, width: p.width ?? null, height: p.height ?? null, published: false, order: order++ },
        select: ADMIN_SELECT,
      }),
    ),
  );

  await logActivity({
    userId: user.id,
    action: "create",
    entityType: "GalleryPhoto",
    summary: `Subió ${created.length} foto(s) a la galería`,
  });
  revalidate();
  return { ok: true, data: created };
}

/** Edita título, descripción y texto alternativo. */
export async function updateGalleryPhoto(input: {
  id: string;
  title?: string;
  description?: string;
  alt?: string;
}): Promise<GalleryResult<AdminGalleryPhoto>> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisá los textos (alguno es demasiado largo)." };
  const { id, title, description, alt } = parsed.data;
  try {
    const photo = await prisma.galleryPhoto.update({
      where: { id },
      data: { title: title || null, description: description || null, alt: alt || null },
      select: ADMIN_SELECT,
    });
    revalidate();
    return { ok: true, data: photo };
  } catch {
    return { ok: false, error: "La foto ya no existe. Recargá la página." };
  }
}

/** Publica o pasa a borrador. */
export async function setGalleryPhotoPublished(
  id: string,
  published: boolean,
): Promise<GalleryResult<AdminGalleryPhoto>> {
  const user = await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  if (typeof id !== "string" || typeof published !== "boolean") return { ok: false, error: "Datos inválidos." };
  try {
    const photo = await prisma.galleryPhoto.update({ where: { id }, data: { published }, select: ADMIN_SELECT });
    await logActivity({
      userId: user.id,
      action: published ? "publish" : "unpublish",
      entityType: "GalleryPhoto",
      entityId: id,
      summary: published ? "Publicó una foto de la galería" : "Pasó a borrador una foto de la galería",
    });
    revalidate();
    return { ok: true, data: photo };
  } catch {
    return { ok: false, error: "La foto ya no existe. Recargá la página." };
  }
}

/** Guarda el orden completo (lista de ids en el orden deseado). */
export async function reorderGalleryPhotos(ids: string[]): Promise<GalleryResult> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  if (!Array.isArray(ids) || ids.length > 2000 || ids.some((i) => typeof i !== "string")) {
    return { ok: false, error: "Orden inválido." };
  }
  const existing = await prisma.galleryPhoto.count({ where: { id: { in: ids } } });
  if (existing !== new Set(ids).size) {
    return { ok: false, error: "La lista cambió mientras la ordenabas. Recargá la página." };
  }
  await prisma.$transaction(ids.map((id, i) => prisma.galleryPhoto.update({ where: { id }, data: { order: i } })));
  revalidate();
  return { ok: true };
}

/** Elimina la foto de la galería. El archivo se borra solo si nada más lo usa. */
export async function deleteGalleryPhoto(id: string): Promise<GalleryResult> {
  const user = await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  if (typeof id !== "string") return { ok: false, error: "Datos inválidos." };
  const photo = await prisma.galleryPhoto.findUnique({ where: { id }, select: { url: true } });
  if (!photo) return { ok: false, error: "La foto ya no existe. Recargá la página." };

  await prisma.galleryPhoto.delete({ where: { id } });
  await logActivity({
    userId: user.id,
    action: "delete",
    entityType: "GalleryPhoto",
    entityId: id,
    summary: "Eliminó una foto de la galería",
  });
  // Después de borrar el registro: si la foto se usa como portada u otra sección, el archivo queda.
  await removeStorageFilesIfUnreferenced([photo.url]);
  revalidate();
  return { ok: true };
}

/** Carga pública de la siguiente tanda (solo fotos publicadas). */
export async function loadMoreGallery(skip: number) {
  const safeSkip = Number.isInteger(skip) && skip >= 0 && skip < 100000 ? skip : 0;
  return getPublishedGallery(safeSkip, GALLERY_PAGE_SIZE);
}
