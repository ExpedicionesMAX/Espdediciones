"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsFormState } from "@/server/actions/settings";

const initial: SettingsFormState = { ok: false };

export type SettingsFormValues = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  accentColor: string;
  socialInstagram: string;
  socialYoutube: string;
  socialFacebook: string;
  socialTiktok: string;
  socialLinkedin: string;
  socialX: string;
  socialVimeo: string;
  homeExpsTitle: string;
  homeExpsSubtitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  homeWhyTitle: string;
  homeWhyItems: string;
  reviewsLabel: string;
  reviewsUrl: string;
};

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ values }: { values: SettingsFormValues }) {
  const [state, formAction, pending] = useActionState(updateSettings, initial);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          Configuración guardada. Los cambios ya se ven en el sitio.
        </p>
      )}

      <Card title="Identidad">
        <div>
          <label htmlFor="siteName" className={labelCls}>Nombre del sitio *</label>
          <input id="siteName" name="siteName" required defaultValue={values.siteName} className={inputCls} />
          {err("siteName") && <p className="mt-1 text-xs text-red-600">{err("siteName")}</p>}
        </div>
        <div>
          <label htmlFor="tagline" className={labelCls}>Frase / tagline</label>
          <input id="tagline" name="tagline" defaultValue={values.tagline} className={inputCls} />
        </div>
        <div>
          <label htmlFor="logoUrl" className={labelCls}>Logo (URL)</label>
          <input id="logoUrl" name="logoUrl" defaultValue={values.logoUrl} placeholder="https://… (si lo dejás vacío se muestra el nombre)" className={inputCls} />
          {err("logoUrl") && <p className="mt-1 text-xs text-red-600">{err("logoUrl")}</p>}
        </div>
        <div>
          <label htmlFor="accentColor" className={labelCls}>Color de acento</label>
          <div className="flex items-center gap-3">
            <input id="accentColor" name="accentColor" defaultValue={values.accentColor} placeholder="#ea580c" className={`${inputCls} max-w-[160px]`} />
            <span className="inline-block h-8 w-8 rounded-lg border border-stone-200" style={{ backgroundColor: values.accentColor }} />
          </div>
          {err("accentColor") && <p className="mt-1 text-xs text-red-600">{err("accentColor")}</p>}
        </div>
      </Card>

      <Card title="Contacto" description="Aparece en el pie del sitio y en la página de Contacto.">
        <div>
          <label htmlFor="whatsappNumber" className={labelCls}>WhatsApp (formato internacional, solo números)</label>
          <input id="whatsappNumber" name="whatsappNumber" defaultValue={values.whatsappNumber} placeholder="5491100000000" className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className={labelCls}>Email</label>
            <input id="contactEmail" name="contactEmail" type="email" defaultValue={values.contactEmail} className={inputCls} />
            {err("contactEmail") && <p className="mt-1 text-xs text-red-600">{err("contactEmail")}</p>}
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelCls}>Teléfono</label>
            <input id="contactPhone" name="contactPhone" defaultValue={values.contactPhone} className={inputCls} />
          </div>
        </div>
      </Card>

      <Card title="Redes sociales" description="Pegá la URL completa de cada red que uses.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="social_instagram" className={labelCls}>Instagram</label>
            <input id="social_instagram" name="social_instagram" defaultValue={values.socialInstagram} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_youtube" className={labelCls}>YouTube</label>
            <input id="social_youtube" name="social_youtube" defaultValue={values.socialYoutube} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_facebook" className={labelCls}>Facebook</label>
            <input id="social_facebook" name="social_facebook" defaultValue={values.socialFacebook} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_tiktok" className={labelCls}>TikTok</label>
            <input id="social_tiktok" name="social_tiktok" defaultValue={values.socialTiktok} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_linkedin" className={labelCls}>LinkedIn</label>
            <input id="social_linkedin" name="social_linkedin" defaultValue={values.socialLinkedin} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_x" className={labelCls}>X</label>
            <input id="social_x" name="social_x" defaultValue={values.socialX} className={inputCls} />
          </div>
          <div>
            <label htmlFor="social_vimeo" className={labelCls}>Vimeo</label>
            <input id="social_vimeo" name="social_vimeo" defaultValue={values.socialVimeo} className={inputCls} />
          </div>
        </div>
      </Card>

      <Card title="Textos de la home" description="Los títulos y el llamado a la acción de la portada. Vacío = usa el texto por defecto.">
        <div>
          <label htmlFor="homeExpsTitle" className={labelCls}>Título de la sección de expediciones</label>
          <input id="homeExpsTitle" name="homeExpsTitle" defaultValue={values.homeExpsTitle} placeholder="Próximas expediciones" className={inputCls} />
        </div>
        <div>
          <label htmlFor="homeExpsSubtitle" className={labelCls}>Subtítulo de esa sección</label>
          <input id="homeExpsSubtitle" name="homeExpsSubtitle" defaultValue={values.homeExpsSubtitle} placeholder="Salidas guiadas con cupos limitados." className={inputCls} />
        </div>
        <hr className="border-stone-100" />
        <div>
          <label htmlFor="ctaTitle" className={labelCls}>Título del llamado a la acción (final de la home)</label>
          <input id="ctaTitle" name="ctaTitle" defaultValue={values.ctaTitle} placeholder="¿Buscás una expedición a medida?" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ctaText" className={labelCls}>Texto del llamado a la acción</label>
          <textarea id="ctaText" name="ctaText" rows={2} defaultValue={values.ctaText} placeholder="Contanos qué tenés en mente…" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ctaButton" className={labelCls}>Texto del botón</label>
          <input id="ctaButton" name="ctaButton" defaultValue={values.ctaButton} placeholder="Escribinos" className={`${inputCls} max-w-xs`} />
        </div>
      </Card>

      <Card title="Diferenciales y reseñas (home)" description="Una banda de «por qué elegirnos» y un sello de reseñas en la portada. Vacío = no se muestran.">
        <div>
          <label htmlFor="homeWhyTitle" className={labelCls}>Título de la banda de diferenciales</label>
          <input id="homeWhyTitle" name="homeWhyTitle" defaultValue={values.homeWhyTitle} placeholder="Por qué elegirnos" className={inputCls} />
        </div>
        <div>
          <label htmlFor="homeWhyItems" className={labelCls}>Diferenciales (uno por línea)</label>
          <textarea id="homeWhyItems" name="homeWhyItems" rows={4} defaultValue={values.homeWhyItems} placeholder={"Guías profesionales que conocen cada sendero\nLa mejor experiencia, sin improvisación\n+8 años transitando montañas con seguridad"} className={inputCls} />
        </div>
        <hr className="border-stone-100" />
        <div>
          <label htmlFor="reviewsLabel" className={labelCls}>Sello de reseñas</label>
          <input id="reviewsLabel" name="reviewsLabel" defaultValue={values.reviewsLabel} placeholder="★ 5.0 · +140 reseñas en Google" className={inputCls} />
        </div>
        <div>
          <label htmlFor="reviewsUrl" className={labelCls}>Link de las reseñas (opcional)</label>
          <input id="reviewsUrl" name="reviewsUrl" defaultValue={values.reviewsUrl} placeholder="https://…" className={inputCls} />
          {err("reviewsUrl") && <p className="mt-1 text-xs text-red-600">{err("reviewsUrl")}</p>}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
