"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveGuide, type GuideFormState } from "@/server/actions/guides";

export type GuideFormValues = {
  id?: string;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  experience: string;
  certifications: string; // una por línea
  specialties: string; // separadas por coma
  languages: string; // separadas por coma
  socialInstagram: string;
  socialYoutube: string;
  socialFacebook: string;
  socialWebsite: string;
};

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function GuideForm({ values }: { values: GuideFormValues }) {
  const [state, formAction, pending] = useActionState<GuideFormState, FormData>(
    saveGuide,
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
      </div>

      <div>
        <label htmlFor="photo" className={labelCls}>Foto (URL)</label>
        <input id="photo" name="photo" defaultValue={values.photo} placeholder="https://…" className={inputCls} />
        {err("photo") && <p className="mt-1 text-xs text-red-600">{err("photo")}</p>}
      </div>

      <div>
        <label htmlFor="bio" className={labelCls}>Biografía</label>
        <textarea id="bio" name="bio" rows={3} defaultValue={values.bio} className={inputCls} />
      </div>

      <div>
        <label htmlFor="experience" className={labelCls}>Experiencia</label>
        <textarea id="experience" name="experience" rows={3} defaultValue={values.experience} className={inputCls} />
      </div>

      <div>
        <label htmlFor="certifications" className={labelCls}>Certificaciones (una por línea)</label>
        <textarea id="certifications" name="certifications" rows={3} defaultValue={values.certifications} className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="specialties" className={labelCls}>Especialidades (separadas por coma)</label>
          <input id="specialties" name="specialties" defaultValue={values.specialties} className={inputCls} />
        </div>
        <div>
          <label htmlFor="languages" className={labelCls}>Idiomas (separados por coma)</label>
          <input id="languages" name="languages" defaultValue={values.languages} className={inputCls} />
        </div>
      </div>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-ink">Redes</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="social_instagram" className={labelCls}>Instagram</label>
            <input id="social_instagram" name="social_instagram" defaultValue={values.socialInstagram} placeholder="https://…" className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_youtube" className={labelCls}>YouTube</label>
            <input id="social_youtube" name="social_youtube" defaultValue={values.socialYoutube} placeholder="https://…" className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_facebook" className={labelCls}>Facebook</label>
            <input id="social_facebook" name="social_facebook" defaultValue={values.socialFacebook} placeholder="https://…" className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_website" className={labelCls}>Sitio web</label>
            <input id="social_website" name="social_website" defaultValue={values.socialWebsite} placeholder="https://…" className={inputCls} />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar guía"}
        </button>
        <Link href="/admin/guias" className="text-sm text-stone-500 hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
