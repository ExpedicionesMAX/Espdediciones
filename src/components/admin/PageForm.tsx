"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePage, type PageFormState } from "@/server/actions/pages";

export type PageFormValues = {
  id?: string;
  publicSlug?: string;
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  coverImage: string;
  published: boolean;
  showInMenu: boolean;
  menuOrder: string;
  seoTitle: string;
  seoDescription: string;
};

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function PageForm({ values }: { values: PageFormValues }) {
  const [state, formAction, pending] = useActionState<PageFormState, FormData>(
    savePage,
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
          <label htmlFor="title" className={labelCls}>Título *</label>
          <input id="title" name="title" required defaultValue={values.title} className={inputCls} />
          {err("title") && <p className="mt-1 text-xs text-red-600">{err("title")}</p>}
        </div>
        <div>
          <label htmlFor="slug" className={labelCls}>Slug (URL)</label>
          <input id="slug" name="slug" defaultValue={values.slug} placeholder="se-genera-solo" className={inputCls} />
          {err("slug") && <p className="mt-1 text-xs text-red-600">{err("slug")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subtitle" className={labelCls}>Subtítulo</label>
        <input id="subtitle" name="subtitle" defaultValue={values.subtitle} className={inputCls} />
      </div>

      <div>
        <label htmlFor="coverImage" className={labelCls}>Imagen de portada (URL)</label>
        <input id="coverImage" name="coverImage" defaultValue={values.coverImage} placeholder="https://…" className={inputCls} />
        {err("coverImage") && <p className="mt-1 text-xs text-red-600">{err("coverImage")}</p>}
      </div>

      <div>
        <label htmlFor="content" className={labelCls}>Contenido</label>
        <textarea id="content" name="content" rows={12} defaultValue={values.content} className={inputCls} placeholder="Escribí el texto de la página. Dejá una línea en blanco para separar párrafos." />
        <p className="mt-1 text-xs text-stone-400">Los saltos de línea y párrafos se respetan.</p>
      </div>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-ink">Publicación y menú</legend>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="published" defaultChecked={values.published} className="h-4 w-4 rounded border-stone-300" />
            Publicada (visible en el sitio)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="showInMenu" defaultChecked={values.showInMenu} className="h-4 w-4 rounded border-stone-300" />
            Mostrar en el menú del sitio
          </label>
          <div>
            <label htmlFor="menuOrder" className={labelCls}>Orden en el menú</label>
            <input id="menuOrder" name="menuOrder" inputMode="numeric" defaultValue={values.menuOrder} className={`${inputCls} max-w-[120px]`} />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-ink">SEO</legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="seoTitle" className={labelCls}>Título SEO</label>
            <input id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="seoDescription" className={labelCls}>Meta descripción</label>
            <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={values.seoDescription} className={inputCls} />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar página"}
        </button>
        {values.publicSlug && (
          <Link href={`/${values.publicSlug}`} target="_blank" className="text-sm font-medium text-stone-600 hover:text-ink">
            Ver ↗
          </Link>
        )}
        <Link href="/admin/paginas" className="text-sm text-stone-500 hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
