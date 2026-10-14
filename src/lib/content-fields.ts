/**
 * Saneadores compartidos para el contenido editable guardado como JSON
 * (inicio institucional y Viajes a Medida). Son puros: se usan tanto al
 * guardar (server action) como al leer (render), así un JSON viejo o
 * manipulado nunca rompe la página ni inyecta URLs peligrosas.
 */

export function str(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** URL de imagen: solo http(s) absolutas o rutas locales. Cualquier otra cosa → "". */
export function imageUrl(value: unknown): string {
  const v = str(value, 1000);
  if (/^https?:\/\/[^\s]+$/i.test(v)) return v;
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v;
  return "";
}

/**
 * Destino de un botón: ruta interna (/…), ancla (#…) o URL http(s).
 * Rechaza javascript:, data:, // (protocol-relative), etc.
 */
export function safeHref(value: unknown): string {
  const v = str(value, 500);
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v;
  if (/^#[A-Za-z0-9_-]+$/.test(v)) return v;
  if (/^https?:\/\/[^\s]+$/i.test(v)) return v;
  return "";
}

/** Valor guardado si tiene contenido; si no, el valor por defecto. */
export function orDefault(stored: string, fallback: string): string {
  return stored ? stored : fallback;
}

/** Divide un texto largo en párrafos (línea en blanco = párrafo nuevo). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ¿La URL es de un host que next/image puede optimizar? (espejo de next.config.ts) */
export function isOptimizableImage(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host.endsWith(".supabase.co") ||
      host === "images.unsplash.com" ||
      host === "picsum.photos" ||
      host === "i.pravatar.cc"
    );
  } catch {
    return false;
  }
}
