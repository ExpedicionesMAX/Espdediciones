"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Lightbox } from "@/components/public/Lightbox";
import { loadMoreGallery } from "@/server/actions/gallery";
import type { GalleryPhotoPublic } from "@/lib/gallery";
import { isOptimizableImage } from "@/lib/content-fields";

/** Proporción real de la foto (ancho/alto); 3:2 si no se conoce. */
function ratioOf(p: { width: number | null; height: number | null }) {
  return p.width && p.height ? p.width / p.height : 1.5;
}

/**
 * Galería en «filas justificadas»: cada foto conserva su proporción (sin
 * recortes) y el orden elegido en el panel se lee de izquierda a derecha.
 * El espacio de cada foto está reservado antes de que cargue (sin saltos).
 */
export function PhotoGallery({
  initial,
  initialHasMore,
}: {
  initial: GalleryPhotoPublic[];
  initialHasMore: boolean;
}) {
  const [photos, setPhotos] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();

  const loadMore = () =>
    startLoading(async () => {
      setError(null);
      try {
        const next = await loadMoreGallery(photos.length);
        setPhotos((prev) => [...prev, ...next.photos.filter((p) => !prev.some((q) => q.id === p.id))]);
        setHasMore(next.hasMore);
      } catch {
        setError("No se pudieron cargar más fotos. Intentá de nuevo.");
      }
    });

  return (
    <>
      <ul className="flex flex-wrap gap-2 sm:gap-3">
        {photos.map((p, i) => {
          const r = ratioOf(p);
          const alt = p.alt || p.title || "Fotografía de la galería";
          return (
            <li key={p.id} className="relative" style={{ flexGrow: r, flexBasis: `${r * 300}px` }}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden rounded-lg bg-stone-200"
                style={{ aspectRatio: String(r) }}
                aria-label={`Ampliar: ${p.title || alt}`}
              >
                {isOptimizableImage(p.url) ? (
                  <Image
                    src={p.url}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                )}
                {p.title && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.title}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {/* Evita que la última fila se estire de más */}
        <li aria-hidden="true" className="h-0" style={{ flexGrow: 999, flexBasis: 0 }} />
      </ul>

      {(hasMore || error) && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="rounded-full px-7 py-3 text-sm font-semibold text-ink ring-1 ring-inset ring-stone-300 transition-colors hover:bg-stone-100 disabled:opacity-60"
            >
              {loading ? "Cargando…" : "Ver más fotos"}
            </button>
          )}
        </div>
      )}

      {open !== null && (
        <Lightbox
          items={photos.map((p) => ({
            url: p.url,
            alt: p.alt || p.title || "Fotografía de la galería",
            title: p.title,
            description: p.description,
          }))}
          index={open}
          onClose={() => setOpen(null)}
          onIndexChange={setOpen}
          label="Galería Fotográfica"
        />
      )}
    </>
  );
}
