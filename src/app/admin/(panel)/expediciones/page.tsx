import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_LABELS, STATUS_LABELS, STATUS_STYLES, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Expediciones" };

export default async function AdminExpeditionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_READ);
  const sp = await searchParams;
  const canCreate = hasPermission(user, PERMISSIONS.EXPEDITION_CREATE);

  const expeditions = await prisma.expedition.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      activityType: true,
      startDate: true,
      capacity: true,
      spotsTaken: true,
      destination: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Expediciones</h1>
          <p className="mt-1 text-stone-500">{expeditions.length} en total</p>
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

      {sp.deleted && (
        <p className="mt-4 rounded-lg bg-stone-200 px-4 py-2 text-sm text-stone-700">
          Expedición eliminada.
        </p>
      )}
      {sp.saved && (
        <p className="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">
          Cambios guardados.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Actividad</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cupos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expeditions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                    Todavía no hay expediciones.{" "}
                    {canCreate && (
                      <Link href="/admin/expediciones/nueva" className="text-accent hover:underline">
                        Creá la primera.
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                expeditions.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/expediciones/${e.id}`} className="font-medium text-ink hover:text-accent">
                        {e.name}
                      </Link>
                      {e.destination && (
                        <p className="text-xs text-stone-400">{e.destination.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.activityType ? ACTIVITY_LABELS[e.activityType] : "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.startDate ? formatDate(e.startDate, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.capacity ? `${e.spotsTaken}/${e.capacity}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/expediciones/${e.id}`} className="text-sm font-medium text-accent hover:underline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
