import Link from "next/link";
import type { CRMStage, Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { STAGE_LABELS, STAGE_STYLES, STAGE_ORDER } from "@/lib/crm-labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "CRM · Contactos" };

export default async function CRMPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string; q?: string }>;
}) {
  await requirePermission(PERMISSIONS.CRM_READ);
  const sp = await searchParams;

  const stage =
    sp.etapa && STAGE_ORDER.includes(sp.etapa as CRMStage)
      ? (sp.etapa as CRMStage)
      : undefined;

  const where: Prisma.CRMContactWhereInput = {};
  if (stage) where.stage = stage;
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const [contacts, grouped, total] = await Promise.all([
    prisma.cRMContact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { _count: { select: { inquiries: true, reservations: true } } },
    }),
    prisma.cRMContact.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.cRMContact.count(),
  ]);

  const countByStage = new Map<CRMStage, number>(
    grouped.map((g) => [g.stage, g._count._all]),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-semibold text-ink">CRM · Contactos</h1>
      <p className="mt-1 text-stone-500">
        {total} contacto{total === 1 ? "" : "s"}. Se crean solos con cada consulta e inscripción.
      </p>

      {/* Embudo */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/crm"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${!stage ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
        >
          Todos ({total})
        </Link>
        {STAGE_ORDER.map((s) => (
          <Link
            key={s}
            href={`/admin/crm?etapa=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${stage === s ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
          >
            {STAGE_LABELS[s]} ({countByStage.get(s) ?? 0})
          </Link>
        ))}
      </div>

      <form method="get" className="mt-4 flex gap-2">
        {stage && <input type="hidden" name="etapa" value={stage} />}
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Buscar por nombre o email…"
          className="w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
          Buscar
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Actividad</th>
                <th className="px-4 py-3 font-medium">Últim. cambio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                    No hay contactos {stage ? "en esta etapa" : "todavía"}.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/crm/${c.id}`} className="font-medium text-ink hover:text-accent">
                        {c.name ?? c.email}
                      </Link>
                      {c.name && <p className="text-xs text-stone-400">{c.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_STYLES[c.stage]}`}>
                        {STAGE_LABELS[c.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {c._count.inquiries} consulta{c._count.inquiries === 1 ? "" : "s"} ·{" "}
                      {c._count.reservations} inscrip.
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {formatDate(c.updatedAt, { day: "numeric", month: "short" })}
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
