"use client";

import { OVERLAYS, OVERLAY_CLASS, OVERLAY_LABELS, resolveOverlay, overlayNeedsTextShadow } from "@/lib/overlay";

/**
 * Elegir el velo oscuro de una portada, con vista previa sobre la propia foto.
 * `value` vacío = «Medio» (el de siempre).
 */
export function OverlayPicker({
  name,
  imageUrl,
  value,
  onChange,
}: {
  /** Nombre del grupo de opciones (único en la página). */
  name: string;
  imageUrl?: string | null;
  value: string;
  onChange: (overlay: string) => void;
}) {
  const current = resolveOverlay(value);
  return (
    <fieldset>
      <legend className="mb-1 block text-sm font-medium text-ink">Oscurecer la foto (para que el texto se lea)</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {OVERLAYS.map((o) => {
          const selected = current === o;
          return (
            <label
              key={o}
              className={`cursor-pointer overflow-hidden rounded-xl border-2 ${selected ? "border-accent" : "border-stone-200 hover:border-stone-300"}`}
            >
              <input type="radio" name={name} value={o} checked={selected} onChange={() => onChange(o)} className="sr-only" />
              {/* Vista previa con la foto de portada elegida */}
              <span className="relative block aspect-[4/3] bg-stone-500">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                {OVERLAY_CLASS[o] && <span className={`absolute inset-0 bg-gradient-to-t ${OVERLAY_CLASS[o]}`} />}
                <span
                  className={`absolute bottom-2 left-2 font-display text-sm font-semibold text-white ${overlayNeedsTextShadow(o) ? "hero-text-shadow" : ""}`}
                >
                  Título
                </span>
              </span>
              <span className={`block px-2 py-1.5 text-center text-xs font-medium ${selected ? "text-accent" : "text-stone-600"}`}>
                {OVERLAY_LABELS[o]}
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-stone-400">
        «Sin velo» muestra la foto tal cual; con fotos muy claras, el título se puede leer menos.
      </p>
    </fieldset>
  );
}
