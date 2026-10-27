"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateSettings, type SettingsFormState } from "@/server/actions/settings";
import { FONT_OPTIONS } from "@/lib/fonts";
import type { WhyPillar } from "@/lib/site";
import { useDirtyForm } from "@/components/admin/useUnsavedChanges";
import { UnsavedBadge } from "@/components/admin/content-form-ui";
import { ImageField } from "@/components/admin/ImageField";
import { LOGO_SHADOWS, LOGO_SIZES } from "@/lib/logo-size";

const initial: SettingsFormState = { ok: false };

export type SettingsFormValues = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoSize: string;
  logoShadow: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  accentColor: string;
  displayFont: string;
  paymentMode: string;
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
  homeWhyPillars: WhyPillar[];
  upcomingExpeditionId: string;
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

export function SettingsForm({
  values,
  expeditions,
}: {
  values: SettingsFormValues;
  expeditions: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateSettings, initial);
  const { dirty, markDirty, formProps } = useDirtyForm(state);
  const [logo, setLogo] = useState(values.logoUrl);
  const [logoSize, setLogoSize] = useState(values.logoSize);
  const [logoShadow, setLogoShadow] = useState(values.logoShadow);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  const [pillars, setPillars] = useState<WhyPillar[]>(
    values.homeWhyPillars.length > 0 ? values.homeWhyPillars : [],
  );

  const updatePillar = (i: number, patch: Partial<WhyPillar>) =>
    setPillars((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPillar = () =>
    setPillars((ps) => [...ps, { title: "", description: "", icon: "", active: true }]);
  const removePillar = (i: number) => setPillars((ps) => ps.filter((_, idx) => idx !== i));
  const movePillar = (i: number, dir: -1 | 1) =>
    setPillars((ps) => {
      const j = i + dir;
      if (j < 0 || j >= ps.length) return ps;
      const next = [...ps];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form action={formAction} {...formProps} className="max-w-2xl space-y-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && !dirty && (
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
          <label htmlFor="logoUrl" className={labelCls}>Logo</label>
          <input type="hidden" name="logoUrl" value={logo} />
          <ImageField
            id="logoUrl"
            value={logo}
            folder="sitio"
            onChange={(url) => {
              setLogo(url);
              markDirty();
            }}
            hint="Aparece arriba a la izquierda en lugar del nombre, y al tocarlo lleva al inicio. Ideal: PNG con fondo transparente. Si lo quitás, vuelve a verse el nombre."
          />
          {err("logoUrl") && <p className="mt-1 text-xs text-red-600">{err("logoUrl")}</p>}
        </div>
        {logo && (
          <fieldset>
            <legend className={labelCls}>Tamaño del logo</legend>
            <div className="flex flex-wrap gap-1.5">
              {LOGO_SIZES.map((s) => (
                <label
                  key={s.key}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${logoSize === s.key ? "bg-ink text-white ring-ink" : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-100"}`}
                >
                  <input
                    type="radio"
                    name="logoSize"
                    value={s.key}
                    checked={logoSize === s.key}
                    onChange={() => setLogoSize(s.key)}
                    className="sr-only"
                  />
                  {s.label}
                </label>
              ))}
            </div>
            <p className={`${labelCls} mt-4`}>Sombra (relieve)</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Sombra del logo">
              {LOGO_SHADOWS.map((s) => (
                <label
                  key={s.key}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${logoShadow === s.key ? "bg-ink text-white ring-ink" : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-100"}`}
                >
                  <input
                    type="radio"
                    name="logoShadow"
                    value={s.key}
                    checked={logoShadow === s.key}
                    onChange={() => setLogoShadow(s.key)}
                    className="sr-only"
                  />
                  {s.label}
                </label>
              ))}
            </div>
            {/* Vista previa: así se ve en la barra superior del sitio */}
            <div className="mt-3 flex items-center justify-between gap-4 rounded-xl bg-stone-700 bg-gradient-to-r from-stone-800 to-stone-600 px-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt="Vista previa del logo"
                className={`w-auto max-w-[60%] object-contain ${LOGO_SIZES.find((s) => s.key === logoSize)?.className ?? ""} ${LOGO_SHADOWS.find((s) => s.key === logoShadow)?.className ?? ""}`}
              />
              <span className="hidden text-xs font-medium text-white/80 sm:block">Nosotros · Nuestros Viajes · Galería</span>
            </div>
          </fieldset>
        )}
        {!logo && (
          <>
            <input type="hidden" name="logoSize" value={logoSize} />
            <input type="hidden" name="logoShadow" value={logoShadow} />
          </>
        )}
        <div>
          <label htmlFor="accentColor" className={labelCls}>Color de acento</label>
          <div className="flex items-center gap-3">
            <input id="accentColor" name="accentColor" defaultValue={values.accentColor} placeholder="#ea580c" className={`${inputCls} max-w-[160px]`} />
            <span className="inline-block h-8 w-8 rounded-lg border border-stone-200" style={{ backgroundColor: values.accentColor }} />
          </div>
          {err("accentColor") && <p className="mt-1 text-xs text-red-600">{err("accentColor")}</p>}
        </div>
        <div>
          <label htmlFor="displayFont" className={labelCls}>Tipografía de los títulos</label>
          <select id="displayFont" name="displayFont" defaultValue={values.displayFont} className={inputCls}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">Cambia el estilo de todos los títulos del sitio.</p>
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

      <Card title="Cobro de inscripciones" description="Cómo paga el visitante después de inscribirse.">
        <div>
          <label htmlFor="paymentMode" className={labelCls}>Modo de cobro</label>
          <select id="paymentMode" name="paymentMode" defaultValue={values.paymentMode} className={inputCls}>
            <option value="whatsapp">Coordinar por WhatsApp (enviar comprobante)</option>
            <option value="mercadopago">Mercado Pago (pago online)</option>
          </select>
          <p className="mt-1 text-xs text-stone-400">
            <strong>WhatsApp:</strong> el visitante se inscribe y le aparece un botón para coordinar
            el pago y mandar el comprobante por WhatsApp (cobrás por fuera).{" "}
            <strong>Mercado Pago:</strong> pago online (el cliente elige seña o total) — se activa
            cuando cargues las credenciales de Mercado Pago.
          </p>
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

      <Card title="Textos de la home" description="Los textos del inicio institucional ahora se editan en su propia sección.">
        {/* Valores anteriores (ya no se muestran en el inicio): se reenvían tal cual para no borrarlos al guardar. */}
        <input type="hidden" name="homeExpsTitle" value={values.homeExpsTitle} />
        <input type="hidden" name="homeExpsSubtitle" value={values.homeExpsSubtitle} />
        <input type="hidden" name="ctaTitle" value={values.ctaTitle} />
        <input type="hidden" name="ctaText" value={values.ctaText} />
        <input type="hidden" name="ctaButton" value={values.ctaButton} />
        <p className="text-sm text-stone-600">
          Portada, historia, filosofía, equipo, la selección de viajes, el cierre y el orden de las
          secciones se editan en{" "}
          <Link href="/admin/inicio" className="font-semibold text-accent hover:underline">
            Inicio (Nosotros)
          </Link>
          .
        </p>
      </Card>

      <Card title="Home — Próxima experiencia" description="Sección opcional del inicio (se activa y ordena en «Inicio (Nosotros)»). Si no elegís ninguna, se toma la de fecha más próxima.">

        <div>
          <label htmlFor="upcomingExpeditionId" className={labelCls}>Próxima experiencia destacada</label>
          <select
            id="upcomingExpeditionId"
            name="upcomingExpeditionId"
            defaultValue={values.upcomingExpeditionId}
            className={inputCls}
          >
            <option value="">Automática (la de fecha más próxima)</option>
            {expeditions.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card title="Home — ¿Por qué nosotros?" description="Pilares que diferencian al proyecto (ícono, título y descripción). Sección opcional del inicio: se ordena u oculta en «Inicio (Nosotros)».">
        <input type="hidden" name="homeWhyPillars" value={JSON.stringify(pillars)} />
        <div>
          <label htmlFor="homeWhyTitle" className={labelCls}>Título de la sección</label>
          <input id="homeWhyTitle" name="homeWhyTitle" defaultValue={values.homeWhyTitle} placeholder="¿Por qué nosotros?" className={inputCls} />
        </div>

        <div className="space-y-3">
          {pillars.length === 0 && (
            <p className="text-sm text-stone-400">Todavía no hay pilares. Agregá el primero.</p>
          )}
          {pillars.map((p, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={p.icon ?? ""}
                  onChange={(e) => updatePillar(i, { icon: e.target.value })}
                  placeholder="✦"
                  className="w-14 rounded-lg border border-stone-300 bg-white px-2 py-2 text-center text-sm focus:border-accent focus:outline-none"
                  aria-label="Ícono (emoji)"
                />
                <input
                  value={p.title}
                  onChange={(e) => updatePillar(i, { title: e.target.value })}
                  placeholder="Título del pilar"
                  className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
                <label className="flex items-center gap-1 text-xs text-stone-500">
                  <input
                    type="checkbox"
                    checked={p.active !== false}
                    onChange={(e) => updatePillar(i, { active: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  Activo
                </label>
                <button type="button" onClick={() => movePillar(i, -1)} className="px-1 text-stone-400 hover:text-ink" aria-label="Subir">↑</button>
                <button type="button" onClick={() => movePillar(i, 1)} className="px-1 text-stone-400 hover:text-ink" aria-label="Bajar">↓</button>
                <button type="button" onClick={() => removePillar(i)} className="px-1 text-red-500 hover:text-red-700" aria-label="Eliminar">✕</button>
              </div>
              <textarea
                value={p.description ?? ""}
                onChange={(e) => updatePillar(i, { description: e.target.value })}
                placeholder="Descripción breve"
                rows={2}
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addPillar}
            className="rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:border-accent hover:text-accent"
          >
            + Agregar pilar
          </button>
        </div>
      </Card>

      <Card title="Sello de reseñas (home)" description="Un sello opcional en la portada.">
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
        <UnsavedBadge show={dirty && !pending} />
      </div>
    </form>
  );
}
