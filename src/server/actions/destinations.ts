"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { uniqueSlug } from "@/lib/slug";
import { destinationInputSchema } from "@/lib/validations/destination";

export type DestinationFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function lines(fd: FormData, key: string): string[] {
  return (fd.get(key)?.toString() ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formToRaw(fd: FormData) {
  return {
    name: fd.get("name"),
    slug: fd.get("slug"),
    country: fd.get("country"),
    region: fd.get("region"),
    description: fd.get("description"),
    coverImage: fd.get("coverImage"),
    gallery: lines(fd, "gallery"),
    latitude: fd.get("latitude"),
    longitude: fd.get("longitude"),
  };
}

export async function saveDestination(
  _prev: DestinationFormState,
  formData: FormData,
): Promise<DestinationFormState> {
  const user = await requirePermission(PERMISSIONS.DESTINATION_MANAGE);
  const id = formData.get("id")?.toString() || null;

  const parsed = destinationInputSchema.safeParse(formToRaw(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  const data = {
    name: input.name,
    country: input.country,
    region: input.region ?? null,
    description: input.description ?? null,
    coverImage: input.coverImage ?? null,
    gallery: input.gallery,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
  };

  if (id) {
    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "El destino no existe." };

    let slug = existing.slug;
    const desired = input.slug?.trim();
    if (desired && desired !== existing.slug) {
      slug = await uniqueSlug(desired, async (s) => {
        const f = await prisma.destination.findUnique({ where: { slug: s } });
        return !!f && f.id !== id;
      });
    }
    await prisma.destination.update({ where: { id }, data: { ...data, slug } });
    await logActivity({
      userId: user.id,
      action: "update",
      entityType: "Destination",
      entityId: id,
      summary: `Editó el destino «${input.name}»`,
    });
    revalidatePath("/admin/destinos");
    revalidatePath("/");
    revalidatePath("/expediciones");
    redirect("/admin/destinos?saved=1");
  }

  const slug = await uniqueSlug(input.slug || input.name, async (s) => {
    return (await prisma.destination.count({ where: { slug: s } })) > 0;
  });
  const created = await prisma.destination.create({ data: { ...data, slug } });
  await logActivity({
    userId: user.id,
    action: "create",
    entityType: "Destination",
    entityId: created.id,
    summary: `Creó el destino «${created.name}»`,
  });
  revalidatePath("/admin/destinos");
  redirect("/admin/destinos?saved=1");
}

export async function deleteDestination(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.DESTINATION_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return;

  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.destination.delete({ where: { id } });
  await logActivity({
    userId: user.id,
    action: "delete",
    entityType: "Destination",
    entityId: id,
    summary: `Eliminó el destino «${existing.name}»`,
  });
  revalidatePath("/admin/destinos");
  redirect("/admin/destinos?deleted=1");
}
