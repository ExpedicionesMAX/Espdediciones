import { MAX_UPLOAD_BYTES } from "@/lib/image-sniff";

/**
 * Prepara una foto en el navegador antes de subirla: si es muy grande (en
 * píxeles o en peso) la reduce a un lado máximo de 2400 px, suficiente para
 * verse nítida en pantallas grandes, y la recodifica (WebP o JPEG). Así las
 * fotos del celular (3–8 MB) entran en el límite de Vercel y cargan más rápido.
 * Los GIF no se tocan (perderían la animación).
 *
 * Devuelve también las dimensiones finales (para reservar el espacio en la
 * página y evitar saltos de diseño); null si el navegador no pudo leerlas.
 */
const MAX_SIDE = 2400;
const REENCODE_ABOVE = 2.5 * 1024 * 1024;

export type PreparedImage = { file: File; width: number | null; height: number | null };

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  if (typeof createImageBitmap !== "function") return { file, width: null, height: null };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file, width: null, height: null }; // formato que el navegador no puede leer: que lo valide el servidor
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  if (file.type === "image/gif" || (scale === 1 && file.size <= REENCODE_ABOVE)) {
    bitmap.close();
    return { file, width: bitmap.width, height: bitmap.height };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, width: null, height: null };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  // WebP si el navegador lo sabe generar (conserva transparencias); si no, JPEG.
  let blob = await toBlob("image/webp", 0.86);
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.86);
  if (!blob) return { file, width: null, height: null };
  // Si aún así queda pesada, una pasada con más compresión.
  if (blob.size > MAX_UPLOAD_BYTES) blob = (await toBlob(blob.type, 0.72)) ?? blob;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return { file: new File([blob], `${base}.${ext}`, { type: blob.type }), width, height };
}
