"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateHomeContent, type PageContentFormState } from "@/server/actions/page-content";
import {
  HOME_DEFAULTS,
  HOME_SECTIONS,
  LOCKED_SECTIONS,
  type HomeContent,
  type PhilosophyItem,
  type TeamMember,
} from "@/lib/home-content";
import { ImageField } from "@/components/admin/ImageField";
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
const D = HOME_DEFAULTS;

export function HomeContentForm({
  stored,
  siteName,
  aboutPageText,
}: {
  stored: HomeContent;
  siteName: string;
  /** Texto actual de la página «Nosotros» (respaldo de la historia). */
  aboutPageText: string;
}) {
  const [state, formAction, pending] = useActionState(updateHomeContent, initial);
  const [c, setC] = useState<HomeContent>(stored);

  // Actualizadores por bloque
  const set = <K extends keyof HomeContent>(block: K, patch: Partial<HomeContent[K]>) =>
    setC((prev) => ({ ...prev, [block]: { ...(prev[block] as object), ...patch } }) as HomeContent);

  const moveSection = (i: number, dir: -1 | 1) =>
    setC((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.sections.length) return prev;
      const next = [...prev.sections];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...prev, sections: next };
    });
  const toggleSection = (i: number) =>
    setC((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => (idx === i ? { ...s, visible: !s.visible } : s)),
    }));

  const sectionMeta = (key: string) => HOME_SECTIONS.find((s) => s.key === key);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(c)} />

      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Los campos marcados <ProvisionalBadge /> muestran un texto sugerido que todavía no
        cargaste. Reemplazalos por la información real del proyecto: el sitio nunca inventa
        biografías, trayectoria ni servicios.
      </p>

      {/* ─── PORTADA ─── */}
      <Card title="1 · Portada (primera pantalla)" description="Lo primero que ve el visitante: quiénes son y qué es el proyecto.">
        <TextField id="hero-eyebrow" label="Rótulo superior" value={c.hero.eyebrow} onChange={(v) => set("hero", { eyebrow: v })} placeholder={siteName} hint="Vacío = el nombre del sitio." />
        <TextField id="hero-title" label="Título principal" value={c.hero.title} onChange={(v) => set("hero", { title: v })} placeholder={D.hero.title} hint="La filosofía del proyecto en una frase." />
        <TextField id="hero-text" label="Texto de presentación" value={c.hero.text} onChange={(v) => set("hero", { text: v })} placeholder={D.hero.text} multiline />
        <div>
          <label htmlFor="hero-image" className={labelCls}>Fotografía de portada</label>
          <ImageField id="hero-image" value={c.hero.image} onChange={(v) => set("hero", { image: v })} hint="Una foto de naturaleza o de una experiencia real. Vacío = la portada de un viaje destacado." />
        </div>
        <TextField id="hero-alt" label="Descripción de la foto (accesibilidad)" value={c.hero.imageAlt} onChange={(v) => set("hero", { imageAlt: v })} placeholder="Ej.: Atardecer sobre el río, con el grupo fotografiando" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="hero-pl" label="Botón principal" value={c.hero.primaryLabel} onChange={(v) => set("hero", { primaryLabel: v })} placeholder={D.hero.primaryLabel} />
          <TextField id="hero-ph" label="Destino del botón principal" value={c.hero.primaryHref} onChange={(v) => set("hero", { primaryHref: v })} placeholder={D.hero.primaryHref} hint="#nosotros, /expediciones, /viajes-a-medida o https://…" />
          <TextField id="hero-sl" label="Botón secundario" value={c.hero.secondaryLabel} onChange={(v) => set("hero", { secondaryLabel: v })} placeholder={D.hero.secondaryLabel} />
          <TextField id="hero-sh" label="Destino del botón secundario" value={c.hero.secondaryHref} onChange={(v) => set("hero", { secondaryHref: v })} placeholder={D.hero.secondaryHref} />
        </div>
      </Card>

      {/* ─── HISTORIA ─── */}
      <Card title="2 · Nosotros / Nuestra historia" description="La historia del proyecto, la motivación, la relación con la fotografía y la naturaleza, cómo organizan las experiencias.">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField id="story-eyebrow" label="Rótulo" value={c.story.eyebrow} onChange={(v) => set("story", { eyebrow: v })} placeholder={D.story.eyebrow} />
          <TextField id="story-title" label="Título" value={c.story.title} onChange={(v) => set("story", { title: v })} placeholder={D.story.title} />
        </div>
        <TextField id="story-intro" label="Bajada (texto destacado, opcional)" value={c.story.intro} onChange={(v) => set("story", { intro: v })} multiline rows={2} />
        <div>
          <label htmlFor="story-body" className={labelCls}>
            Historia completa
            {!c.story.body && <ProvisionalBadge />}
          </label>
          <textarea
            id="story-body"
            value={c.story.body}
            onChange={(e) => set("story", { body: e.target.value })}
            rows={10}
            placeholder={aboutPageText || "Contá la historia del proyecto. Dejá una línea en blanco entre párrafos."}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-stone-400">
            Dejá una línea en blanco entre párrafos.{" "}
            {aboutPageText
              ? "Mientras esté vacío se muestra el texto de la página «Nosotros» (el que ves de sugerencia)."
              : "Si queda vacío, la sección no se muestra."}
          </p>
        </div>
        <div>
          <label htmlFor="story-image" className={labelCls}>Fotografía</label>
          <ImageField id="story-image" value={c.story.image} onChange={(v) => set("story", { image: v })} hint="Vacío = otra foto de tus viajes publicados (si hay)." />
        </div>
        <TextField id="story-alt" label="Descripción de la foto" value={c.story.imageAlt} onChange={(v) => set("story", { imageAlt: v })} />
      </Card>

      {/* ─── FILOSOFÍA ─── */}
      <Card title="3 · Nuestra filosofía" description="Qué distingue al proyecto. Solo conceptos y compromisos reales.">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField id="ph-eyebrow" label="Rótulo" value={c.philosophy.eyebrow} onChange={(v) => set("philosophy", { eyebrow: v })} placeholder={D.philosophy.eyebrow} />
          <TextField id="ph-title" label="Título" value={c.philosophy.title} onChange={(v) => set("philosophy", { title: v })} placeholder={D.philosophy.title} />
        </div>
        <TextField id="ph-intro" label="Introducción (opcional)" value={c.philosophy.intro} onChange={(v) => set("philosophy", { intro: v })} multiline rows={2} />
        <div>
          <p className={labelCls}>
            Conceptos
            {c.philosophy.items.length === 0 && <ProvisionalBadge />}
          </p>
          {c.philosophy.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-600">
              <p>
                Se muestran los conceptos sugeridos:{" "}
                <strong>{D.philosophy.items.map((i) => i.title).join(", ")}</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => set("philosophy", { items: D.philosophy.items.map((i) => ({ ...i })) })} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100">
                  Editar a partir de los sugeridos
                </button>
                <button type="button" onClick={() => set("philosophy", { items: [{ title: "", text: "" }] })} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100">
                  Empezar de cero
                </button>
              </div>
            </div>
          ) : (
            <ListEditor<PhilosophyItem>
              items={c.philosophy.items}
              onChange={(items) => set("philosophy", { items })}
              newItem={() => ({ title: "", text: "" })}
              addLabel="+ Agregar concepto"
              max={12}
              emptyText=""
              renderItem={(item, update, i) => (
                <div className="space-y-2">
                  <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="Concepto (ej.: Exploración)" aria-label={`Concepto ${i + 1}`} className={inputCls} />
                  <textarea value={item.text} onChange={(e) => update({ text: e.target.value })} placeholder="Explicación breve (opcional)" aria-label={`Explicación del concepto ${i + 1}`} rows={2} className={inputCls} />
                </div>
              )}
            />
          )}
          <p className="mt-1 text-xs text-stone-400">Los conceptos sin título no se guardan.</p>
        </div>
      </Card>

      {/* ─── EQUIPO ─── */}
      <Card title="4 · Equipo" description="Integrantes del proyecto. La sección se muestra solo si cargás al menos uno.">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField id="team-eyebrow" label="Rótulo" value={c.team.eyebrow} onChange={(v) => set("team", { eyebrow: v })} placeholder={D.team.eyebrow} />
          <TextField id="team-title" label="Título" value={c.team.title} onChange={(v) => set("team", { title: v })} placeholder={D.team.title} />
        </div>
        <TextField id="team-intro" label="Introducción (opcional)" value={c.team.intro} onChange={(v) => set("team", { intro: v })} multiline rows={2} />
        <ListEditor<TeamMember>
          items={c.team.members}
          onChange={(members) => set("team", { members })}
          newItem={() => ({ name: "", role: "", bio: "", photo: "" })}
          addLabel="+ Agregar integrante"
          max={24}
          emptyText="Todavía no hay integrantes cargados."
          renderItem={(m, update, i) => (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={m.name} onChange={(e) => update({ name: e.target.value })} placeholder="Nombre" aria-label={`Nombre del integrante ${i + 1}`} className={inputCls} />
                <input value={m.role} onChange={(e) => update({ role: e.target.value })} placeholder="Rol (ej.: Fotógrafo y guía)" aria-label={`Rol del integrante ${i + 1}`} className={inputCls} />
              </div>
              <textarea value={m.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="Presentación breve" aria-label={`Presentación del integrante ${i + 1}`} rows={3} className={inputCls} />
              <ImageField id={`team-photo-${i}`} value={m.photo} onChange={(v) => update({ photo: v })} />
            </div>
          )}
        />
      </Card>

      {/* ─── VIAJES ─── */}
      <Card
        title="5 · Nuestros Viajes"
        description={
          <>
            Transición hacia las experiencias. Muestra hasta 3 viajes publicados: los marcados como
            «destacados» en{" "}
            <Link href="/admin/expediciones" className="text-accent hover:underline">Expediciones</Link>{" "}
            (o los primeros publicados si no hay destacados).
          </>
        }
      >
        <TextField id="trips-title" label="Título" value={c.trips.title} onChange={(v) => set("trips", { title: v })} placeholder={D.trips.title} />
        <TextField id="trips-text" label="Texto de apoyo" value={c.trips.text} onChange={(v) => set("trips", { text: v })} placeholder={D.trips.text} multiline />
        <TextField id="trips-btn" label="Texto del botón (lleva al catálogo)" value={c.trips.buttonLabel} onChange={(v) => set("trips", { buttonLabel: v })} placeholder={D.trips.buttonLabel} />
      </Card>

      {/* ─── CIERRE ─── */}
      <Card
        title="6 · Cierre y contacto"
        description={
          <>
            Invitación final. Muestra el WhatsApp, el email y las redes de{" "}
            <Link href="/admin/configuracion" className="text-accent hover:underline">Configuración</Link>.
          </>
        }
      >
        <TextField id="closing-title" label="Título" value={c.closing.title} onChange={(v) => set("closing", { title: v })} placeholder={D.closing.title} />
        <TextField id="closing-text" label="Texto" value={c.closing.text} onChange={(v) => set("closing", { text: v })} placeholder={D.closing.text} multiline />
        <TextField id="closing-btn" label="Texto del botón de WhatsApp" value={c.closing.buttonLabel} onChange={(v) => set("closing", { buttonLabel: v })} placeholder={D.closing.buttonLabel} />
      </Card>

      {/* ─── ORDEN Y VISIBILIDAD ─── */}
      <Card title="Orden y visibilidad de las secciones" description="La portada siempre va primero. Usá las flechas para reordenar y la casilla para mostrar u ocultar.">
        <ol className="space-y-2">
          {c.sections.map((s, i) => {
            const meta = sectionMeta(s.key);
            const locked = LOCKED_SECTIONS.includes(s.key);
            return (
              <li key={s.key} className="flex items-center gap-3 rounded-xl border border-stone-200 px-3 py-2.5">
                <input
                  type="checkbox"
                  id={`sec-${s.key}`}
                  checked={s.visible}
                  disabled={locked}
                  onChange={() => toggleSection(i)}
                  className="h-4 w-4 rounded border-stone-300 disabled:opacity-50"
                />
                <label htmlFor={`sec-${s.key}`} className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${s.visible ? "text-ink" : "text-stone-400 line-through"}`}>
                    {meta?.label ?? s.key}
                  </span>
                  {meta && "hint" in meta && <span className="block text-xs text-stone-400">{meta.hint}</span>}
                </label>
                <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="px-1.5 text-stone-400 hover:text-ink disabled:opacity-30" aria-label={`Subir ${meta?.label}`}>↑</button>
                <button type="button" onClick={() => moveSection(i, 1)} disabled={i === c.sections.length - 1} className="px-1.5 text-stone-400 hover:text-ink disabled:opacity-30" aria-label={`Bajar ${meta?.label}`}>↓</button>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="sticky bottom-4 z-10">
        <SaveBar pending={pending} success={state.success} error={state.error} label="Guardar inicio" />
      </div>
    </form>
  );
}
