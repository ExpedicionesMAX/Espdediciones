import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { PageForm, type PageFormValues } from "@/components/admin/PageForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva página" };

const EMPTY: PageFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  content: "",
  coverImage: "",
  published: false,
  showInMenu: false,
  menuOrder: "0",
  seoTitle: "",
  seoDescription: "",
};

export default async function NewPagePage() {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/paginas" className="text-sm text-stone-500 hover:text-ink">← Páginas</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">Nueva página</h1>
      <PageForm values={EMPTY} />
    </div>
  );
}
