"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/upload-client";
import { MAX_STORY_IMAGES, type StoryImage } from "@/lib/home-content";
import { inputCls } from "@/components/admin/content-form-ui";

/**
 * Fotos de «Nuestra historia»: subir varias, ver la vista previa, ordenar
 * (flechas o arrastrar), editar textos y quitar con confirmación. Los cambios
 * se guardan con el botón «Guardar inicio» del formulario.
 */
export function StoryImagesEditor({
  images,
  onChange,
}: {
  images: StoryImage[];
  onChange: (images: StoryImage[]) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const room = MAX_STORY_IMAGES - images.length;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(room, 0));
    if (fileRef.current) fileRef.current.value = "";
    if (files.length === 0) return;
    setErrors([]);
    const added: StoryImage[] = [];
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploading(`Subiendo ${i + 1} de ${files.length}…`);
      const res = await uploadPhoto(files[i], "nosotros");
      if (res.ok) {
        added.push({ url: res.photo.url, width: res.photo.width, height: res.photo.height, alt: "", title: "", caption: "" });
      } else {
        failed.push(`${files[i].name}: ${res.error}`);
      }
    }
    setUploading(null);
    setErrors(failed);
    if (added.length > 0) onChange([...images, ...added]);
  }

  const update = (i: number, patch: Partial<StoryImage>) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const remove = (i: number) => {
    if (!window.confirm("¿Quitar esta foto de «Nuestra historia»?\n\nSe aplica al guardar el inicio.")) return;
    onChange(images.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {images.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
          Todavía no hay fotos. Mientras tanto se muestra una foto de tus viajes publicados.
        </p>
      )}

      <ol className="space-y-3">
        {images.map((img, i) => (
          <li
            key={`${img.url}-${i}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row ${dragIndex === i ? "border-accent opacity-60" : "border-stone-200"}`}
          >
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:w-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 cursor-grab rounded-full bg-black/55 px-2 py-0.5 text-xs text-white" title="Arrastrá para ordenar">
                ⠿ {i + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <input
                value={img.alt}
                maxLength={250}
                onChange={(e) => update(i, { alt: e.target.value })}
                placeholder="Texto alternativo: qué se ve en la foto"
                aria-label={`Texto alternativo de la foto ${i + 1}`}
                className={inputCls}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={img.title}
                  maxLength={150}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Título (opcional)"
                  aria-label={`Título de la foto ${i + 1}`}
                  className={inputCls}
                />
                <input
                  value={img.caption}
                  maxLength={600}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  placeholder="Descripción / pie de foto (opcional)"
                  aria-label={`Descripción de la foto ${i + 1}`}
                  className={inputCls}
                />
              </div>
              {!img.alt && (
                <p className="text-xs text-amber-700">Recomendado: describí la foto en el texto alternativo.</p>
              )}
            </div>
            <div className="flex shrink-0 items-start gap-1 sm:flex-col">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="px-2 py-1 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Subir la foto ${i + 1}`}>↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="px-2 py-1 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Bajar la foto ${i + 1}`}>↓</button>
              <button type="button" onClick={() => remove(i)} className="px-2 py-1 text-sm font-medium text-red-600 hover:text-red-700" aria-label={`Quitar la foto ${i + 1}`}>✕</button>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={onFiles} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading !== null || room <= 0}
          className="rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading ?? "+ Subir fotos"}
        </button>
        <p className="text-xs text-stone-400">
          Podés elegir varias a la vez. Máximo {MAX_STORY_IMAGES}. Arrastrá o usá las flechas para ordenarlas.
        </p>
      </div>
      {errors.length > 0 && (
        <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {`Algunas fotos no se subieron:\n${errors.join("\n")}`}
        </p>
      )}
    </div>
  );
}
