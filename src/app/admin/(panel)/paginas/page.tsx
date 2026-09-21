import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Páginas" };

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const sp = await searchParams;

  const pages = await prisma.page.findMany({
    orderBy: [{ menuOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Páginas</h1>
          <p className="mt-1 text-stone-500">Nosotros, FAQ, Filosofía… con su propia URL.</p>
        </div>
        <Link href="/admin/paginas/nueva" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
          + Nueva página
        </Link>
      </div>

      {sp.saved && <p className="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Guardado.</p>}
      {sp.deleted && <p className="mt-4 rounded-lg bg-stone-200 px-4 py-2 text-sm text-stone-700">Página eliminada.</p>}

      <div className="mt-6 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {pages.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">
            No hay páginas.{" "}
            <Link href="/admin/paginas/nueva" className="text-accent hover:underline">Creá la primera.</Link>
          </p>
        ) : (
          pages.map((p) => (
            <Link key={p.id} href={`/admin/paginas/${p.id}`} className="flex items-center justify-between p-4 hover:bg-stone-50">
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-xs text-stone-400">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.showInMenu && (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">En menú</span>
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>
                  {p.published ? "Publicada" : "Borrador"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
