"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/upload-client";
import { classifyMedia } from "@/lib/media";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

/** Lista de links (uno por línea) ⇄ array, ignorando renglones vacíos. */
const toList = (v: string) => v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

/**
 * Galería de un viaje: miniaturas de cada foto/video con su número, quitar
 * (con confirmación) y ordenar; subir fotos; y, en un desplegable, los links
 * para pegar a mano. El valor viaja en el textarea `name` (uno por línea).
 */
export function GalleryField({
  name,
  defaultValue,
  onChange,
}: {
  name: string;
  defaultValue?: string;
  /** Para avisar «cambios sin guardar» al quitar u ordenar con los botones. */
  onChange?: () => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const items = toList(value);

  const setItems = (list: string[]) => {
    setValue(list.join("\n"));
    onChange?.();
  };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadPhoto(file, "expediciones");
        if (res.ok) {
          const url = res.photo.url;
          setValue((v) => (v.trim() ? `${v.trim()}\n${url}` : url));
          onChange?.();
        } else {
          setError(res.error);
          break;
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const remove = (i: number) => {
    if (!window.confirm(`¿Quitar la foto ${i + 1} de la galería de este viaje?\n\nSe aplica al guardar.`)) return;
    setItems(items.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  return (
    <div>
      {/* Miniaturas: así se identifica cada foto para quitarla u ordenarla */}
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((url, i) => {
            const m = classifyMedia(url);
            return (
              <li key={`${url}-${i}`} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <a href={url} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] bg-stone-100" title="Abrir en grande">
                  {m.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-stone-400">Sin vista previa</span>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  {m.type === "video" && (
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink">
                      VIDEO
                    </span>
                  )}
                </a>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="flex">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Mover la foto ${i + 1} antes`}>←</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1.5 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Mover la foto ${i + 1} después`}>→</button>
                  </span>
                  <button type="button" onClick={() => remove(i)} className="text-xs font-semibold text-red-600 hover:text-red-700" aria-label={`Quitar la foto ${i + 1}`}>
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
          Todavía no hay fotos en la galería de este viaje.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "Subir fotos"}
        </button>
        <p className="text-xs text-stone-400">
          {items.length} {items.length === 1 ? "elemento" : "elementos"} · Tocá una miniatura para verla en grande.
        </p>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Los links, para pegar uno a mano (por ejemplo, un video de YouTube) */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-stone-600 hover:text-ink">
          Ver o pegar links a mano
        </summary>
        <textarea
          id={name}
          name={name}
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputCls} mt-2`}
          placeholder={"https://foto-en-la-nube.jpg\nhttps://youtube.com/watch?v=…  (video o Reel)"}
        />
        <p className="mt-1 text-xs text-stone-400">Un link por línea. Las miniaturas de arriba se actualizan solas.</p>
      </details>
    </div>
  );
}
