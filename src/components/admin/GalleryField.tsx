"use client";

import { useRef, useState } from "react";
import { uploadMediaImage } from "@/server/actions/upload";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function GalleryField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadMediaImage(fd);
        if (res.ok && res.url) {
          setValue((v) => (v.trim() ? `${v.trim()}\n${res.url}` : res.url!));
        } else {
          setError(res.error ?? "No se pudo subir la imagen.");
          break;
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={inputCls}
        placeholder={"https://foto-en-la-nube.jpg\nhttps://youtube.com/watch?v=…  (video o Reel)"}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "Subir foto"}
        </button>
        <p className="text-xs text-stone-400">
          Subí una foto de tu compu, o pegá links de fotos/videos (uno por línea). Se ven en
          pantalla completa.
        </p>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
