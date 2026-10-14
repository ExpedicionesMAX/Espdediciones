import { MAX_UPLOAD_BYTES } from "@/lib/image-sniff";

/**
 * Prepara una foto en el navegador antes de subirla: si es muy grande (en
 * píxeles o en peso) la reduce a un lado máximo de 2400 px, suficiente para
 * verse nítida en pantallas grandes, y la recodifica (WebP o JPEG). Así las
 * fotos del celular (3–8 MB) entran en el límite de Vercel y cargan más rápido.
 * Los GIF no se tocan (perderían la animación).
 */
const MAX_SIDE = 2400;
const REENCODE_ABOVE = 2.5 * 1024 * 1024;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // formato que el navegador no puede leer: que lo valide el servidor
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= REENCODE_ABOVE) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  // WebP si el navegador lo sabe generar (conserva transparencias); si no, JPEG.
  let blob = await toBlob("image/webp", 0.86);
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.86);
  if (!blob) return file;
  // Si aún así queda pesada, una pasada con más compresión.
  if (blob.size > MAX_UPLOAD_BYTES) blob = (await toBlob(blob.type, 0.72)) ?? blob;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}
