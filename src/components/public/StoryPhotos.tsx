"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Lightbox } from "@/components/public/Lightbox";
import { isOptimizableImage } from "@/lib/content-fields";
import { collageRows, rowsBesideText } from "@/lib/collage";

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

/** Filas del collage: cada foto con ancho proporcional a su forma, así todas quedan de la misma altura. */
function Rows({
  rows,
  photos,
  ratios,
  wide,
  openAt,
}: {
  rows: number[][];
  photos: StoryPhoto[];
  ratios: number[];
  wide: boolean;
  openAt: (i: number) => (() => void) | undefined;
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {rows.map((row) => (
        <div key={row.join("-")} className="flex items-start gap-3 sm:gap-4">
          {row.map((i) => (
            <div key={`${photos[i].url}-${i}`} className="min-w-0" style={{ flex: `${ratios[i]} 1 0%` }}>
              <Photo
                photo={photos[i]}
                sizes={
                  row.length === 1
                    ? wide
                      ? "(max-width: 1152px) 100vw, 1100px"
                      : "(max-width: 1024px) 100vw, 50vw"
                    : wide
                      ? "(max-width: 1024px) 50vw, 33vw"
                      : "(max-width: 1024px) 50vw, 25vw"
                }
                onOpen={openAt(i)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * «Nuestra historia» con sus fotos. Una sola: acompaña al texto. Varias: al
 * costado del texto van las filas justas para terminar a su misma altura (se
 * mide en el navegador) y el resto sigue debajo, a todo el ancho, en un
 * collage más amplio. En celular: primero el texto y después las fotos.
 * Todas se pueden ampliar; `interactive=false` para la foto de respaldo.
 */
export function StoryPhotos({
  photos,
  interactive = true,
  children,
}: {
  photos: StoryPhoto[];
  interactive?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const ratios = photos.map((p) => ratio(p));
  const sideRows = collageRows(ratios);
  // Antes de medir (y en celular, donde no hay columnas) se usa una estimación.
  const [besideCount, setBesideCount] = useState(Math.min(2, sideRows.length));
  const textRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const ratiosKey = ratios.join(",");

  useEffect(() => {
    const text = textRef.current;
    const col = colRef.current;
    if (!text || !col) return;
    const rs = ratiosKey.split(",").map(Number);
    const rows = collageRows(rs);
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const w = col.getBoundingClientRect().width;
      // En celular no hay columnas: todas las fotos van debajo del texto, de a 2 o 3.
      if (!mq.matches) return setBesideCount(rows.length);
      if (w <= 0) return;
      const gap = parseFloat(getComputedStyle(col.firstElementChild ?? col).rowGap) || 16;
      setBesideCount(rowsBesideText(rows, rs, text.getBoundingClientRect().height / w, gap / w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(text);
    ro.observe(col);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [ratiosKey]);

  if (photos.length === 0) return <div className="mx-auto max-w-3xl">{children}</div>;
  const openAt = (i: number) => (interactive ? () => setOpen(i) : undefined);
  const beside = sideRows.slice(0, besideCount);
  const restIdx = sideRows.slice(besideCount).flat();
  // Debajo, a todo el ancho: filas de 3 o 4 fotos.
  const belowRows = collageRows(
    restIdx.map((i) => ratios[i]),
    { firstRowTarget: 3, rowTarget: 3, maxPerRow: 4 },
  ).map((row) => row.map((k) => restIdx[k]));

  return (
    <>
      <div className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${photos.length > 1 ? "items-start" : "items-center"}`}>
        <div ref={textRef} className={photos.length > 1 ? "" : "lg:order-last"}>
          {children}
        </div>
        <div ref={colRef} className="reveal">
          <Rows rows={beside} photos={photos} ratios={ratios} wide={false} openAt={openAt} />
        </div>
      </div>
      {belowRows.length > 0 && (
        <div className="reveal mt-3 sm:mt-4">
          <Rows rows={belowRows} photos={photos} ratios={ratios} wide openAt={openAt} />
        </div>
      )}

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
