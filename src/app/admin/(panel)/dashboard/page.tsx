import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const now = new Date();
  const [
    totalExpeditions,
    publicExpeditions,
    draftExpeditions,
    upcomingCount,
    pendingInquiries,
    totalInquiries,
    pendingReservations,
    upcoming,
    activity,
  ] = await Promise.all([
    prisma.expedition.count(),
    prisma.expedition.count({ where: publicExpeditionWhere() }),
    prisma.expedition.count({ where: { status: "DRAFT" } }),
    prisma.expedition.count({
      where: publicExpeditionWhere({ startDate: { gte: now } }),
    }),
    prisma.contactInquiry.count({ where: { status: "PENDING" } }),
    prisma.contactInquiry.count(),
    prisma.reservation.count({ where: { status: { in: ["PENDING", "WAITLIST"] } } }),
    prisma.expedition.findMany({
      where: publicExpeditionWhere({ startDate: { gte: now } }),
      orderBy: { startDate: "asc" },
      take: 5,
      select: { id: true, name: true, startDate: true, status: true, spotsTaken: true, capacity: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.EXPEDITION_CREATE);
  const canSeeInquiries = hasPermission(user, PERMISSIONS.INQUIRY_READ);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Hola, {user.name ?? "equipo"}
          </h1>
          <p className="mt-1 text-stone-500">Resumen de la plataforma.</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/expediciones/nueva"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            + Nueva expedición
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Expediciones" value={totalExpeditions} hint={`${publicExpeditions} publicadas`} />
        <StatCard label="Próximas salidas" value={upcomingCount} />
        <StatCard label="Borradores" value={draftExpeditions} />
        <StatCard label="Consultas pendientes" value={pendingInquiries} hint={`${totalInquiries} en total`} />
        <StatCard label="Inscripciones pendientes" value={pendingReservations} />
        <StatCard label="Consultas totales" value={totalInquiries} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Próximas expediciones */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Próximas expediciones</h2>
            <Link href="/admin/expediciones" className="text-sm font-medium text-accent hover:text-accent-dark">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {upcoming.length === 0 ? (
              <p className="p-5 text-sm text-stone-500">No hay próximas salidas publicadas.</p>
            ) : (
              upcoming.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/expediciones/${e.id}`}
                  className="flex items-center justify-between p-4 hover:bg-stone-50"
                >
                  <div>
                    <p className="font-medium text-ink">{e.name}</p>
                    <p className="text-xs text-stone-500">{formatDate(e.startDate)}</p>
                  </div>
                  <span className="text-xs text-stone-500">
                    {e.capacity ? `${e.spotsTaken}/${e.capacity}` : "—"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Actividad reciente */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Actividad reciente</h2>
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-2">
            {activity.length === 0 ? (
              <p className="p-3 text-sm text-stone-500">Sin actividad todavía.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 p-3">
                    <div>
                      <p className="text-sm text-ink">{a.summary ?? a.action}</p>
                      <p className="text-xs text-stone-400">{a.user?.name ?? "Sistema"}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-stone-400">
                      {formatDate(a.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {canSeeInquiries && (
            <Link
              href="/admin/consultas"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark"
            >
              Ver consultas →
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
