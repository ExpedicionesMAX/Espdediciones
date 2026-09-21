"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExpeditionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { uniqueSlug } from "@/lib/slug";
import {
  expeditionInputSchema,
  type ExpeditionInput,
} from "@/lib/validations/expedition";

export type ExpeditionFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const PUBLIC_STATUSES: ExpeditionStatus[] = [
  "OPEN",
  "LIMITED",
  "FULL",
  "COMPLETED",
];

function isPublicStatus(status: ExpeditionStatus): boolean {
  return PUBLIC_STATUSES.includes(status);
}

function lines(fd: FormData, key: string): string[] {
  return (fd.get(key)?.toString() ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formToRaw(fd: FormData): Record<string, unknown> {
  let itinerary: unknown = [];
  try {
    const raw = fd.get("itinerary")?.toString();
    itinerary = raw ? JSON.parse(raw) : [];
  } catch {
    itinerary = [];
  }

  return {
    name: fd.get("name"),
    slug: fd.get("slug"),
    title: fd.get("title"),
    subtitle: fd.get("subtitle"),
    shortDescription: fd.get("shortDescription"),
    fullDescription: fd.get("fullDescription"),
    activityType: fd.get("activityType"),
    difficulty: fd.get("difficulty"),
    destinationId: fd.get("destinationId"),
    country: fd.get("country"),
    region: fd.get("region"),
    startDate: fd.get("startDate"),
    endDate: fd.get("endDate"),
    durationDays: fd.get("durationDays"),
    distanceKm: fd.get("distanceKm"),
    elevationGain: fd.get("elevationGain"),
    maxAltitude: fd.get("maxAltitude"),
    minAge: fd.get("minAge"),
    capacity: fd.get("capacity"),
    price: fd.get("price"),
    currency: fd.get("currency"),
    depositPrice: fd.get("depositPrice"),
    registrationDeadline: fd.get("registrationDeadline"),
    coverImage: fd.get("coverImage"),
    videoUrl: fd.get("videoUrl"),
    gallery: lines(fd, "gallery"),
    leadGuideId: fd.get("leadGuideId"),
    includes: lines(fd, "includes"),
    excludes: lines(fd, "excludes"),
    requirements: lines(fd, "requirements"),
    equipment: lines(fd, "equipment"),
    recommendations: fd.get("recommendations"),
    itinerary,
    template: fd.get("template"),
    status: fd.get("status"),
    featured: fd.get("featured") === "on" || fd.get("featured") === "true",
    seoTitle: fd.get("seoTitle"),
    seoDescription: fd.get("seoDescription"),
    whatsappMessage: fd.get("whatsappMessage"),
  };
}

/** Campos escalares comunes a create y update. Las relaciones se manejan aparte. */
function buildData(
  input: ExpeditionInput,
  finalStatus: ExpeditionStatus,
  publishedAt: Date | null,
): Prisma.ExpeditionUpdateInput {
  return {
    name: input.name,
    title: input.title ?? null,
    subtitle: input.subtitle ?? null,
    shortDescription: input.shortDescription ?? null,
    fullDescription: input.fullDescription ?? null,
    activityType: input.activityType ?? null,
    difficulty: input.difficulty ?? null,
    country: input.country ?? null,
    region: input.region ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    durationDays: input.durationDays ?? null,
    distanceKm: input.distanceKm ?? null,
    elevationGain: input.elevationGain ?? null,
    maxAltitude: input.maxAltitude ?? null,
    minAge: input.minAge ?? null,
    capacity: input.capacity ?? null,
    price: input.price ?? null,
    currency: input.currency,
    depositPrice: input.depositPrice ?? null,
    registrationDeadline: input.registrationDeadline ?? null,
    coverImage: input.coverImage ?? null,
    ogImage: input.coverImage ?? null,
    videoUrl: input.videoUrl ?? null,
    gallery: input.gallery,
    includes: input.includes,
    excludes: input.excludes,
    requirements: input.requirements,
    equipment: input.equipment,
    recommendations: input.recommendations ?? null,
    template: input.template,
    status: finalStatus,
    featured: input.featured,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    whatsappMessage: input.whatsappMessage ?? null,
    publishedAt,
  };
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/expediciones");
  if (slug) revalidatePath(`/expediciones/${slug}`);
}

export async function createExpedition(
  _prev: ExpeditionFormState,
  formData: FormData,
): Promise<ExpeditionFormState> {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_CREATE);

  const parsed = expeditionInputSchema.safeParse(formToRaw(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  // Estado final respetando el permiso de publicación (backend, no UI)
  let finalStatus = input.status;
  const wantsPublic = isPublicStatus(finalStatus) || finalStatus === "SCHEDULED";
  if (wantsPublic && !hasPermission(user, PERMISSIONS.EXPEDITION_PUBLISH)) {
    finalStatus = "DRAFT";
  }
  const publishedAt = isPublicStatus(finalStatus) ? new Date() : null;

  const slug = await uniqueSlug(input.slug || input.name, async (s) => {
    return (await prisma.expedition.count({ where: { slug: s } })) > 0;
  });

  const created = await prisma.expedition.create({
    data: {
      ...(buildData(input, finalStatus, publishedAt) as Prisma.ExpeditionCreateInput),
      slug,
      createdBy: { connect: { id: user.id } },
      ...(input.destinationId
        ? { destination: { connect: { id: input.destinationId } } }
        : {}),
      ...(input.leadGuideId
        ? { leadGuide: { connect: { id: input.leadGuideId } } }
        : {}),
      itinerary: {
        create: input.itinerary.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description ?? null,
          distanceKm: d.distanceKm ?? null,
          elevationGain: d.elevationGain ?? null,
          altitude: d.altitude ?? null,
          accommodation: d.accommodation ?? null,
        })),
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "create",
    entityType: "Expedition",
    entityId: created.id,
    summary: `Creó la expedición «${created.name}»`,
  });

  revalidatePath("/admin/expediciones");
  revalidatePublic(created.slug);
  redirect(`/admin/expediciones/${created.id}?saved=1`);
}

export async function updateExpedition(
  _prev: ExpeditionFormState,
  formData: FormData,
): Promise<ExpeditionFormState> {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_UPDATE);
  const id = formData.get("id")?.toString();
  if (!id) return { ok: false, error: "Falta el identificador." };

  const existing = await prisma.expedition.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "La expedición no existe." };

  const parsed = expeditionInputSchema.safeParse(formToRaw(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  let finalStatus = input.status;
  const wantsPublic = isPublicStatus(finalStatus) || finalStatus === "SCHEDULED";
  if (wantsPublic && !hasPermission(user, PERMISSIONS.EXPEDITION_PUBLISH)) {
    finalStatus = existing.status === "DRAFT" ? "DRAFT" : existing.status;
  }
  const publishedAt = isPublicStatus(finalStatus)
    ? existing.publishedAt ?? new Date()
    : existing.publishedAt;

  // Slug: si lo cambian, mantener unicidad excluyendo el propio registro
  let slug = existing.slug;
  const desired = input.slug?.trim();
  if (desired && desired !== existing.slug) {
    slug = await uniqueSlug(desired, async (s) => {
      const found = await prisma.expedition.findUnique({ where: { slug: s } });
      return !!found && found.id !== id;
    });
  }

  await prisma.$transaction([
    prisma.itineraryDay.deleteMany({ where: { expeditionId: id } }),
    prisma.expedition.update({
      where: { id },
      data: {
        ...buildData(input, finalStatus, publishedAt),
        slug,
        destination: input.destinationId
          ? { connect: { id: input.destinationId } }
          : { disconnect: true },
        leadGuide: input.leadGuideId
          ? { connect: { id: input.leadGuideId } }
          : { disconnect: true },
        itinerary: {
          create: input.itinerary.map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            description: d.description ?? null,
            distanceKm: d.distanceKm ?? null,
            elevationGain: d.elevationGain ?? null,
            altitude: d.altitude ?? null,
            accommodation: d.accommodation ?? null,
          })),
        },
      },
    }),
  ]);

  await logActivity({
    userId: user.id,
    action: "update",
    entityType: "Expedition",
    entityId: id,
    summary: `Editó la expedición «${input.name}»`,
  });

  revalidatePath("/admin/expediciones");
  revalidatePath(`/admin/expediciones/${id}`);
  revalidatePublic(slug);
  revalidatePublic(existing.slug);
  redirect(`/admin/expediciones/${id}?saved=1`);
}

