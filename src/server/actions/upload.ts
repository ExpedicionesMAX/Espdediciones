"use server";

import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { MAX_UPLOAD_BYTES, detectImageType } from "@/lib/image-sniff";

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  if (!url || !key) {
    return { ok: false, error: "El almacenamiento no está configurado." };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const path = `expediciones/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${kind.ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: kind.mime,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: `No se pudo subir: ${error.message}` };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
