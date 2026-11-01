/**
 * Convierte una imagen (archivo o URL) en un ícono CUADRADO PNG de 512×512:
 * la imagen entra entera, centrada y sin deformar, con fondo transparente.
 * Sirve para el ícono de la pestaña (favicon) y el de «agregar a inicio» en
 * celulares, que siempre son cuadrados. Solo navegador (usa canvas).
 */
const SIZE = 512;
const PADDING = 0.04; // pequeño margen para que no toque los bordes

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // el almacenamiento permite leerla (CORS)
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = src;
  });
}

export async function makeSquareIcon(source: File | string): Promise<File> {
  const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source);
  try {
    const img = await loadImage(objectUrl ?? (source as string));
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("El navegador no permite procesar la imagen.");
    const room = SIZE * (1 - PADDING * 2);
    const scale = Math.min(room / img.naturalWidth, room / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) throw new Error("No se pudo generar el ícono.");
    return new File([blob], "icono.png", { type: "image/png" });
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
