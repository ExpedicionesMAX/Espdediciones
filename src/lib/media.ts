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
