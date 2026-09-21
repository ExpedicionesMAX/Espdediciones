import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteDestination } from "@/server/actions/destinations";
import { DestinationForm, type DestinationFormValues } from "@/components/admin/DestinationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar destino" };

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.DESTINATION_MANAGE);
  const { id } = await params;

  const d = await prisma.destination.findUnique({ where: { id } });
  if (!d) notFound();

  const values: DestinationFormValues = {
    id: d.id,
    name: d.name,
    slug: d.slug,
    country: d.country,
    region: d.region ?? "",
    description: d.description ?? "",
    coverImage: d.coverImage ?? "",
    gallery: d.gallery.join("\n"),
    latitude: d.latitude?.toString() ?? "",
    longitude: d.longitude?.toString() ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/destinos" className="text-sm text-stone-500 hover:text-ink">← Destinos</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold text-ink">{d.name}</h1>
      <DestinationForm values={values} />

      <details className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-red-700">Zona de peligro</summary>
        <p className="mt-2 text-sm text-red-700">
          Al eliminar, las expediciones asociadas quedan sin destino (no se borran).
        </p>
        <form action={deleteDestination} className="mt-3">
          <input type="hidden" name="id" value={d.id} />
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Eliminar destino
          </button>
        </form>
      </details>
    </div>
  );
}
