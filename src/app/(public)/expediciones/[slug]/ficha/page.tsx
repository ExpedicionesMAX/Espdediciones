import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Expedition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";
import { getBaseUrl } from "@/lib/base-url";
import { qrPngDataUrl, qrSvg } from "@/lib/qr";
import { FichaActions } from "@/components/public/FichaActions";
import {
  ACTIVITY_LABELS,
  DIFFICULTY_LABELS,
  formatDateRange,
  formatPrice,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ficha técnica",
  robots: { index: false },
};

function isVisible(exp: Pick<Expedition, "publishedAt" | "status" | "unpublishAt">): boolean {
  if (!exp.publishedAt || exp.publishedAt > new Date()) return false;
  if (!["OPEN", "LIMITED", "FULL", "COMPLETED"].includes(exp.status)) return false;
  if (exp.unpublishAt && exp.unpublishAt <= new Date()) return false;
  return true;
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
        {title}
      </h3>
      <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const exp = await prisma.expedition.findUnique({
    where: { slug },
    include: {
      destination: true,
      leadGuide: true,
      itinerary: { orderBy: { dayNumber: "asc" } },
    },
  });
  if (!exp) notFound();

  const visible = isVisible(exp);
  const session = await auth();
  if (!visible && !session?.user) notFound();

  const settings = await getSiteSettings();
  const publicUrl = `${getBaseUrl()}/expediciones/${exp.slug}`;
  const [qrPng, qrSvgStr] = await Promise.all([
    qrPngDataUrl(publicUrl),
    qrSvg(publicUrl),
  ]);

  const facts: { label: string; value: string }[] = [];
  if (exp.durationDays) facts.push({ label: "Duración", value: `${exp.durationDays} días` });
  if (exp.difficulty) facts.push({ label: "Dificultad", value: DIFFICULTY_LABELS[exp.difficulty] });
  if (exp.activityType) facts.push({ label: "Actividad", value: ACTIVITY_LABELS[exp.activityType] });
  if (exp.distanceKm) facts.push({ label: "Distancia", value: `${exp.distanceKm} km` });
  if (exp.maxAltitude) facts.push({ label: "Altitud máx.", value: `${exp.maxAltitude} m` });
  if (exp.capacity) facts.push({ label: "Cupos", value: `${exp.capacity}` });

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-8 text-ink print:max-w-none print:px-0 print:py-0">
      <div className="mb-6">
        <FichaActions qrPng={qrPng} qrSvg={qrSvgStr} slug={exp.slug} />
      </div>

      {/* Encabezado */}
      <header className="flex items-start justify-between border-b-2 border-ink pb-4">
        <div>
          <p className="font-display text-lg font-semibold">{settings.siteName}</p>
          <p className="text-xs uppercase tracking-widest text-stone-500">Ficha técnica</p>
        </div>
        {exp.destination && (
          <p className="text-right text-xs text-stone-500">
            {exp.destination.name}
            {exp.destination.country ? ` · ${exp.destination.country}` : ""}
          </p>
        )}
      </header>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight">{exp.name}</h1>
          {exp.subtitle && <p className="mt-1 text-stone-600">{exp.subtitle}</p>}
          <p className="mt-2 text-sm text-stone-500">{formatDateRange(exp.startDate, exp.endDate)}</p>
        </div>
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrPng} alt="QR de la expedición" className="h-28 w-28" />
          <p className="mt-1 text-[10px] text-stone-400">Escaneá para verla online</p>
        </div>
      </div>

      {/* Datos rápidos */}
      {facts.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg border border-stone-200 p-4">
          {facts.map((f) => (
            <div key={f.label}>
              <p className="text-[10px] uppercase tracking-wide text-stone-500">{f.label}</p>
              <p className="font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {exp.shortDescription && (
        <p className="mt-5 text-sm leading-relaxed text-stone-700">{exp.shortDescription}</p>
      )}

      {/* Itinerario resumido */}
      {exp.itinerary.length > 0 && (
        <div className="mt-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
            Itinerario
          </h3>
          <ol className="mt-1 space-y-1 text-sm text-stone-700">
            {exp.itinerary.map((d) => (
              <li key={d.id}>
                <span className="font-medium">Día {d.dayNumber}:</span> {d.title}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Section title="Incluye" items={exp.includes} />
        <Section title="No incluye" items={exp.excludes} />
        <Section title="Requisitos" items={exp.requirements} />
        <Section title="Equipamiento" items={exp.equipment} />
      </div>

      {/* Precio + contacto */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">Precio desde</p>
          <p className="font-display text-2xl font-semibold">
            {formatPrice(exp.price, exp.currency)}
          </p>
        </div>
        <div className="text-right text-sm text-stone-600">
          {settings.contactEmail && <p>{settings.contactEmail}</p>}
          {settings.contactPhone && <p>{settings.contactPhone}</p>}
          <p className="text-xs text-stone-400">{publicUrl}</p>
        </div>
      </div>
    </div>
  );
}
