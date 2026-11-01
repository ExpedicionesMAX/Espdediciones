"use client";

import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "@/lib/upload-client";
import { CENTER, parseFocus, type Focus } from "@/lib/focus";

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export type LibraryImage = { url: string; label: string; group: string };

/**
 * «Imagen de portada del viaje»: subir una foto, elegir una ya existente
 * (fotos del viaje o de la Galería Fotográfica), ver cómo queda y quitarla.
 * Es independiente de la galería del viaje: cambiarla no toca las demás fotos.
 * El valor viaja en un campo oculto `name` y se guarda con «Guardar».
 */
export function CoverImageField({
  name,
  defaultValue,
  focusName,
  defaultFocus,
  library,
  fallbackUrl,
  onChange,
  error,
}: {
  name: string;
  defaultValue: string;
  /** Campo oculto con el encuadre ("X% Y%"). */
  focusName: string;
  defaultFocus: string;
  library: LibraryImage[];
  /** Foto que se usa mientras no haya portada (la primera de la galería del viaje). */
  fallbackUrl?: string | null;
  onChange?: () => void;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [focus, setFocus] = useState<Focus>(parseFocus(defaultFocus) ?? CENTER);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; start: Focus } | null>(null);

  const change = (url: string) => {
    setValue(url);
    setFocus(CENTER); // foto nueva: empieza centrada
    onChange?.();
  };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const res = await uploadPhoto(file, "expediciones");
    setUploading(false);
    if (res.ok) change(res.photo.url);
    else setUploadError(res.error);
  }

  const removeCover = () => {
    if (!window.confirm("¿Quitar la imagen de portada de este viaje?\n\nLas demás fotos del viaje no se modifican. Se aplica al guardar.")) return;
    change("");
  };

  // Escape cierra el selector
  useEffect(() => {
    if (!picking) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPicking(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picking]);

  const groups = library.reduce<Record<string, LibraryImage[]>>((acc, img) => {
    (acc[img.group] ??= []).push(img);
    return acc;
  }, {});
  const preview = value || fallbackUrl || "";
  const position = `${focus.x}% ${focus.y}%`;

  // Arrastrar la foto mueve el encuadre: hacia la derecha muestra lo que hay a la izquierda, etc.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!value) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: focus };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const k = 1.6; // sensibilidad
    setFocus({
      x: clamp(d.start.x - ((e.clientX - d.x) / rect.width) * 100 * k),
      y: clamp(d.start.y - ((e.clientY - d.y) / rect.height) * 100 * k),
    });
  };
  const onPointerUp = () => {
    if (drag.current) onChange?.();
    drag.current = null;
  };
  // Con el teclado: flechas mueven el encuadre de a 5%.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!value) return;
    const step = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
    if (!step) return;
    e.preventDefault();
    setFocus((f) => ({ x: clamp(f.x + step[0]), y: clamp(f.y + step[1]) }));
    onChange?.();
  };

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <input type="hidden" name={focusName} value={value ? position : ""} />

      {/* Vista previa con el encuadre de la cabecera del viaje: se puede arrastrar */}
      <div
        className={`relative aspect-[16/7] w-full touch-none select-none overflow-hidden rounded-xl bg-stone-800 ${value ? "cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={value ? 0 : -1}
        role={value ? "slider" : undefined}
        aria-label={value ? "Encuadre de la portada: arrastrá la foto o usá las flechas" : undefined}
        aria-valuetext={value ? `Horizontal ${focus.x}%, vertical ${focus.y}%` : undefined}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            draggable={false}
            style={{ objectPosition: value ? position : "50% 50%" }}
            className={`pointer-events-none h-full w-full object-cover ${value ? "" : "opacity-60"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-stone-400">
            Sin portada todavía
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${value ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"}`}
        >
          {value ? "Portada elegida" : fallbackUrl ? "Provisoria: primera foto de la galería" : "Sin portada"}
        </span>
        {value && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
            ✥ Arrastrá la foto para elegir qué parte se ve
          </span>
        )}
      </div>

      {/* Cómo queda recortada en la tarjeta de «Nuestros Viajes» (vertical) */}
      {value && (
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <p className="mb-1 text-xs font-medium text-stone-500">Así se ve en la tarjeta</p>
            <div className="relative aspect-[4/5] w-28 overflow-hidden rounded-lg bg-stone-800 sm:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" style={{ objectPosition: position }} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="pb-1 text-xs text-stone-500">
            <p>Encuadre: {focus.x}% horizontal · {focus.y}% vertical</p>
            {(focus.x !== 50 || focus.y !== 50) && (
              <button
                type="button"
                onClick={() => {
                  setFocus(CENTER);
                  onChange?.();
                }}
                className="mt-1 font-semibold text-accent hover:underline"
              >
                Volver al centro
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : value ? "Cambiar: subir otra foto" : "Subir foto de portada"}
        </button>
        {library.length > 0 && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Elegir de las fotos existentes
          </button>
        )}
        {value && (
          <button type="button" onClick={removeCover} className="px-2 py-2 text-sm font-medium text-red-600 hover:text-red-700">
            Quitar portada
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Se usa en la cabecera de la ficha, en las tarjetas de «Nuestros Viajes» y al compartir el link.
        Ideal: foto horizontal, de buena calidad.
      </p>
      {(uploadError || error) && <p role="alert" className="mt-1 text-xs text-red-600">{uploadError || error}</p>}

      {picking && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPicking(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Elegir imagen de portada"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl outline-none sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">Elegir imagen de portada</h3>
              <button type="button" onClick={() => setPicking(false)} className="rounded-full px-3 py-1 text-sm text-stone-500 hover:bg-stone-100" aria-label="Cerrar">
                ✕
              </button>
            </div>
            {Object.entries(groups).map(([group, imgs]) => (
              <section key={group} className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{group}</p>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imgs.map((img) => (
                    <li key={`${group}-${img.url}`}>
                      <button
                        type="button"
                        onClick={() => {
                          change(img.url);
                          setPicking(false);
                        }}
                        className={`group block w-full overflow-hidden rounded-lg ring-2 ${value === img.url ? "ring-accent" : "ring-transparent hover:ring-stone-300"}`}
                        aria-label={`Usar como portada: ${img.label}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
