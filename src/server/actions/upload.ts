"use server";

import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";

export type UploadResult = { ok: boolean; url?: string; error?: string };

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadMediaImage(formData: FormData): Promise<UploadResult> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió el archivo." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Solo se permiten imágenes (JPG, PNG, WebP…)." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen supera los 8 MB." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  if (!url || !key) {
    return { ok: false, error: "El almacenamiento no está configurado." };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `expediciones/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: `No se pudo subir: ${error.message}` };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
