import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { DestinationForm, type DestinationFormValues } from "@/components/admin/DestinationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo destino" };

const EMPTY: DestinationFormValues = {
  name: "",
  slug: "",
  country: "",
  region: "",
  description: "",
  coverImage: "",
  gallery: "",
  latitude: "",
  longitude: "",
};

export default async function NewDestinationPage() {
  await requirePermission(PERMISSIONS.DESTINATION_MANAGE);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/destinos" className="text-sm text-stone-500 hover:text-ink">← Destinos</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">Nuevo destino</h1>
      <DestinationForm values={EMPTY} />
    </div>
  );
}
