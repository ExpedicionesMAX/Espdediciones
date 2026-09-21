"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { upsertContact, logContactActivity } from "@/lib/crm";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().trim().email("Email inválido"),
  phone: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().trim().max(40).optional(),
  ),
  message: z.string().trim().min(5, "Contanos qué necesitás").max(4000),
  expeditionId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
});

export type InquiryFormState = {
  ok: boolean;
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Consulta pública. Entra siempre PENDING — jamás se publica sola.
 * `website` es un honeypot: si viene relleno, es un bot.
 */
export async function submitInquiry(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  if (formData.get("website")) {
    return { ok: true, success: true }; // descartar bot en silencio
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    expeditionId: formData.get("expeditionId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los datos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const d = parsed.data;

  // Verificar que la expedición exista (evita IDs falsos)
  let expeditionId: string | null = null;
  if (d.expeditionId) {
    const exp = await prisma.expedition.findUnique({
      where: { id: d.expeditionId },
      select: { id: true },
    });
    expeditionId = exp?.id ?? null;
  }

  const source = expeditionId ? "expedition" : "contact";
  const contactId = await upsertContact({
    email: d.email,
    name: d.name,
    phone: d.phone,
    source,
  });

  await prisma.contactInquiry.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone ?? null,
      message: d.message,
      status: "PENDING",
      source,
      expeditionId,
      contactId,
    },
  });

  await logContactActivity(
    contactId,
    "inquiry",
    `Consulta recibida${expeditionId ? " sobre una expedición" : ""}`,
  );

  if (expeditionId) {
    await prisma.expedition
      .update({
        where: { id: expeditionId },
        data: { inquiryCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  revalidatePath("/admin/consultas");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/dashboard");
  return { ok: true, success: true };
}

/** El comercial/moderador avanza la consulta en el embudo. */
export async function updateInquiryStatus(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.INQUIRY_UPDATE);
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as InquiryStatus | undefined;
  if (!id || !status) return;

  await prisma.contactInquiry.update({
    where: { id },
    data: { status, handledById: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "status",
    entityType: "ContactInquiry",
    entityId: id,
    summary: `Movió una consulta a ${status}`,
  });

  revalidatePath("/admin/consultas");
}
