"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ExpeditionFormState } from "@/server/actions/expeditions";
import { ItineraryEditor, type ItineraryDayValue } from "./ItineraryEditor";
import { ACTIVITY_LABELS, DIFFICULTY_LABELS } from "@/lib/format";
import {
  ACTIVITY_TYPES,
  DIFFICULTIES,
  STATUSES,
  TEMPLATES,
} from "@/lib/validations/expedition";

const STATUS_TEXT: Record<(typeof STATUSES)[number], string> = {
  DRAFT: "Borrador",
  SCHEDULED: "Programada",
  OPEN: "Abierta",
  LIMITED: "Cupos limitados",
  FULL: "Completa",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
  ARCHIVED: "Archivada",
};

const TEMPLATE_TEXT: Record<(typeof TEMPLATES)[number], string> = {
  CINEMATIC: "Cinematográfico",
  EDITORIAL: "Editorial",
  EXTREME: "Extreme",
};

export type ExpeditionFormValues = {
  id?: string;
  publicSlug?: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  activityType: string;
  difficulty: string;
  destinationId: string;
  leadGuideId: string;
  template: string;
  status: string;
  currency: string;
  country: string;
  region: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  durationDays: string;
  distanceKm: string;
  elevationGain: string;
  maxAltitude: string;
  minAge: string;
  capacity: string;
  price: string;
  depositPrice: string;
  coverImage: string;
  videoUrl: string;
  gallery: string;
  includes: string;
  excludes: string;
  requirements: string;
  equipment: string;
  recommendations: string;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
  featured: boolean;
  itinerary: ItineraryDayValue[];
};

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";
const helpCls = "mt-1 text-xs text-stone-400";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ExpeditionForm({
  action,
  values,
  destinations,
  guides,
  canPublish,
}: {
  action: (state: ExpeditionFormState, fd: FormData) => Promise<ExpeditionFormState>;
  values: ExpeditionFormValues;
  destinations: { id: string; name: string }[];
  guides: { id: string; name: string }[];
  canPublish: boolean;
}) {
  const [state, formAction, pending] = useActionState<ExpeditionFormState, FormData>(
    action,
    { ok: false },
  );

  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-6 pb-24">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <Card title="General">
        <div>
          <label htmlFor="name" className={labelCls}>Nombre *</label>
          <input id="name" name="name" required defaultValue={values.name} className={inputCls} />
          {err("name") && <p className="mt-1 text-xs text-red-600">{err("name")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className={labelCls}>Slug (URL)</label>
            <input id="slug" name="slug" defaultValue={values.slug} placeholder="se-genera-solo" className={inputCls} />
            <p className={helpCls}>Vacío = se genera desde el nombre.</p>
          </div>
          <div>
            <label htmlFor="subtitle" className={labelCls}>Subtítulo</label>
            <input id="subtitle" name="subtitle" defaultValue={values.subtitle} className={inputCls} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="activityType" className={labelCls}>Actividad</label>
            <select id="activityType" name="activityType" defaultValue={values.activityType} className={inputCls}>
              <option value="">—</option>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="difficulty" className={labelCls}>Dificultad</label>
            <select id="difficulty" name="difficulty" defaultValue={values.difficulty} className={inputCls}>
              <option value="">—</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="template" className={labelCls}>Template</label>
            <select id="template" name="template" defaultValue={values.template || "CINEMATIC"} className={inputCls}>
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>{TEMPLATE_TEXT[t]}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" defaultChecked={values.featured} className="h-4 w-4 rounded border-stone-300" />
          Destacada en la home
        </label>
      </Card>

      <Card title="Ubicación">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="destinationId" className={labelCls}>Destino</label>
            <select id="destinationId" name="destinationId" defaultValue={values.destinationId} className={inputCls}>
              <option value="">—</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className={labelCls}>País</label>
            <input id="country" name="country" defaultValue={values.country} className={inputCls} />
          </div>
          <div>
            <label htmlFor="region" className={labelCls}>Región</label>
            <input id="region" name="region" defaultValue={values.region} className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="leadGuideId" className={labelCls}>Guía principal</label>
          <select id="leadGuideId" name="leadGuideId" defaultValue={values.leadGuideId} className={inputCls}>
            <option value="">—</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card title="Fechas y logística">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="startDate" className={labelCls}>Inicio</label>
            <input id="startDate" name="startDate" type="date" defaultValue={values.startDate} className={inputCls} />
          </div>
          <div>
            <label htmlFor="endDate" className={labelCls}>Fin</label>
            <input id="endDate" name="endDate" type="date" defaultValue={values.endDate} className={inputCls} />
          </div>
          <div>
            <label htmlFor="registrationDeadline" className={labelCls}>Cierre de inscripción</label>
            <input id="registrationDeadline" name="registrationDeadline" type="date" defaultValue={values.registrationDeadline} className={inputCls} />
          </div>
          <div>
            <label htmlFor="durationDays" className={labelCls}>Duración (días)</label>
            <input id="durationDays" name="durationDays" inputMode="numeric" defaultValue={values.durationDays} className={inputCls} />
          </div>
          <div>
            <label htmlFor="distanceKm" className={labelCls}>Distancia (km)</label>
            <input id="distanceKm" name="distanceKm" inputMode="decimal" defaultValue={values.distanceKm} className={inputCls} />
          </div>
          <div>
            <label htmlFor="elevationGain" className={labelCls}>Desnivel (m)</label>
            <input id="elevationGain" name="elevationGain" inputMode="numeric" defaultValue={values.elevationGain} className={inputCls} />
          </div>
          <div>
            <label htmlFor="maxAltitude" className={labelCls}>Altitud máx. (m)</label>
            <input id="maxAltitude" name="maxAltitude" inputMode="numeric" defaultValue={values.maxAltitude} className={inputCls} />
          </div>
          <div>
            <label htmlFor="minAge" className={labelCls}>Edad mínima</label>
            <input id="minAge" name="minAge" inputMode="numeric" defaultValue={values.minAge} className={inputCls} />
          </div>
          <div>
            <label htmlFor="capacity" className={labelCls}>Cupos totales</label>
            <input id="capacity" name="capacity" inputMode="numeric" defaultValue={values.capacity} className={inputCls} />
          </div>
        </div>
      </Card>

      <Card title="Precio y reserva">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className={labelCls}>Precio</label>
            <input id="price" name="price" inputMode="decimal" defaultValue={values.price} className={inputCls} />
          </div>
          <div>
            <label htmlFor="currency" className={labelCls}>Moneda</label>
            <select id="currency" name="currency" defaultValue={values.currency || "USD"} className={inputCls}>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label htmlFor="depositPrice" className={labelCls}>Seña / reserva</label>
            <input id="depositPrice" name="depositPrice" inputMode="decimal" defaultValue={values.depositPrice} className={inputCls} />
          </div>
        </div>
      </Card>

      <Card title="Descripciones">
        <div>
          <label htmlFor="shortDescription" className={labelCls}>Descripción corta</label>
          <textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={values.shortDescription} className={inputCls} />
        </div>
        <div>
          <label htmlFor="fullDescription" className={labelCls}>Descripción completa</label>
          <textarea id="fullDescription" name="fullDescription" rows={6} defaultValue={values.fullDescription} className={inputCls} />
        </div>
        <div>
          <label htmlFor="recommendations" className={labelCls}>Recomendaciones</label>
          <textarea id="recommendations" name="recommendations" rows={3} defaultValue={values.recommendations} className={inputCls} />
        </div>
      </Card>

      <Card title="Multimedia" description="Pegá URLs de imágenes/video. La subida directa a Supabase Storage se habilita al configurar sus credenciales.">
        <div>
          <label htmlFor="coverImage" className={labelCls}>Imagen de portada (URL)</label>
          <input id="coverImage" name="coverImage" defaultValue={values.coverImage} className={inputCls} placeholder="https://…" />
          {err("coverImage") && <p className="mt-1 text-xs text-red-600">{err("coverImage")}</p>}
        </div>
        <div>
          <label htmlFor="videoUrl" className={labelCls}>Video (YouTube / Vimeo)</label>
          <input id="videoUrl" name="videoUrl" defaultValue={values.videoUrl} className={inputCls} placeholder="https://youtube.com/watch?v=…" />
          {err("videoUrl") && <p className="mt-1 text-xs text-red-600">{err("videoUrl")}</p>}
        </div>
        <div>
          <label htmlFor="gallery" className={labelCls}>Galería (una URL por línea)</label>
          <textarea id="gallery" name="gallery" rows={4} defaultValue={values.gallery} className={inputCls} placeholder="https://…" />
        </div>
      </Card>

      <Card title="Qué incluye" description="Una línea por ítem.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="includes" className={labelCls}>Incluye</label>
            <textarea id="includes" name="includes" rows={4} defaultValue={values.includes} className={inputCls} />
          </div>
          <div>
            <label htmlFor="excludes" className={labelCls}>No incluye</label>
            <textarea id="excludes" name="excludes" rows={4} defaultValue={values.excludes} className={inputCls} />
          </div>
          <div>
            <label htmlFor="requirements" className={labelCls}>Requisitos</label>
            <textarea id="requirements" name="requirements" rows={4} defaultValue={values.requirements} className={inputCls} />
          </div>
          <div>
            <label htmlFor="equipment" className={labelCls}>Equipamiento</label>
            <textarea id="equipment" name="equipment" rows={4} defaultValue={values.equipment} className={inputCls} />
          </div>
        </div>
      </Card>

      <Card title="Itinerario">
        <ItineraryEditor name="itinerary" defaultValue={values.itinerary} />
      </Card>

      <Card title="SEO y contacto">
        <div>
          <label htmlFor="seoTitle" className={labelCls}>Título SEO</label>
          <input id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} className={inputCls} />
        </div>
        <div>
          <label htmlFor="seoDescription" className={labelCls}>Meta descripción</label>
          <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={values.seoDescription} className={inputCls} />
        </div>
        <div>
          <label htmlFor="whatsappMessage" className={labelCls}>Mensaje de WhatsApp</label>
          <input id="whatsappMessage" name="whatsappMessage" defaultValue={values.whatsappMessage} className={inputCls} placeholder="Hola, quiero información sobre…" />
        </div>
      </Card>

      <Card title="Publicación">
        <div>
          <label htmlFor="status" className={labelCls}>Estado</label>
          <select id="status" name="status" defaultValue={values.status || "DRAFT"} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_TEXT[s]}</option>
            ))}
          </select>
          {!canPublish && (
            <p className={helpCls}>
              No tenés permiso de publicación: si elegís un estado público se guardará como borrador.
            </p>
          )}
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/admin/expediciones" className="text-sm text-stone-500 hover:text-ink">
            Cancelar
          </Link>
          <div className="flex items-center gap-3">
            {values.publicSlug && (
              <Link
                href={`/expediciones/${values.publicSlug}`}
                target="_blank"
                className="text-sm font-medium text-stone-600 hover:text-ink"
              >
                Ver / previsualizar ↗
              </Link>
            )}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
