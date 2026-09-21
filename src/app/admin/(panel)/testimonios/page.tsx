import Link from "next/link";
import type { TestimonialStatus } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { moderateTestimonial } from "@/server/actions/testimonials";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Testimonios" };

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
      : "PENDING";

  const [testimonials, pendingCount] = await Promise.all([
    prisma.testimonial.findMany({
      where: { status: filter },
      orderBy: { createdAt: "desc" },
      include: { expedition: { select: { name: true, slug: true } } },
    }),
    prisma.testimonial.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Testimonios</h1>
      <p className="mt-1 text-stone-500">
        Los testimonios de visitantes entran «Pendientes». Solo se publican los que apruebes.
        {pendingCount > 0 ? ` Tenés ${pendingCount} sin revisar.` : ""}
      </p>

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
            No hay testimonios {STATUS_LABELS[filter].toLowerCase()}.
          </div>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{t.authorName}</p>
                  {t.rating ? (
                    <p className="text-sm text-accent">
                      {"★".repeat(t.rating)}
                      <span className="text-stone-300">{"★".repeat(5 - t.rating)}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABELS[t.status].replace(/s$/, "")}
                  </span>
                  <span className="text-xs text-stone-400">{formatDate(t.createdAt, { day: "numeric", month: "short" })}</span>
                </div>
              </div>

              <blockquote className="mt-3 whitespace-pre-line text-sm text-stone-700">“{t.text}”</blockquote>

              {t.expedition && (
                <p className="mt-3 text-xs text-stone-500">
                  Sobre:{" "}
                  <Link href={`/expediciones/${t.expedition.slug}`} target="_blank" className="text-accent hover:underline">
                    {t.expedition.name}
                  </Link>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {t.status !== "APPROVED" && (
                  <StatusButton id={t.id} status="APPROVED" label="Aprobar" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700" />
                )}
                {t.status !== "REJECTED" && (
                  <StatusButton id={t.id} status="REJECTED" label="Rechazar" className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100" />
                )}
                {t.status !== "ARCHIVED" && (
                  <StatusButton id={t.id} status="ARCHIVED" label="Archivar" className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
