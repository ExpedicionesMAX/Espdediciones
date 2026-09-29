import Link from "next/link";
import type { TestimonialStatus } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  moderateTestimonial,
  createReview,
  toggleTestimonialActive,
  deleteTestimonial,
} from "@/server/actions/testimonials";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reseñas y testimonios" };

const STATUSES: TestimonialStatus[] = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"];

const STATUS_LABELS: Record<TestimonialStatus, string> = {
  PENDING: "Pendientes",
  APPROVED: "Aprobados",
  REJECTED: "Rechazados",
  ARCHIVED: "Archivados",
};

const STATUS_STYLES: Record<TestimonialStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-stone-200 text-stone-600",
};

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

function StatusButton({ id, status, label, className }: { id: string; status: TestimonialStatus; label: string; className: string }) {
  return (
    <form action={moderateTestimonial}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{label}</button>
    </form>
  );
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const sp = await searchParams;

  const filter =
    sp.estado && STATUSES.includes(sp.estado as TestimonialStatus)
      ? (sp.estado as TestimonialStatus)
      : "APPROVED";

  const [testimonials, pendingCount, expeditions] = await Promise.all([
    prisma.testimonial.findMany({
      where: { status: filter },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { expedition: { select: { name: true, slug: true } } },
    }),
    prisma.testimonial.count({ where: { status: "PENDING" } }),
    prisma.expedition.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Reseñas y testimonios</h1>
      <p className="mt-1 text-stone-500">
        Las reseñas «Aprobadas» y activas aparecen en la home. Los testimonios de visitantes entran
        «Pendientes».{pendingCount > 0 ? ` Tenés ${pendingCount} sin revisar.` : ""}
      </p>

      {/* Crear reseña */}
      <details className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-ink">
          + Nueva reseña
        </summary>
        <form action={createReview} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="authorName" required placeholder="Nombre *" className={inputCls} />
            <input name="photo" placeholder="Foto / avatar (URL, opcional)" className={inputCls} />
          </div>
          <textarea name="text" required rows={3} placeholder="Texto de la reseña *" className={inputCls} />
          <div className="grid gap-3 sm:grid-cols-3">
            <select name="rating" defaultValue="" className={inputCls}>
              <option value="">Sin estrellas</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
            <select name="expeditionId" defaultValue="" className={inputCls}>
              <option value="">Sin experiencia asociada</option>
              {expeditions.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input name="order" type="number" defaultValue="0" placeholder="Orden" className={inputCls} />
          </div>
          <button className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
            Crear reseña
          </button>
        </form>
      </details>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/testimonios?estado=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === s ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
            No hay reseñas {STATUS_LABELS[filter].toLowerCase()}.
          </div>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo} alt={t.authorName} className="h-10 w-10 rounded-full object-cover" />
                  ) : null}
                  <div>
                    <p className="font-medium text-ink">{t.authorName}</p>
                    {t.rating ? (
                      <p className="text-sm text-accent">
                        {"★".repeat(t.rating)}
                        <span className="text-stone-300">{"★".repeat(5 - t.rating)}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.status === "APPROVED" && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-500"}`}>
                      {t.active ? "En home" : "Oculta"}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABELS[t.status].replace(/s$/, "")}
                  </span>
                  <span className="text-xs text-stone-400">{formatDate(t.createdAt, { day: "numeric", month: "short" })}</span>
                </div>
              </div>

              <blockquote className="mt-3 whitespace-pre-line text-sm text-stone-700">“{t.text}”</blockquote>

              {t.expedition && (
                <p className="mt-3 text-xs text-stone-500">
                  Asociada a:{" "}
                  <Link href={`/expediciones/${t.expedition.slug}`} target="_blank" className="text-accent hover:underline">
                    {t.expedition.name}
                  </Link>
                  {" · "}orden {t.order}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {t.status !== "APPROVED" && (
                  <StatusButton id={t.id} status="APPROVED" label="Aprobar" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700" />
                )}
                {t.status === "APPROVED" && (
                  <form action={toggleTestimonialActive}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="active" value={(!t.active).toString()} />
                    <button className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100">
                      {t.active ? "Ocultar de home" : "Mostrar en home"}
                    </button>
                  </form>
                )}
                {t.status !== "REJECTED" && t.status !== "APPROVED" && (
                  <StatusButton id={t.id} status="REJECTED" label="Rechazar" className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100" />
                )}
                <form action={deleteTestimonial}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-lg border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
