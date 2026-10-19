"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/public/Lightbox";
import { isOptimizableImage } from "@/lib/content-fields";

export type StoryPhoto = {
  url: string;
  alt: string;
  title?: string;
  caption?: string;
  width: number | null;
  height: number | null;
};

/** Proporción para reservar el espacio: la real si se conoce; si no, 4:5 (retrato editorial). */
function ratio(p: StoryPhoto, fallback = 4 / 5) {
  return p.width && p.height ? p.width / p.height : fallback;
}

function Photo({
  photo,
  sizes,
  onOpen,
  fallbackRatio,
}: {
  photo: StoryPhoto;
  sizes: string;
  onOpen?: () => void;
  fallbackRatio?: number;
}) {
  const known = !!(photo.width && photo.height);
  const img = isOptimizableImage(photo.url) ? (
    <Image
      src={photo.url}
      alt={photo.alt}
      fill
      sizes={sizes}
      // Con proporción conocida se muestra entera (contain); si no, se encuadra.
      className={known ? "object-contain" : "object-cover"}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.url} alt={photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
  );
  const box = (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-stone-200"
      style={{ aspectRatio: String(ratio(photo, fallbackRatio)) }}
    >
      {img}
    </div>
  );
  return (
    <figure>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="block w-full cursor-zoom-in transition-opacity hover:opacity-95"
          aria-label={`Ampliar foto: ${photo.title || photo.alt || "Nuestra historia"}`}
        >
          {box}
        </button>
      ) : (
        box
      )}
      {(photo.title || photo.caption) && (
        <figcaption className="mt-3 text-sm leading-snug text-stone-600">
          {photo.title && <span className="font-medium text-ink">{photo.title}</span>}
          {photo.title && photo.caption && <span aria-hidden="true"> — </span>}
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Fotos de «Nuestra historia». Una sola: acompaña al texto. Varias: una foto
 * principal y el resto en una grilla de dos columnas. Todas se pueden ampliar.
 * `interactive=false` para la foto de respaldo (tomada de un viaje).
 */
export function StoryPhotos({ photos, interactive = true }: { photos: StoryPhoto[]; interactive?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;
  const openAt = (i: number) => (interactive ? () => setOpen(i) : undefined);
  const [first, ...rest] = photos;

  return (
    <>
      <div className="space-y-5">
        <Photo photo={first} sizes="(max-width: 1024px) 100vw, 50vw" onOpen={openAt(0)} />
        {rest.length > 0 && (
          <div className="grid grid-cols-2 items-start gap-4 sm:gap-5">
            {rest.map((p, i) => (
              <Photo
                key={`${p.url}-${i}`}
                photo={p}
                sizes="(max-width: 1024px) 50vw, 25vw"
                onOpen={openAt(i + 1)}
                fallbackRatio={1}
              />
            ))}
          </div>
        )}
      </div>

      {interactive && open !== null && (
        <Lightbox
          items={photos.map((p) => ({
            url: p.url,
            alt: p.alt,
            title: p.title,
            description: p.caption,
          }))}
          index={open}
          onClose={() => setOpen(null)}
          onIndexChange={setOpen}
          label="Fotos de Nuestra historia"
        />
      )}
    </>
  );
}
