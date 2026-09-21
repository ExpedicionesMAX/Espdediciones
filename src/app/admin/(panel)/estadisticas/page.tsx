import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estadísticas" };

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export default async function StatsPage() {
  await requirePermission(PERMISSIONS.STATS_VIEW);

  const [viewsAgg, totalInquiries, totalReservations, totalContacts, expeditions] =
    await Promise.all([
      prisma.expedition.aggregate({ _sum: { viewsCount: true } }),
      prisma.contactInquiry.count(),
      prisma.reservation.count(),
      prisma.cRMContact.count(),
      prisma.expedition.findMany({
        orderBy: { viewsCount: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          viewsCount: true,
          _count: { select: { inquiries: true, reservations: true } },
        },
      }),
    ]);

  const totalViews = viewsAgg._sum.viewsCount ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Estadísticas</h1>
      <p className="mt-1 text-stone-500">
        Rendimiento del sitio. Las visitas cuentan solo las de visitantes (no las del equipo).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitas a expediciones" value={totalViews} />
        <StatCard label="Consultas" value={totalInquiries} hint={pct(totalInquiries, totalViews) + " de las visitas"} />
        <StatCard label="Inscripciones" value={totalReservations} hint={pct(totalReservations, totalViews) + " de las visitas"} />
        <StatCard label="Contactos (CRM)" value={totalContacts} />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">Por expedición</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Expedición</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Visitas</th>
                <th className="px-4 py-3 text-right font-medium">Consultas</th>
                <th className="px-4 py-3 text-right font-medium">Inscrip.</th>
                <th className="px-4 py-3 text-right font-medium">Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expeditions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                    Todavía no hay expediciones.
                  </td>
                </tr>
              ) : (
                expeditions.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/expediciones/${e.id}`} className="font-medium text-ink hover:text-accent">
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-700">{e.viewsCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-700">{e._count.inquiries}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-700">{e._count.reservations}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                      {pct(e._count.reservations, e.viewsCount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-stone-400">
        Conversión = inscripciones ÷ visitas. Es una referencia; una expedición nueva con pocas
        visitas puede mostrar valores poco representativos.
      </p>
    </div>
  );
}
