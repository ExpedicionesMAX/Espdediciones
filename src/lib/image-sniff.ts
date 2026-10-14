/**
 * Detecta el tipo REAL de una imagen por sus primeros bytes ("magic numbers"),
 * sin confiar en el nombre ni en el Content-Type que manda el navegador.
 * Solo formatos de foto rasterizados: SVG queda afuera a propósito (puede
 * contener scripts).
 */
export type ImageKind = { mime: string; ext: string };

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // límite real de Vercel: 4,5 MB por request

function startsWith(bytes: Uint8Array, sig: number[], offset = 0): boolean {
  if (bytes.length < offset + sig.length) return false;
  return sig.every((b, i) => bytes[offset + i] === b);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}

export function detectImageType(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") return { mime: "image/gif", ext: "gif" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12);
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", ext: "avif" };
  }
  return null;
}
