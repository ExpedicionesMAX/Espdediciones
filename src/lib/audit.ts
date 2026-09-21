import { prisma } from "@/lib/prisma";

/** Registra una acción en el log de auditoría. Nunca rompe el flujo principal. */
export async function logActivity(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata as object | undefined,
      },
    });
  } catch {
    // el log de auditoría no debe tumbar la operación
  }
}
