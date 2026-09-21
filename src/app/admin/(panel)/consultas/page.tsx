import Link from "next/link";
import type { InquiryStatus } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateInquiryStatus } from "@/server/actions/inquiries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Consultas" };

const INQUIRY_STATUSES: InquiryStatus[] = [
  "PENDING",
  "CONTACTED",
  "INFO_SENT",
  "CLOSED",
  "SPAM",
];

const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  INFO_SENT: "Info enviada",
  CLOSED: "Cerrada",
  SPAM: "Spam",
};

const STATUS_STYLES: Record<InquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONTACTED: "bg-sky-100 text-sky-800",
  INFO_SENT: "bg-indigo-100 text-indigo-800",
  CLOSED: "bg-stone-200 text-stone-600",
  SPAM: "bg-red-100 text-red-700",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.INQUIRY_READ);
  const sp = await searchParams;
  const canUpdate = hasPermission(user, PERMISSIONS.INQUIRY_UPDATE);

  const filter =
    sp.estado && INQUIRY_STATUSES.includes(sp.estado as InquiryStatus)
      ? (sp.estado as InquiryStatus)
      : undefined;

  const inquiries = await prisma.contactInquiry.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { expedition: { select: { name: true, slug: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Consultas / CRM
      </h1>
      <p className="mt-1 text-stone-500">
        Las consultas de visitantes entran como «Pendiente». Nada se publica en
        el sitio.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/consultas"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${!filter ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
        >
          Todas
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/consultas?estado=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === s ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
            No hay consultas {filter ? "con este estado" : "todavía"}.
          </div>
        ) : (
          inquiries.map((q) => (
            <div key={q.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{q.name}</p>
                  <p className="text-sm text-stone-500">
                    <a href={`mailto:${q.email}`} className="hover:text-accent">{q.email}</a>
                    {q.phone ? ` · ${q.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[q.status]}`}>
                    {STATUS_LABELS[q.status]}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDate(q.createdAt, { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{q.message}</p>

              {q.expedition && (
                <p className="mt-3 text-xs text-stone-500">
                  Sobre:{" "}
                  <Link href={`/expediciones/${q.expedition.slug}`} target="_blank" className="text-accent hover:underline">
                    {q.expedition.name}
                  </Link>
                </p>
              )}

              {canUpdate && (
                <form action={updateInquiryStatus} className="mt-4 flex items-center gap-2">
                  <input type="hidden" name="id" value={q.id} />
                  <select
                    name="status"
                    defaultValue={q.status}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
                  >
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-ink px-4 py-1.5 text-sm font-semibold text-white hover:bg-stone-800">
                    Actualizar
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
