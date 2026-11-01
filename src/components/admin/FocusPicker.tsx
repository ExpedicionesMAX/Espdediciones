"use client";

import { useRef, useState } from "react";
import { CENTER, WHOLE, isWhole, parseFocus, type Focus } from "@/lib/focus";

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export type FocusPreview = { label: string; aspect: string; className?: string };

/** Foto como se ve en el sitio: recortada con encuadre, o entera sobre su versión desenfocada. */
function Shot({ src, position, whole }: { src: string; position: string; whole: boolean }) {
  return whole ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-90" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
    </>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ objectPosition: position }}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
}

/**
 * Elegir cómo se ve una foto de portada:
 * - «Recortar para llenar»: se arrastra la foto (mouse, dedo o flechas) para
 *   elegir qué parte queda a la vista. Valor "X% Y%".
 * - «Mostrar la foto entera»: se achica para que entre completa; el espacio
 *   sobrante se rellena con la misma foto desenfocada. Valor "entera".
 * Muestra vistas previas con los recortes reales (p. ej. compu y celular).
 */
export function FocusPicker({
  imageUrl,
  value,
  onChange,
  mainAspect = "16 / 9",
  mainLabel = "Así se ve en compu",
  previews = [],
  children,
}: {
  imageUrl: string;
  value: string;
  onChange: (focus: string) => void;
  /**
   * Proporción del recuadro grande donde se arrastra: debe ser la de la
   * portada real en una compu (pantalla ancha), que es donde más se recorta.
   */
  mainAspect?: string;
  /** Rótulo del recuadro grande. */
  mainLabel?: string;
  /** Recortes adicionales para comparar (p. ej. celular, tarjeta). */
  previews?: FocusPreview[];
  /** Contenido extra sobre la foto grande (etiquetas, degradé…). */
  children?: React.ReactNode;
}) {
  const whole = isWhole(value);
  const focus: Focus = parseFocus(value) ?? CENTER;
  const [live, setLive] = useState<Focus | null>(null); // mientras se arrastra
  const drag = useRef<{ x: number; y: number; start: Focus } | null>(null);
  const shown = live ?? focus;
  const position = `${shown.x}% ${shown.y}%`;
  const commit = (f: Focus) => onChange(`${f.x}% ${f.y}%`);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (whole) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: focus };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const k = 1.6; // sensibilidad
    setLive({
      x: clamp(d.start.x - ((e.clientX - d.x) / rect.width) * 100 * k),
      y: clamp(d.start.y - ((e.clientY - d.y) / rect.height) * 100 * k),
    });
  };
  const onPointerUp = () => {
    if (drag.current && live) commit(live);
    drag.current = null;
    setLive(null);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (whole) return;
    const step = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
    if (!step) return;
    e.preventDefault();
    commit({ x: clamp(focus.x + step[0]), y: clamp(focus.y + step[1]) });
  };

  const modeBtn = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${active ? "bg-ink text-white ring-ink" : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-100"}`;

  return (
    <div>
      {/* Modo: recortar o foto entera */}
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Cómo se muestra la foto">
        <button type="button" aria-pressed={!whole} onClick={() => whole && onChange("")} className={modeBtn(!whole)}>
          Recortar para llenar (elegís qué parte se ve)
        </button>
        <button type="button" aria-pressed={whole} onClick={() => !whole && onChange(WHOLE)} className={modeBtn(whole)}>
          Mostrar la foto entera
        </button>
      </div>

      <div
        className={`relative w-full touch-none select-none overflow-hidden rounded-xl bg-stone-800 ${whole ? "" : "cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent active:cursor-grabbing"}`}
        style={{ aspectRatio: mainAspect }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={whole ? -1 : 0}
        role={whole ? undefined : "slider"}
        aria-label={whole ? undefined : "Encuadre de la foto: arrastrala o usá las flechas"}
        aria-valuetext={whole ? undefined : `Horizontal ${shown.x}%, vertical ${shown.y}%`}
      >
        <Shot src={imageUrl} position={position} whole={whole} />
        {children}
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
          {mainLabel}
        </span>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
          {whole ? "Foto entera: se ve completa, sin recortes" : "✥ Arrastrá la foto para elegir qué parte se ve"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {previews.map((p) => (
          <div key={p.label}>
            <p className="mb-1 text-xs font-medium text-stone-500">{p.label}</p>
            <div
              className={`relative overflow-hidden rounded-lg bg-stone-800 ${p.className ?? "w-28"}`}
              style={{ aspectRatio: p.aspect }}
            >
              <Shot src={imageUrl} position={position} whole={whole} />
            </div>
          </div>
        ))}
        {!whole && (
          <div className="pb-1 text-xs text-stone-500">
            <p>
              Encuadre: {shown.x}% horizontal · {shown.y}% vertical
            </p>
            {(focus.x !== 50 || focus.y !== 50) && (
              <button type="button" onClick={() => commit(CENTER)} className="mt-1 font-semibold text-accent hover:underline">
                Volver al centro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
