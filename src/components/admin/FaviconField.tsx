"use client";

import { useRef, useState } from "react";
import { makeSquareIcon } from "@/lib/square-icon";
import { uploadPhoto } from "@/lib/upload-client";

/**
 * Ícono de la pestaña del navegador (favicon) y de «agregar a inicio» en el
 * celular. Se puede crear a partir del logo o subir otra imagen; en ambos casos
 * se convierte a un cuadrado sin deformar antes de guardarlo.
 */
export function FaviconField({
  name,
  defaultValue,
  logoUrl,
  siteName,
  onChange,
}: {
  name: string;
  defaultValue: string;
  logoUrl: string;
  siteName: string;
  onChange: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function create(source: File | string) {
    setError(null);
    setBusy("Preparando el ícono…");
    try {
      const icon = await makeSquareIcon(source);
      setBusy("Subiendo…");
      const res = await uploadPhoto(icon, "sitio");
      if (res.ok) {
        setValue(res.photo.url);
        onChange();
      } else {
        setError(res.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el ícono.");
    } finally {
      setBusy(null);
    }
  }

  const shown = value || logoUrl;

  return (
    <div>
      <input type="hidden" name={name} value={value} />

      {/* Vista previa: cómo se ve en una pestaña del navegador */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex h-10 max-w-xs items-center gap-2 rounded-t-lg border border-b-0 border-stone-300 bg-stone-100 px-3">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={`h-4 w-4 ${value ? "" : "object-contain"}`} />
          ) : (
            <span className="h-4 w-4 rounded-full bg-stone-300" />
          )}
          <span className="truncate text-xs text-stone-700">{siteName}</span>
        </div>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Ícono" className="h-16 w-16 rounded-xl border border-stone-200 bg-[repeating-conic-gradient(#e7e5e4_0_25%,#fff_0_50%)] bg-[length:12px_12px]" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {logoUrl && (
          <button
            type="button"
            onClick={() => create(logoUrl)}
            disabled={busy !== null}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {busy ?? (value ? "Volver a crearlo a partir del logo" : "Crear a partir del logo")}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (fileRef.current) fileRef.current.value = "";
            if (f) void create(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60"
        >
          Subir otra imagen
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("¿Quitar el ícono? Se va a usar el logo tal cual.")) return;
              setValue("");
              onChange();
            }}
            className="px-2 py-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Quitar
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-stone-400">
        Es el dibujito que aparece en la pestaña del navegador y al guardar la página en el celular.
        Se convierte solo a un cuadrado, sin deformar. Ideal: algo simple que se reconozca chiquito.
      </p>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
