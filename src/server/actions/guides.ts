"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { uniqueSlug } from "@/lib/slug";
import { guideInputSchema } from "@/lib/validations/guide";

export type GuideFormState = {
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

function commaList(fd: FormData, key: string): string[] {
  return (fd.get(key)?.toString() ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formToRaw(fd: FormData) {
  return {
    name: fd.get("name"),
    slug: fd.get("slug"),
    photo: fd.get("photo"),
    bio: fd.get("bio"),
    experience: fd.get("experience"),
    certifications: lines(fd, "certifications"),
    specialties: commaList(fd, "specialties"),
    languages: commaList(fd, "languages"),
    social: {
      instagram: fd.get("social_instagram"),
      youtube: fd.get("social_youtube"),
      facebook: fd.get("social_facebook"),
      website: fd.get("social_website"),
    },
  };
}

export async function saveGuide(
  _prev: GuideFormState,
  formData: FormData,
): Promise<GuideFormState> {
  const user = await requirePermission(PERMISSIONS.GUIDE_MANAGE);
  const id = formData.get("id")?.toString() || null;

  const parsed = guideInputSchema.safeParse(formToRaw(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  const social = input.social
    ? Object.fromEntries(Object.entries(input.social).filter(([, v]) => v))
    : {};
  const socialValue =
    Object.keys(social).length > 0 ? (social as Prisma.InputJsonValue) : undefined;

  const data = {
    name: input.name,
    photo: input.photo ?? null,
    bio: input.bio ?? null,
    experience: input.experience ?? null,
    certifications: input.certifications,
    specialties: input.specialties,
    languages: input.languages,
    social: socialValue ?? Prisma.JsonNull,
  };

  if (id) {
    const existing = await prisma.guide.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "El guía no existe." };

    let slug = existing.slug;
    const desired = input.slug?.trim();
    if (desired && desired !== existing.slug) {
      slug = await uniqueSlug(desired, async (s) => {
        const f = await prisma.guide.findUnique({ where: { slug: s } });
        return !!f && f.id !== id;
      });
    }
    await prisma.guide.update({ where: { id }, data: { ...data, slug } });
    await logActivity({
      userId: user.id,
      action: "update",
      entityType: "Guide",
      entityId: id,
      summary: `Editó el guía «${input.name}»`,
    });
    revalidatePath("/admin/guias");
    redirect("/admin/guias?saved=1");
  }

  const slug = await uniqueSlug(input.slug || input.name, async (s) => {
    return (await prisma.guide.count({ where: { slug: s } })) > 0;
  });
  const created = await prisma.guide.create({ data: { ...data, slug } });
  await logActivity({
    userId: user.id,
    action: "create",
    entityType: "Guide",
    entityId: created.id,
    summary: `Creó el guía «${created.name}»`,
  });
  revalidatePath("/admin/guias");
  redirect("/admin/guias?saved=1");
}

export async function deleteGuide(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.GUIDE_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return;

  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.guide.delete({ where: { id } });
  await logActivity({
    userId: user.id,
    action: "delete",
    entityType: "Guide",
    entityId: id,
    summary: `Eliminó el guía «${existing.name}»`,
  });
  revalidatePath("/admin/guias");
  redirect("/admin/guias?deleted=1");
}
