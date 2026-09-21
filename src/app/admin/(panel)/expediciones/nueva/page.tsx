import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createExpedition } from "@/server/actions/expeditions";
import {
  ExpeditionForm,
  type ExpeditionFormValues,
} from "@/components/admin/ExpeditionForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva expedición" };

const EMPTY: ExpeditionFormValues = {
  name: "",
  slug: "",
  title: "",
  subtitle: "",
  shortDescription: "",
  fullDescription: "",
  activityType: "",
  difficulty: "",
  destinationId: "",
  leadGuideId: "",
  template: "CINEMATIC",
  status: "DRAFT",
  currency: "USD",
  country: "",
  region: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  durationDays: "",
  distanceKm: "",
  elevationGain: "",
  maxAltitude: "",
  minAge: "",
  capacity: "",
  price: "",
  depositPrice: "",
  coverImage: "",
  videoUrl: "",
  gallery: "",
  includes: "",
  excludes: "",
  requirements: "",
  equipment: "",
  recommendations: "",
  seoTitle: "",
  seoDescription: "",
  whatsappMessage: "",
  featured: false,
  itinerary: [],
};

export default async function NewExpeditionPage() {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_CREATE);

  const [destinations, guides] = await Promise.all([
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.guide.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/expediciones" className="text-sm text-stone-500 hover:text-ink">
          ← Expediciones
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Nueva expedición
        </h1>
        <p className="mt-1 text-stone-500">
          Cargá los datos y la página pública se genera automáticamente.
        </p>
      </div>

      <ExpeditionForm
        action={createExpedition}
        values={EMPTY}
        destinations={destinations}
        guides={guides}
        canPublish={hasPermission(user, PERMISSIONS.EXPEDITION_PUBLISH)}
      />
    </div>
  );
}
