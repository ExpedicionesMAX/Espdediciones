"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { MAX_UPLOAD_BYTES, detectImageType } from "@/lib/image-sniff";
import { UPLOAD_FOLDERS, getStorage, type UploadFolder } from "@/lib/storage";

export type UploadResult = { ok: boolean; url?: string; error?: string };

export async function uploadMediaImage(formData: FormData): Promise<UploadResult> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió el archivo." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "La imagen supera los 4 MB. Probá con una versión más liviana." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  // El tipo se decide por el contenido real del archivo, no por lo que declara el navegador.
  const kind = detectImageType(bytes);
  if (!kind) {
    return { ok: false, error: "Solo se permiten fotos JPG, PNG, WebP, GIF o AVIF." };
  }

  const storage = getStorage();
  if (!storage) {
    return { ok: false, error: "El almacenamiento de imágenes no está configurado." };
  }

  // Carpeta dentro del bucket (solo valores conocidos; por defecto, la de siempre).
  const requested = formData.get("folder")?.toString();
  const folder: UploadFolder = (UPLOAD_FOLDERS as readonly string[]).includes(requested ?? "")
    ? (requested as UploadFolder)
    : "expediciones";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${kind.ext}`;

  const { error } = await storage.client.storage.from(storage.bucket).upload(path, bytes, {
    contentType: kind.mime,
    upsert: false,
  });
  if (error) {
    // El detalle técnico queda en el log del servidor; al usuario, un mensaje claro.
    console.error("[upload] error de Supabase Storage:", error.message);
    return { ok: false, error: "No se pudo subir la imagen. Intentá de nuevo en unos minutos." };
  }

  const { data } = storage.client.storage.from(storage.bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
