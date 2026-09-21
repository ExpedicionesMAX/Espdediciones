"use server";

import { revalidatePath } from "next/cache";
import type { ExpeditionStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { upsertContact, logContactActivity } from "@/lib/crm";
import { reservationInputSchema } from "@/lib/validations/reservation";

export type ReservationFormState = {
  ok: boolean;
  success?: boolean;
  waitlist?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Estados en los que una expedición acepta inscripciones.
const RESERVABLE: ExpeditionStatus[] = ["OPEN", "LIMITED", "FULL"];

export async function submitReservation(
  _prev: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  if (formData.get("website")) {
    return { ok: true, success: true }; // honeypot: descartar bot
  }

  const parsed = reservationInputSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    city: formData.get("city"),
    emergencyContact: formData.get("emergencyContact"),
    experience: formData.get("experience"),
    notes: formData.get("notes"),
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

  const exp = await prisma.expedition.findUnique({
    where: { id: d.expeditionId },
    select: { id: true, status: true, publishedAt: true, name: true },
  });

  if (!exp || !exp.publishedAt || !RESERVABLE.includes(exp.status)) {
    return { ok: false, error: "Esta expedición no está aceptando inscripciones." };
  }

  // Si está completa, entra a lista de espera; si no, preinscripción pendiente.
  const status: ReservationStatus = exp.status === "FULL" ? "WAITLIST" : "PENDING";

  const contactId = await upsertContact({
    email: d.email,
    name: `${d.firstName} ${d.lastName}`.trim(),
    phone: d.phone,
    country: d.country,
    city: d.city,
    source: "reservation",
    minStage: "PRE_REGISTERED",
  });

  await prisma.reservation.create({
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email.toLowerCase(),
      phone: d.phone ?? null,
      country: d.country ?? null,
      city: d.city ?? null,
      emergencyContact: d.emergencyContact ?? null,
      experience: d.experience ?? null,
      notes: d.notes ?? null,
      status,
      expeditionId: exp.id,
      contactId,
    },
  });

  await logContactActivity(
    contactId,
    "reservation",
    `Inscripción a «${exp.name}» (${status === "WAITLIST" ? "lista de espera" : "preinscripción"})`,
  );

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/dashboard");
  return { ok: true, success: true, waitlist: status === "WAITLIST" };
}

export async function updateReservationStatus(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.RESERVATION_MANAGE);
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as ReservationStatus | undefined;
  if (!id || !status) return;

  await prisma.reservation.update({
    where: { id },
    data: { status, handledById: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "status",
    entityType: "Reservation",
    entityId: id,
    summary: `Movió una inscripción a ${status}`,
  });

  revalidatePath("/admin/reservas");
}
