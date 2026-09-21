import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteGuide } from "@/server/actions/guides";
import { GuideForm, type GuideFormValues } from "@/components/admin/GuideForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar guía" };

type Social = { instagram?: string; youtube?: string; facebook?: string; website?: string };

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.GUIDE_MANAGE);
  const { id } = await params;

  const g = await prisma.guide.findUnique({ where: { id } });
  if (!g) notFound();

  const social = (g.social as Social | null) ?? {};

  const values: GuideFormValues = {
    id: g.id,
    name: g.name,
    slug: g.slug,
    photo: g.photo ?? "",
    bio: g.bio ?? "",
    experience: g.experience ?? "",
    certifications: g.certifications.join("\n"),
    specialties: g.specialties.join(", "),
    languages: g.languages.join(", "),
    socialInstagram: social.instagram ?? "",
    socialYoutube: social.youtube ?? "",
    socialFacebook: social.facebook ?? "",
    socialWebsite: social.website ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/guias" className="text-sm text-stone-500 hover:text-ink">← Guías</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">{g.name}</h1>
      <GuideForm values={values} />

      <details className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-red-700">Zona de peligro</summary>
        <p className="mt-2 text-sm text-red-700">
          Al eliminar, las expediciones asociadas quedan sin este guía (no se borran).
        </p>
        <form action={deleteGuide} className="mt-3">
          <input type="hidden" name="id" value={g.id} />
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Eliminar guía
          </button>
        </form>
      </details>
    </div>
  );
}