/** Cambia el estado (publicar / abrir / archivar…) desde botones del admin. */
export async function changeExpeditionStatus(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as ExpeditionStatus | undefined;
  if (!id || !status) return;

  const user = await requirePermission(
    isPublicStatus(status) || status === "SCHEDULED"
      ? PERMISSIONS.EXPEDITION_PUBLISH
      : PERMISSIONS.EXPEDITION_UPDATE,
  );

  const existing = await prisma.expedition.findUnique({ where: { id } });
  if (!existing) return;

  const publishedAt = isPublicStatus(status)
    ? existing.publishedAt ?? new Date()
    : existing.publishedAt;

  await prisma.expedition.update({
    where: { id },
    data: { status, publishedAt },
  });

  await logActivity({
    userId: user.id,
    action: status === "ARCHIVED" ? "archive" : "status",
    entityType: "Expedition",
    entityId: id,
    summary: `Cambió el estado de «${existing.name}» a ${status}`,
  });

  revalidatePath("/admin/expediciones");
  revalidatePath(`/admin/expediciones/${id}`);
  revalidatePublic(existing.slug);
}

/** Borrado real. Solo con permiso explícito de eliminación. */
export async function deleteExpedition(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.EXPEDITION_DELETE);
  const id = formData.get("id")?.toString();
  if (!id) return;

  const existing = await prisma.expedition.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.expedition.delete({ where: { id } });

  await logActivity({
    userId: user.id,
    action: "delete",
    entityType: "Expedition",
    entityId: id,
    summary: `Eliminó la expedición «${existing.name}»`,
  });

  revalidatePath("/admin/expediciones");
  revalidatePublic(existing.slug);
  redirect("/admin/expediciones?deleted=1");
}
