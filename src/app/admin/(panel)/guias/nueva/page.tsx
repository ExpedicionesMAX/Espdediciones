import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { GuideForm, type GuideFormValues } from "@/components/admin/GuideForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo guía" };

const EMPTY: GuideFormValues = {
  name: "",
  slug: "",
  photo: "",
  bio: "",
  experience: "",
  certifications: "",
  specialties: "",
  languages: "",
  socialInstagram: "",
  socialYoutube: "",
  socialFacebook: "",
  socialWebsite: "",
};

export default async function NewGuidePage() {
  await requirePermission(PERMISSIONS.GUIDE_MANAGE);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/guias" className="text-sm text-stone-500 hover:text-ink">← Guías</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">Nuevo guía</h1>
      <GuideForm values={EMPTY} />
    </div>
  );
}
