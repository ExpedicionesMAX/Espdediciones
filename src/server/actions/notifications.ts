"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

/** Marca una notificación como leída. */
export async function markNotificationRead(formData: FormData): Promise<void> {
  await requireUser();
  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.notification
    .update({ where: { id }, data: { read: true } })
    .catch(() => {});

  revalidatePath("/admin/notificaciones");
  revalidatePath("/admin/dashboard");
}

/** Marca todas las notificaciones como leídas. */
export async function markAllNotificationsRead(): Promise<void> {
  await requireUser();

  await prisma.notification
    .updateMany({ where: { read: false }, data: { read: true } })
    .catch(() => {});

  revalidatePath("/admin/notificaciones");
  revalidatePath("/admin/dashboard");
}
