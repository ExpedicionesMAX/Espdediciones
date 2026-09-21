import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deletePage } from "@/server/actions/pages";
import { PageForm, type PageFormValues } from "@/components/admin/PageForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar página" };

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const { id } = await params;

  const p = await prisma.page.findUnique({ where: { id } });
  if (!p) notFound();

  const values: PageFormValues = {
    id: p.id,
    publicSlug: p.published ? p.slug : undefined,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle ?? "",
    content: p.content ?? "",
    coverImage: p.coverImage ?? "",
    published: p.published,
    showInMenu: p.showInMenu,
    menuOrder: String(p.menuOrder),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/paginas" className="text-sm text-stone-500 hover:text-ink">← Páginas</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">{p.title}</h1>
      <PageForm values={values} />

      <details className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-red-700">Zona de peligro</summary>
        <p className="mt-2 text-sm text-red-700">Eliminar una página es permanente.</p>
        <form action={deletePage} className="mt-3">
          <input type="hidden" name="id" value={p.id} />
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Eliminar página
          </button>
        </form>
      </details>
    </div>
  );
}
