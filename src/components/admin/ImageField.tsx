"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/upload-client";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

/** Una imagen: subir desde la compu (Supabase Storage) o pegar una URL. Con vista previa. */
export function ImageField({
  id,
  value,
  onChange,
  hint,
  folder = "sitio",
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  folder?: "expediciones" | "galeria" | "nosotros" | "sitio";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadPhoto(file, folder);
      if (res.ok) onChange(res.photo.url);
      else setError(res.error);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-xs text-stone-400">
            Sin imagen
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (o subí una foto)"
          className={inputCls}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Subir foto"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm font-medium text-stone-500 hover:text-red-600"
            >
              Quitar
            </button>
          )}
        </div>
        {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
