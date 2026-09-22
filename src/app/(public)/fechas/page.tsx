import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { getSiteTexts } from "@/lib/site-texts";
import {
  ACTIVITY_LABELS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  formatPrice,
} from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Próximas fechas",
  description: "Todas nuestras salidas, ordenadas por mes.",
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default async function FechasPage() {
  const texts = await getSiteTexts();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const expeditions = await prisma.expedition.findMany({
    where: publicExpeditionWhere({ startDate: { gte: today } }),
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      activityType: true,
      difficulty: true,
      startDate: true,
      endDate: true,
      durationDays: true,
      price: true,
      currency: true,
      capacity: true,
      spotsTaken: true,
      destination: { select: { name: true } },
    },
  });

  // Agrupar por mes conservando el orden cronológico
  const months: { key: string; label: string; items: typeof expeditions }[] = [];
  for (const e of expeditions) {
    if (!e.startDate) continue;
    const k = monthKey(new Date(e.startDate));
    let bucket = months.find((m) => m.key === k);
    if (!bucket) {
      const label = new Intl.DateTimeFormat("es-AR", {
        month: "long",
        year: "numeric",
      }).format(new Date(e.startDate));
      bucket = { key: k, label: label.charAt(0).toUpperCase() + label.slice(1), items: [] };
      months.push(bucket);
    }
    bucket.items.push(e);
  }

  const dayNum = (d: Date | null) => (d ? new Date(d).getDate() : null);
  const monthShort = (d: Date | null) =>
    d ? new Intl.DateTimeFormat("es-AR", { month: "short" }).format(new Date(d)).replace(".", "") : "";

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{texts.fechasTitle}</h1>
          <p className="mt-3 max-w-xl text-stone-300">{texts.fechasSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        {months.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-20 text-center">
            <p className="font-display text-xl text-ink">No hay fechas próximas publicadas.</p>
            <Link href="/expediciones" className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-dark">
              Ver todas las expediciones
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {months.map((m) => (
              <div key={m.key}>
                <h2 className="font-display text-2xl font-semibold text-ink">{m.label}</h2>
                <div className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
                  {m.items.map((e) => {
                    const start = e.startDate ? new Date(e.startDate) : null;
                    const end = e.endDate ? new Date(e.endDate) : null;
                    const sameMonth = start && end && start.getMonth() === end.getMonth();
                    const dateStr = end
                      ? sameMonth
                        ? `${dayNum(start)}–${dayNum(end)}`
                        : `${dayNum(start)} ${monthShort(start)} – ${dayNum(end)} ${monthShort(end)}`
                      : `${dayNum(start)}`;
                    const isFull = e.status === "FULL";
                    const available = e.capacity != null ? Math.max(e.capacity - e.spotsTaken, 0) : null;

                    return (
                      <article key={e.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 flex-none text-center">
                            <p className="font-display text-lg font-semibold leading-none text-ink">{dateStr}</p>
                            {!end || sameMonth ? (
                              <p className="mt-1 text-xs uppercase tracking-wide text-stone-400">{monthShort(start)}</p>
                            ) : null}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {e.difficulty && (
                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                                  {DIFFICULTY_LABELS[e.difficulty]}
                                </span>
                              )}
                              {e.activityType && (
                                <span className="text-xs text-stone-500">{ACTIVITY_LABELS[e.activityType]}</span>
                              )}
                              {e.durationDays ? (
                                <span className="text-xs text-stone-500">· {e.durationDays} días</span>
                              ) : null}
                            </div>
                            <Link href={`/expediciones/${e.slug}`} className="font-display text-lg font-semibold text-ink hover:text-accent">
                              {e.name}
                            </Link>
                            <p className="text-sm text-stone-500">
                              {e.destination?.name ?? ""}
                              {e.price != null ? ` · ${formatPrice(e.price, e.currency)}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[e.status]}`}>
                            {available != null && available > 0 && e.status !== "FULL"
                              ? `${available} cupo${available === 1 ? "" : "s"}`
                              : STATUS_LABELS[e.status]}
                          </span>
                          <Link
                            href={`/expediciones/${e.slug}#inscribirme`}
                            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
                          >
                            {isFull ? "Lista de espera" : "Inscribirme"}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
