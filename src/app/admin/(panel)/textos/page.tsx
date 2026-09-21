import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { TextsForm } from "@/components/admin/TextsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Textos del sitio" };

export default async function TextsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);

  const s = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { texts: true },
  });
  const stored = (s?.texts as Record<string, string> | null) ?? {};

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Textos del sitio</h1>
      <p className="mt-1 text-stone-500">
        Editá los títulos y textos de las páginas y los rótulos de las secciones. Si dejás un
        campo vacío, se usa el texto por defecto (que ves como sugerencia).
      </p>
      <div className="mt-8">
        <TextsForm stored={stored} />
      </div>
    </div>
  );
}
