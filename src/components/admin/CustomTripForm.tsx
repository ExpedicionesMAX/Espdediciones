"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateCustomTripContent, type PageContentFormState } from "@/server/actions/page-content";
import {
  CUSTOM_TRIP_DEFAULTS,
  type CustomTripContent,
  type ProcessStep,
} from "@/lib/custom-trip-content";
import { ImageField } from "@/components/admin/ImageField";
import { useSavedSnapshot } from "@/components/admin/useUnsavedChanges";
import {
  Card,
  ListEditor,
  ProvisionalBadge,
  SaveBar,
  TextField,
  inputCls,
  labelCls,
} from "@/components/admin/content-form-ui";

const initial: PageContentFormState = { ok: false };
const D = CUSTOM_TRIP_DEFAULTS;

export function CustomTripForm({
  stored,
  hasWhatsapp,
}: {
  stored: CustomTripContent;
  hasWhatsapp: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateCustomTripContent, initial);
  const [c, setC] = useState<CustomTripContent>(stored);
  const payload = JSON.stringify(c);
  const { dirty, onSubmit } = useSavedSnapshot(payload, state);

  const set = <K extends keyof CustomTripContent>(block: K, patch: Partial<CustomTripContent[K]>) =>
    setC((prev) => ({ ...prev, [block]: { ...(prev[block] as object), ...patch } }) as CustomTripContent);

  return (
    <form action={formAction} onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <input type="hidden" name="payload" value={payload} />

      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Viajes a Medida es una página propia (<code>/viajes-a-medida</code>), separada del catálogo.
        Los campos <ProvisionalBadge /> muestran un texto sugerido: no prometas destinos, precios ni
        condiciones que no estén confirmados.
      </p>

      <Card title="Portada">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField id="ct-eyebrow" label="Rótulo" value={c.hero.eyebrow} onChange={(v) => set("hero", { eyebrow: v })} placeholder={D.hero.eyebrow} />
          <TextField id="ct-title" label="Título principal" value={c.hero.title} onChange={(v) => set("hero", { title: v })} placeholder={D.hero.title} />
        </div>
        <TextField id="ct-text" label="Texto" value={c.hero.text} onChange={(v) => set("hero", { text: v })} placeholder={D.hero.text} multiline />
        <div>
          <label htmlFor="ct-image" className={labelCls}>Fotografía</label>
          <ImageField id="ct-image" value={c.hero.image} onChange={(v) => set("hero", { image: v })} hint="Vacío = una foto de tus viajes publicados." />
        </div>
        <TextField id="ct-alt" label="Descripción de la foto" value={c.hero.imageAlt} onChange={(v) => set("hero", { imageAlt: v })} />
      </Card>

      <Card title="Explicación del servicio">
        <TextField id="ct-intro-title" label="Título" value={c.intro.title} onChange={(v) => set("intro", { title: v })} placeholder={D.intro.title} />
        <TextField id="ct-intro-body" label="Texto" value={c.intro.body} onChange={(v) => set("intro", { body: v })} placeholder={D.intro.body} multiline rows={6} hint="Dejá una línea en blanco entre párrafos." />
      </Card>

      <Card title="Proceso de consulta" description="Los pasos que sigue alguien que consulta por un viaje a medida.">
        <TextField id="ct-proc-title" label="Título" value={c.process.title} onChange={(v) => set("process", { title: v })} placeholder={D.process.title} />
        <div>
          <p className={labelCls}>
            Pasos
            {c.process.steps.length === 0 && <ProvisionalBadge />}
          </p>
          {c.process.steps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-600">
              <p>
                Se muestran los pasos sugeridos:{" "}
                <strong>{D.process.steps.map((s) => s.title).join(" → ")}</strong>.
              </p>
              <button type="button" onClick={() => set("process", { steps: D.process.steps.map((s) => ({ ...s })) })} className="mt-3 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100">
                Editar a partir de los sugeridos
              </button>
            </div>
          ) : (
            <ListEditor<ProcessStep>
              items={c.process.steps}
              onChange={(steps) => set("process", { steps })}
              newItem={() => ({ title: "", text: "" })}
              addLabel="+ Agregar paso"
              max={8}
              emptyText=""
              renderItem={(s, update, i) => (
                <div className="space-y-2">
                  <input value={s.title} onChange={(e) => update({ title: e.target.value })} placeholder="Título del paso" aria-label={`Título del paso ${i + 1}`} className={inputCls} />
                  <textarea value={s.text} onChange={(e) => update({ text: e.target.value })} placeholder="Descripción breve" aria-label={`Descripción del paso ${i + 1}`} rows={2} className={inputCls} />
                </div>
              )}
            />
          )}
        </div>
      </Card>

      <Card
        title="Formulario y contacto"
        description={
          <>
            Las consultas del formulario llegan a{" "}
            <Link href="/admin/consultas" className="text-accent hover:underline">Consultas</Link>{" "}
            (marcadas «Viaje a medida») y a Notificaciones.
          </>
        }
      >
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={c.form.show}
            onChange={(e) => set("form", { show: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300"
          />
          Mostrar el formulario de consulta
        </label>
        <TextField id="ct-form-title" label="Título del formulario" value={c.form.title} onChange={(v) => set("form", { title: v })} placeholder={D.form.title} />
        <TextField id="ct-form-text" label="Texto del formulario" value={c.form.text} onChange={(v) => set("form", { text: v })} placeholder={D.form.text} multiline rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="ct-wa-label" label="Botón de WhatsApp" value={c.whatsapp.label} onChange={(v) => set("whatsapp", { label: v })} placeholder={D.whatsapp.label} />
          <TextField id="ct-wa-msg" label="Mensaje precargado de WhatsApp" value={c.whatsapp.message} onChange={(v) => set("whatsapp", { message: v })} placeholder={D.whatsapp.message} />
        </div>
        {!hasWhatsapp && (
          <p className="text-xs text-amber-700">
            No hay número de WhatsApp en Configuración: el botón no se muestra.
          </p>
        )}
      </Card>

      <Card title="Buscadores (SEO)">
        <TextField id="ct-seo-title" label="Título para Google" value={c.seo.title} onChange={(v) => set("seo", { title: v })} placeholder={D.seo.title} />
        <TextField id="ct-seo-desc" label="Descripción para Google" value={c.seo.description} onChange={(v) => set("seo", { description: v })} placeholder={D.seo.description} multiline rows={2} />
      </Card>

      <div className="sticky bottom-4 z-10">
        <SaveBar pending={pending} success={state.success} error={state.error} label="Guardar Viajes a Medida" dirty={dirty} />
      </div>
    </form>
  );
}
