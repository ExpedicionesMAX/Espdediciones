"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { normalizeStoredHome } from "@/lib/home-content";
import { normalizeStoredCustomTrip } from "@/lib/custom-trip-content";
import { CUSTOM_TRIP_PATH } from "@/lib/trip-categories";
import { removeStorageFilesIfUnreferenced, removedUrls } from "@/lib/storage";

export type PageContentFormState = { ok: boolean; success?: boolean; error?: string };

const MAX_PAYLOAD = 200_000; // ~200 KB de texto: de sobra para el contenido institucional

function parsePayload(formData: FormData): unknown | undefined {
  const raw = formData.get("payload")?.toString() ?? "";
  if (!raw || raw.length > MAX_PAYLOAD) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Guarda el inicio institucional. El JSON se sanea entero antes de persistir. */
export async function updateHomeContent(
  _prev: PageContentFormState,
  formData: FormData,
): Promise<PageContentFormState> {
  const user = await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const payload = parsePayload(formData);
  if (payload === undefined) return { ok: false, error: "No se pudo leer el contenido enviado." };

  const content = normalizeStoredHome(payload);
  const previous = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { homeContent: true },
  });
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { homeContent: content as unknown as Prisma.InputJsonValue },
    create: { id: "singleton", homeContent: content as unknown as Prisma.InputJsonValue },
  });
  // Fotos que se quitaron: se borra el archivo solo si ya nada del sitio lo usa.
  await removeStorageFilesIfUnreferenced(removedUrls(previous?.homeContent, content));

  await logActivity({
    userId: user.id,
    action: "update",
    entityType: "SiteSettings",
    summary: "Actualizó el inicio institucional (Nosotros)",
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/inicio");
  return { ok: true, success: true };
}

/** Guarda la página Viajes a Medida. */
export async function updateCustomTripContent(
  _prev: PageContentFormState,
  formData: FormData,
): Promise<PageContentFormState> {
  const user = await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const payload = parsePayload(formData);
  if (payload === undefined) return { ok: false, error: "No se pudo leer el contenido enviado." };

  const content = normalizeStoredCustomTrip(payload);
  const previous = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { customTripContent: true },
  });
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { customTripContent: content as unknown as Prisma.InputJsonValue },
    create: { id: "singleton", customTripContent: content as unknown as Prisma.InputJsonValue },
  });
  await removeStorageFilesIfUnreferenced(removedUrls(previous?.customTripContent, content));

  await logActivity({
    userId: user.id,
    action: "update",
    entityType: "SiteSettings",
    summary: "Actualizó la página Viajes a Medida",
  });

  revalidatePath(CUSTOM_TRIP_PATH);
  revalidatePath("/admin/viajes-a-medida");
  return { ok: true, success: true };
}
