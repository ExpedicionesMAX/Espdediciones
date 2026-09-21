"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { SITE_TEXTS } from "@/lib/site-texts-schema";

export type TextsFormState = { ok: boolean; success?: boolean; error?: string };

export async function updateTexts(
  _prev: TextsFormState,
  formData: FormData,
): Promise<TextsFormState> {
  const user = await requirePermission(PERMISSIONS.SETTINGS_MANAGE);

  // Solo guardamos los textos personalizados; los vacíos usan el valor por defecto.
  const texts: Record<string, string> = {};
  for (const t of SITE_TEXTS) {
    const v = formData.get(t.key)?.toString().trim();
    if (v && v !== t.default) texts[t.key] = v;
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { texts: texts as Prisma.InputJsonValue },
    create: { id: "singleton", texts: texts as Prisma.InputJsonValue },
  });

  await logActivity({
    userId: user.id,
    action: "update",
    entityType: "SiteSettings",
    summary: "Actualizó los textos del sitio",
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/textos");
  return { ok: true, success: true };
}
