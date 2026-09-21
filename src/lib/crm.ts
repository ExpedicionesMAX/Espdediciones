import "server-only";
import type { CRMStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Orden del embudo (LOST queda fuera: es un desvío, no un avance).
const STAGE_ORDER: CRMStage[] = [
  "NEW",
  "CONTACTED",
  "INFO_SENT",
  "PRE_REGISTERED",
  "RESERVED",
  "CONFIRMED",
  "PARTICIPATED",
  "RECURRENT",
];

/**
 * Crea o actualiza la ficha de contacto por email. Completa datos faltantes y,
 * si `minStage` es más avanzado que el actual, adelanta la etapa del embudo.
 * Devuelve el id del contacto.
 */
export async function upsertContact(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  source?: string;
  minStage?: CRMStage;
}): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.cRMContact.findUnique({ where: { email } });

  if (!existing) {
    const created = await prisma.cRMContact.create({
      data: {
        email,
        name: input.name ?? null,
        phone: input.phone ?? null,
        country: input.country ?? null,
        city: input.city ?? null,
        source: input.source ?? null,
        stage: input.minStage ?? "NEW",
      },
    });
    return created.id;
  }

  const data: Record<string, unknown> = {};
  if (!existing.name && input.name) data.name = input.name;
  if (!existing.phone && input.phone) data.phone = input.phone;
  if (!existing.country && input.country) data.country = input.country;
  if (!existing.city && input.city) data.city = input.city;

  if (input.minStage && existing.stage !== "LOST") {
    const cur = STAGE_ORDER.indexOf(existing.stage);
    const want = STAGE_ORDER.indexOf(input.minStage);
    if (want > cur) data.stage = input.minStage;
  }

  if (Object.keys(data).length > 0) {
    await prisma.cRMContact.update({ where: { id: existing.id }, data });
  }
  return existing.id;
}

/** Registra un evento en la línea de tiempo del contacto. No rompe el flujo. */
export async function logContactActivity(
  contactId: string,
  type: string,
  note?: string,
  userId?: string | null,
): Promise<void> {
  try {
    await prisma.cRMActivity.create({
      data: { contactId, type, note: note ?? null, userId: userId ?? null },
    });
  } catch {
    // la actividad no debe tumbar la operación
  }
}
