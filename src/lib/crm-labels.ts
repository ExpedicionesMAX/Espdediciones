import type { CRMStage } from "@prisma/client";

export const STAGE_LABELS: Record<CRMStage, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  INFO_SENT: "Info enviada",
  PRE_REGISTERED: "Preinscripto",
  RESERVED: "Reservado",
  CONFIRMED: "Confirmado",
  PARTICIPATED: "Participó",
  RECURRENT: "Recurrente",
  LOST: "Perdido",
};

export const STAGE_STYLES: Record<CRMStage, string> = {
  NEW: "bg-stone-200 text-stone-700",
  CONTACTED: "bg-sky-100 text-sky-800",
  INFO_SENT: "bg-indigo-100 text-indigo-800",
  PRE_REGISTERED: "bg-amber-100 text-amber-900",
  RESERVED: "bg-violet-100 text-violet-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  PARTICIPATED: "bg-teal-100 text-teal-800",
  RECURRENT: "bg-orange-100 text-orange-900",
  LOST: "bg-red-100 text-red-700",
};

// Orden del embudo para mostrarlo (LOST al final).
export const STAGE_ORDER: CRMStage[] = [
  "NEW",
  "CONTACTED",
  "INFO_SENT",
  "PRE_REGISTERED",
  "RESERVED",
  "CONFIRMED",
  "PARTICIPATED",
  "RECURRENT",
  "LOST",
];
