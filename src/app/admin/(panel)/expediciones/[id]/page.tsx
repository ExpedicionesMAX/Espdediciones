import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  updateExpedition,
  changeExpeditionStatus,
  deleteExpedition,
} from "@/server/actions/expeditions";
import {
  ExpeditionForm,
  type ExpeditionFormValues,
} from "@/components/admin/ExpeditionForm";
import { toNumber, STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar expedición" };

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const numStr = (v: unknown) => {
  const n = toNumber(v);
  return n === null ? "" : String(n);
};

export default async function EditExpeditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_UPDATE);
  const { id } = await params;
  const { saved } = await searchParams;

  const exp = await prisma.expedition.findUnique({
    where: { id },
    include: { itinerary: { orderBy: { dayNumber: "asc" } } },
  });
  if (!exp) notFound();

  const [destinations, guides] = await Promise.all([
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.guide.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const values: ExpeditionFormValues = {
    id: exp.id,
    publicSlug: exp.slug,
    name: exp.name,
    slug: exp.slug,
    title: exp.title ?? "",
    subtitle: exp.subtitle ?? "",
    shortDescription: exp.shortDescription ?? "",
    fullDescription: exp.fullDescription ?? "",
    activityType: exp.activityType ?? "",
    difficulty: exp.difficulty ?? "",
    destinationId: exp.destinationId ?? "",
    leadGuideId: exp.leadGuideId ?? "",
    template: exp.template,
    status: exp.status,
    currency: exp.currency,
    country: exp.country ?? "",
    region: exp.region ?? "",
    startDate: toDateInput(exp.startDate),
    endDate: toDateInput(exp.endDate),
    registrationDeadline: toDateInput(exp.registrationDeadline),
    durationDays: exp.durationDays?.toString() ?? "",
    distanceKm: numStr(exp.distanceKm),
    elevationGain: exp.elevationGain?.toString() ?? "",
    maxAltitude: exp.maxAltitude?.toString() ?? "",
    minAge: exp.minAge?.toString() ?? "",
    capacity: exp.capacity?.toString() ?? "",
    price: numStr(exp.price),
    depositPrice: numStr(exp.depositPrice),
    coverImage: exp.coverImage ?? "",
    videoUrl: exp.videoUrl ?? "",
    gallery: exp.gallery.join("\n"),
    includes: exp.includes.join("\n"),
    excludes: exp.excludes.join("\n"),
    requirements: exp.requirements.join("\n"),
    equipment: exp.equipment.join("\n"),
    recommendations: exp.recommendations ?? "",
    seoTitle: exp.seoTitle ?? "",
    seoDescription: exp.seoDescription ?? "",
    whatsappMessage: exp.whatsappMessage ?? "",
    featured: exp.featured,
    itinerary: exp.itinerary.map((d) => ({
      title: d.title,
      description: d.description ?? "",
      distanceKm: numStr(d.distanceKm),
      elevationGain: d.elevationGain?.toString() ?? "",
      altitude: d.altitude?.toString() ?? "",
      accommodation: d.accommodation ?? "",
    })),
  };

  const canPublish = hasPermission(user, PERMISSIONS.EXPEDITION_PUBLISH);
  const canDelete = hasPermission(user, PERMISSIONS.EXPEDITION_DELETE);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/expediciones" className="text-sm text-stone-500 hover:text-ink">
            ← Expediciones
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink">{exp.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[exp.status]}`}>
              {STATUS_LABELS[exp.status]}
            </span>
          </div>
        </div>

        {canPublish && (
          <div className="flex flex-wrap gap-2">
            <form action={changeExpeditionStatus}>
              <input type="hidden" name="id" value={exp.id} />
              <input type="hidden" name="status" value="OPEN" />
              <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Publicar
              </button>
            </form>
            <form action={changeExpeditionStatus}>
              <input type="hidden" name="id" value={exp.id} />
              <input type="hidden" name="status" value="DRAFT" />
              <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                Despublicar
              </button>
            </form>
            <form action={changeExpeditionStatus}>
              <input type="hidden" name="id" value={exp.id} />
              <input type="hidden" name="status" value="ARCHIVED" />
              <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                Archivar
              </button>
            </form>
          </div>
        )}
      </div>

      {saved && (
        <p className="mb-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">
          Cambios guardados.
        </p>
      )}

      <ExpeditionForm
        action={updateExpedition}
        values={values}
        destinations={destinations}
        guides={guides}
        canPublish={canPublish}
      />

      {canDelete && (
        <details className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-red-700">
            Zona de peligro
          </summary>
          <p className="mt-2 text-sm text-red-700">
            Eliminar es permanente. Considerá «Archivar» en su lugar.
          </p>
          <form action={deleteExpedition} className="mt-3">
            <input type="hidden" name="id" value={exp.id} />
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Eliminar definitivamente
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
