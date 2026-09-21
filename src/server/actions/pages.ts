"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { uniqueSlug, slugify } from "@/lib/slug";
import { pageInputSchema, RESERVED_SLUGS } from "@/lib/validations/page";

export type PageFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formToRaw(fd: FormData) {
  return {
    title: fd.get("title"),
    slug: fd.get("slug"),
    subtitle: fd.get("subtitle"),
    content: fd.get("content"),
    coverImage: fd.get("coverImage"),
    published: fd.get("published") === "on" || fd.get("published") === "true",
    showInMenu: fd.get("showInMenu") === "on" || fd.get("showInMenu") === "true",
    menuOrder: fd.get("menuOrder"),
    seoTitle: fd.get("seoTitle"),
    seoDescription: fd.get("seoDescription"),
  };
}

export async function savePage(
  _prev: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  const user = await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const id = formData.get("id")?.toString() || null;

  const parsed = pageInputSchema.safeParse(formToRaw(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  // El slug elegido (o derivado del título) no puede ser uno reservado.
  const desiredRoot = slugify(input.slug || input.title);
  if (RESERVED_SLUGS.includes(desiredRoot)) {
    return {
      ok: false,
      error: `El slug "${desiredRoot}" está reservado por el sistema. Elegí otro.`,
      fieldErrors: { slug: ["Slug reservado"] },
    };
  }

  const data = {
    title: input.title,
    subtitle: input.subtitle ?? null,
    content: input.content ?? null,
    coverImage: input.coverImage ?? null,
    published: input.published,
    showInMenu: input.showInMenu,
    menuOrder: input.menuOrder,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
  };

  if (id) {
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "La página no existe." };

    let slug = existing.slug;
    if (desiredRoot && desiredRoot !== existing.slug) {
      slug = await uniqueSlug(desiredRoot, async (s) => {
        const f = await prisma.page.findUnique({ where: { slug: s } });
        return !!f && f.id !== id;
      });
    }
    await prisma.page.update({ where: { id }, data: { ...data, slug } });
    await logActivity({
      userId: user.id,
      action: "update",
      entityType: "Page",
      entityId: id,
      summary: `Editó la página «${input.title}»`,
    });
    revalidatePath("/admin/paginas");
    revalidatePath("/", "layout");
    revalidatePath(`/${slug}`);
    redirect("/admin/paginas?saved=1");
  }

  const slug = await uniqueSlug(desiredRoot || input.title, async (s) => {
    return (await prisma.page.count({ where: { slug: s } })) > 0;
  });
  const created = await prisma.page.create({ data: { ...data, slug } });
  await logActivity({
    userId: user.id,
    action: "create",
    entityType: "Page",
    entityId: created.id,
    summary: `Creó la página «${created.title}»`,
  });
  revalidatePath("/admin/paginas");
  revalidatePath("/", "layout");
  redirect("/admin/paginas?saved=1");
}

export async function deletePage(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return;

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.page.delete({ where: { id } });
  await logActivity({
    userId: user.id,
    action: "delete",
    entityType: "Page",
    entityId: id,
    summary: `Eliminó la página «${existing.title}»`,
  });
  revalidatePath("/admin/paginas");
  revalidatePath("/", "layout");
  redirect("/admin/paginas?deleted=1");
}
