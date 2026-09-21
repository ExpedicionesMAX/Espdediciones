import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guías" };

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requirePermission(PERMISSIONS.GUIDE_MANAGE);
  const sp = await searchParams;

  const guides = await prisma.guide.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { ledExpeditions: true, expeditions: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Guías</h1>
          <p className="mt-1 text-stone-500">{guides.length} en total</p>
        </div>
        <Link href="/admin/guias/nueva" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
          + Nuevo guía
        </Link>
      </div>

      {sp.saved && <p className="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Guardado.</p>}
      {sp.deleted && <p className="mt-4 rounded-lg bg-stone-200 px-4 py-2 text-sm text-stone-700">Guía eliminado.</p>}

      <div className="mt-6 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {guides.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">
            No hay guías.{" "}
            <Link href="/admin/guias/nueva" className="text-accent hover:underline">Creá el primero.</Link>
          </p>
        ) : (
          guides.map((g) => (
            <Link key={g.id} href={`/admin/guias/${g.id}`} className="flex items-center justify-between p-4 hover:bg-stone-50">
              <div>
                <p className="font-medium text-ink">{g.name}</p>
                {g.specialties.length > 0 && (
                  <p className="text-xs text-stone-500">{g.specialties.join(" · ")}</p>
                )}
              </div>
              <span className="text-xs text-stone-500">
                {g._count.ledExpeditions + g._count.expeditions} expediciones
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
