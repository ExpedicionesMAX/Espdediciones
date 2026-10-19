import { getEmbedUrl } from "./video";

export type MediaItem = {
  type: "image" | "video";
  url: string;
  embedUrl?: string;
  thumb: string | null;
};

function youtubeIdFromEmbed(embedUrl: string): string | null {
  const m = embedUrl.match(/youtube\.com\/embed\/([^?/]+)/);
  return m ? m[1] : null;
}

/** Clasifica una URL como imagen o video (YouTube/Vimeo) y resuelve su miniatura. */
export function classifyMedia(url: string): MediaItem {
  const embedUrl = getEmbedUrl(url);
  if (embedUrl) {
    const ytId = youtubeIdFromEmbed(embedUrl);
    return {
      type: "video",
      url,
      embedUrl,
      thumb: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null,
    };
  }
  return { type: "image", url, thumb: url };
}

/**
 * Portada de un viaje: la elegida en el panel; si no hay, la primera foto de
 * SU PROPIA galería (nunca de otro viaje); si tampoco hay, null (la página
 * muestra un fondo neutro).
 */
export function tripCover(exp: { coverImage?: string | null; gallery?: string[] | null }): string | null {
  if (exp.coverImage) return exp.coverImage;
  for (const g of exp.gallery ?? []) {
    if (g && classifyMedia(g).type === "image") return g;
  }
  return null;
}

/** Construye la lista de medios de una expedición (video principal + galería), sin duplicados. */
export function buildMediaList(
  gallery: string[],
  videoUrl?: string | null,
): MediaItem[] {
  const urls: string[] = [];
  if (videoUrl) urls.push(videoUrl);
  for (const g of gallery) if (!urls.includes(g)) urls.push(g);
  return urls.map(classifyMedia);
}
