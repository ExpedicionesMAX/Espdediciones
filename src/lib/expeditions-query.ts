import type { Prisma } from "@prisma/client";

/** Estados que un visitante puede ver en el sitio público. */
export const PUBLIC_STATUSES: Prisma.ExpeditionWhereInput["status"] = {
  in: ["OPEN", "LIMITED", "FULL", "COMPLETED"],
};

/**
 * Cláusula `where` para expediciones visibles públicamente:
 * publicadas, en un estado público y dentro de su ventana de publicación.
 * La seguridad de publicación vive en el backend, no en la UI.
 */
export function publicExpeditionWhere(
  extra?: Prisma.ExpeditionWhereInput,
): Prisma.ExpeditionWhereInput {
  const now = new Date();
  return {
    AND: [
      { publishedAt: { not: null, lte: now } },
      { status: PUBLIC_STATUSES },
      { OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] },
      ...(extra ? [extra] : []),
    ],
  };
}
