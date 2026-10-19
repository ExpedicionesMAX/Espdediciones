import { uploadMediaImage } from "@/server/actions/upload";
import { prepareImageForUpload } from "@/lib/prepare-upload";

export type UploadedPhoto = { url: string; width: number | null; height: number | null };

/**
 * Sube una foto desde el panel: la prepara en el navegador (tamaño y peso) y
 * la manda al servidor, que valida permisos y contenido. Nunca lanza: devuelve
 * un mensaje de error comprensible si algo falla.
 */
export async function uploadPhoto(
  file: File,
  folder: "expediciones" | "galeria" | "nosotros" | "sitio" = "expediciones",
): Promise<{ ok: true; photo: UploadedPhoto } | { ok: false; error: string }> {
  try {
    const prepared = await prepareImageForUpload(file);
    const fd = new FormData();
    fd.append("file", prepared.file);
    fd.append("folder", folder);
    const res = await uploadMediaImage(fd);
    if (!res.ok || !res.url) return { ok: false, error: res.error ?? "No se pudo subir la imagen." };
    return { ok: true, photo: { url: res.url, width: prepared.width, height: prepared.height } };
  } catch {
    return { ok: false, error: `No se pudo subir «${file.name}». Revisá la conexión e intentá de nuevo.` };
  }
}
