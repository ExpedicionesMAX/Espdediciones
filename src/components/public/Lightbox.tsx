"use client";

import { useCallback, useEffect, useRef } from "react";

export type LightboxItem = {
  url: string;
  alt: string;
  title?: string | null;
  description?: string | null;
};

/**
 * Vista ampliada accesible: Escape cierra, ← → navegan, deslizar en pantallas
 * táctiles, foco en el botón de cierre al abrir y de vuelta al disparador al
 * cerrar. Muestra la foto original (máx. 2400 px), sin recortes.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
  label = "Fotografía ampliada",
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  label?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const total = items.length;
  const item = items[index];

  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + total) % total),
    [index, total, onIndexChange],
  );

  // Teclado, bloqueo del scroll de fondo y manejo del foco.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && total > 1) go(-1);
      else if (e.key === "ArrowRight" && total > 1) go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, total]);

  // Precarga de la anterior y la siguiente para que la navegación sea inmediata.
  useEffect(() => {
    if (total < 2) return;
    for (const i of [(index + 1) % total, (index - 1 + total) % total]) {
      const img = new Image();
      img.src = items[i].url;
    }
  }, [index, items, total]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null || total < 2) return;
        if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-sm text-white/70" aria-live="polite">
          {index + 1} / {total}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Cerrar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.url}
          src={item.url}
          alt={item.alt}
          onClick={(e) => e.stopPropagation()}
          className="lightbox-img max-h-full max-w-full select-none object-contain"
          draggable={false}
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
              aria-label="Foto anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
              aria-label="Foto siguiente"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div
        className="mx-auto w-full max-w-3xl px-4 pb-5 pt-3 text-center sm:pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        {item.title && <p className="font-display text-lg font-semibold">{item.title}</p>}
        {item.description && <p className="mt-1 text-sm text-white/75">{item.description}</p>}
        {total > 1 && (
          <div className="mt-3 flex justify-center gap-3 sm:hidden">
            <button type="button" onClick={() => go(-1)} className="rounded-full bg-white/10 px-5 py-2 text-sm" aria-label="Foto anterior">
              ← Anterior
            </button>
            <button type="button" onClick={() => go(1)} className="rounded-full bg-white/10 px-5 py-2 text-sm" aria-label="Foto siguiente">
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
