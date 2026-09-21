"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveDestination, type DestinationFormState } from "@/server/actions/destinations";

export type DestinationFormValues = {
  id?: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  description: string;
  coverImage: string;
  gallery: string;
  latitude: string;
  longitude: string;
};

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function DestinationForm({ values }: { values: DestinationFormValues }) {
  const [state, formAction, pending] = useActionState<DestinationFormState, FormData>(
    saveDestination,
    { ok: false },
  );
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelCls}>Nombre *</label>
          <input id="name" name="name" required defaultValue={values.name} className={inputCls} />
          {err("name") && <p className="mt-1 text-xs text-red-600">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor="slug" className={labelCls}>Slug</label>
          <input id="slug" name="slug" defaultValue={values.slug} placeholder="se-genera-solo" className={inputCls} />
        </div>
        <div>
          <label htmlFor="country" className={labelCls}>País *</label>
          <input id="country" name="country" required defaultValue={values.country} className={inputCls} />
          {err("country") && <p className="mt-1 text-xs text-red-600">{err("country")}</p>}
        </div>
        <div>
          <label htmlFor="region" className={labelCls}>Región</label>
          <input id="region" name="region" defaultValue={values.region} className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>Descripción</label>
        <textarea id="description" name="description" rows={4} defaultValue={values.description} className={inputCls} />
      </div>

      <div>
        <label htmlFor="coverImage" className={labelCls}>Imagen de portada (URL)</label>
        <input id="coverImage" name="coverImage" defaultValue={values.coverImage} placeholder="https://…" className={inputCls} />
        {err("coverImage") && <p className="mt-1 text-xs text-red-600">{err("coverImage")}</p>}
      </div>

      <div>
        <label htmlFor="gallery" className={labelCls}>Galería (una URL por línea)</label>
        <textarea id="gallery" name="gallery" rows={3} defaultValue={values.gallery} className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="latitude" className={labelCls}>Latitud</label>
          <input id="latitude" name="latitude" inputMode="decimal" defaultValue={values.latitude} className={inputCls} />
        </div>
        <div>
          <label htmlFor="longitude" className={labelCls}>Longitud</label>
          <input id="longitude" name="longitude" inputMode="decimal" defaultValue={values.longitude} className={inputCls} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar destino"}
        </button>
        <Link href="/admin/destinos" className="text-sm text-stone-500 hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
