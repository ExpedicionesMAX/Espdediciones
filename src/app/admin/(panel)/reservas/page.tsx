import Link from "next/link";
import type { ReservationStatus } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateReservationStatus } from "@/server/actions/reservations";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservas" };

const STATUSES: ReservationStatus[] = ["PENDING", "WAITLIST", "CONFIRMED", "CANCELLED"];

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Preinscripción",
  WAITLIST: "Lista de espera",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  WAITLIST: "bg-sky-100 text-sky-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-stone-200 text-stone-600",
};

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.RESERVATION_READ);
  const sp = await searchParams;
  const canManage = hasPermission(user, PERMISSIONS.RESERVATION_MANAGE);

  const filter =
    sp.estado && STATUSES.includes(sp.estado as ReservationStatus)
      ? (sp.estado as ReservationStatus)
      : undefined;

  const reservations = await prisma.reservation.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { expedition: { select: { name: true, slug: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Reservas e inscripciones</h1>
      <p className="mt-1 text-stone-500">
        Las inscripciones de visitantes entran como «Preinscripción». Gestionalas hasta confirmarlas.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/reservas"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${!filter ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
        >
          Todas
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/reservas?estado=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === s ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
            No hay inscripciones {filter ? "con este estado" : "todavía"}.
          </div>
        ) : (
          reservations.map((r) => (
            <div key={r.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{r.firstName} {r.lastName}</p>
                  <p className="text-sm text-stone-500">
                    <a href={`mailto:${r.email}`} className="hover:text-accent">{r.email}</a>
                    {r.phone ? ` · ${r.phone}` : ""}
                    {r.city || r.country ? ` · ${[r.city, r.country].filter(Boolean).join(", ")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDate(r.createdAt, { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-stone-600">
                Expedición:{" "}
                <Link href={`/expediciones/${r.expedition.slug}`} target="_blank" className="text-accent hover:underline">
                  {r.expedition.name}
                </Link>
              </p>

              {(r.emergencyContact || r.experience || r.notes) && (
                <dl className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm text-stone-600">
                  {r.emergencyContact && (
                    <div><dt className="inline font-medium text-ink">Emergencia:</dt> {r.emergencyContact}</div>
                  )}
                  {r.experience && (
                    <div><dt className="inline font-medium text-ink">Experiencia:</dt> {r.experience}</div>
                  )}
                  {r.notes && (
                    <div><dt className="inline font-medium text-ink">Notas:</dt> {r.notes}</div>
                  )}
                </dl>
              )}

              {canManage && (
                <form action={updateReservationStatus} className="mt-4 flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
                  >
                    {STATUSES.map((s) => (
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
