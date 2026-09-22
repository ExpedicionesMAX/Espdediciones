"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { settingsInputSchema } from "@/lib/validations/settings";

export type SettingsFormState = {
  ok: boolean;
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const user = await requirePermission(PERMISSIONS.SETTINGS_MANAGE);

  const parsed = settingsInputSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    logoUrl: formData.get("logoUrl"),
    whatsappNumber: formData.get("whatsappNumber"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    accentColor: formData.get("accentColor"),
    displayFont: formData.get("displayFont"),
    paymentMode: formData.get("paymentMode"),
    social: {
      instagram: formData.get("social_instagram"),
      youtube: formData.get("social_youtube"),
      facebook: formData.get("social_facebook"),
      tiktok: formData.get("social_tiktok"),
      linkedin: formData.get("social_linkedin"),
      x: formData.get("social_x"),
      vimeo: formData.get("social_vimeo"),
    },
    homeExpsTitle: formData.get("homeExpsTitle"),
    homeExpsSubtitle: formData.get("homeExpsSubtitle"),
    ctaTitle: formData.get("ctaTitle"),
    ctaText: formData.get("ctaText"),
    ctaButton: formData.get("ctaButton"),
    homeWhyTitle: formData.get("homeWhyTitle"),
    homeWhyItems: (formData.get("homeWhyItems")?.toString() ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    reviewsLabel: formData.get("reviewsLabel"),
    reviewsUrl: formData.get("reviewsUrl"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  const social = d.social
    ? Object.fromEntries(Object.entries(d.social).filter(([, v]) => v))
    : {};
  const socialValue =
    Object.keys(social).length > 0
      ? (social as Prisma.InputJsonValue)
      : Prisma.JsonNull;

  const whatsapp = d.whatsappNumber
    ? d.whatsappNumber.replace(/\D/g, "") || null
    : null;

  const data = {
    siteName: d.siteName,
    tagline: d.tagline ?? null,
    logoUrl: d.logoUrl ?? null,
    whatsappNumber: whatsapp,
    contactEmail: d.contactEmail ?? null,
    contactPhone: d.contactPhone ?? null,
    accentColor: d.accentColor,
    displayFont: d.displayFont,
    paymentMode: d.paymentMode,
    social: socialValue,
    homeExpsTitle: d.homeExpsTitle ?? null,
    homeExpsSubtitle: d.homeExpsSubtitle ?? null,
    ctaTitle: d.ctaTitle ?? null,
    ctaText: d.ctaText ?? null,
    ctaButton: d.ctaButton ?? null,
    homeWhyTitle: d.homeWhyTitle ?? null,
    homeWhyItems: d.homeWhyItems,
    reviewsLabel: d.reviewsLabel ?? null,
    reviewsUrl: d.reviewsUrl ?? null,
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  await logActivity({
    userId: user.id,
    action: "update",
    entityType: "SiteSettings",
    summary: "Actualizó la configuración del sitio",
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { ok: true, success: true };
}
