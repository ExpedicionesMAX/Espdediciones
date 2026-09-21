"use server";

import { revalidatePath } from "next/cache";
import type { CRMStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logContactActivity } from "@/lib/crm";

const STAGES: CRMStage[] = [
  "NEW", "CONTACTED", "INFO_SENT", "PRE_REGISTERED", "RESERVED",
  "CONFIRMED", "PARTICIPATED", "RECURRENT", "LOST",
];

export async function updateContactStage(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.CRM_MANAGE);
  const id = formData.get("id")?.toString();
  const stage = formData.get("stage")?.toString() as CRMStage | undefined;
  if (!id || !stage || !STAGES.includes(stage)) return;

  await prisma.cRMContact.update({ where: { id }, data: { stage } });
  await logContactActivity(id, "stage", `Etapa actualizada a ${stage}`, user.id);

  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${id}`);
}

export async function addContactNote(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.CRM_MANAGE);
  const id = formData.get("id")?.toString();
  const note = formData.get("note")?.toString().trim();
  if (!id || !note) return;

  await logContactActivity(id, "note", note, user.id);
  revalidatePath(`/admin/crm/${id}`);
}

export async function updateContactMeta(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.CRM_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return;

  const tags = (formData.get("tags")?.toString() ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const notes = formData.get("notes")?.toString().trim() || null;

  await prisma.cRMContact.update({ where: { id }, data: { tags, notes } });
  revalidatePath(`/admin/crm/${id}`);
}
