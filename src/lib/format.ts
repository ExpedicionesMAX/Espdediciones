import type { ActivityType, Difficulty, ExpeditionStatus } from "@prisma/client";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Fácil",
  MODERATE: "Moderada",
  HARD: "Difícil",
  TECHNICAL: "Técnica",
  EXTREME: "Extrema",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  TREKKING: "Trekking",
  MOUNTAINEERING: "Montañismo",
  EXPEDITION: "Expedición",
  PHOTOGRAPHY: "Fotográfica",
  CLIMBING: "Escalada",
  TRAVESIA: "Travesía",
  NATURE: "Naturaleza",
};

export const STATUS_LABELS: Record<ExpeditionStatus, string> = {
  DRAFT: "Borrador",
  SCHEDULED: "Programada",
  OPEN: "Abierta",
  LIMITED: "Cupos limitados",
  FULL: "Completa",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
  ARCHIVED: "Archivada",
};

/** Clases Tailwind para el badge de estado en el admin. */
export const STATUS_STYLES: Record<ExpeditionStatus, string> = {
  DRAFT: "bg-stone-200 text-stone-700",
  SCHEDULED: "bg-sky-100 text-sky-800",
  OPEN: "bg-emerald-100 text-emerald-800",
  LIMITED: "bg-amber-100 text-amber-900",
  FULL: "bg-rose-100 text-rose-800",
  COMPLETED: "bg-indigo-100 text-indigo-800",
  CANCELLED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-stone-100 text-stone-500",
};

/** Decimal de Prisma / string / number → number|null. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "object" ? Number(value.toString()) : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatDate(
  date: Date | string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", opts).format(d);
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  if (!start) return "Fechas a confirmar";
  if (!end) return formatDate(start);
  return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end)}`;
}

export function formatPrice(
  amount: unknown,
  currency = "USD",
): string {
  const n = toNumber(amount);
  if (n === null) return "Consultar";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("es-AR")}`;
  }
}

export type SpotsInfo = {
  capacity: number | null;
  taken: number;
  available: number | null;
  label: string;
  soldOut: boolean;
};

export function spotsInfo(
  capacity: number | null | undefined,
  taken: number | null | undefined,
): SpotsInfo {
  const cap = capacity ?? null;
  const tk = taken ?? 0;
  if (cap === null) {
    return { capacity: null, taken: tk, available: null, label: "Consultar disponibilidad", soldOut: false };
  }
  const available = Math.max(cap - tk, 0);
  return {
    capacity: cap,
    taken: tk,
    available,
    soldOut: available === 0,
    label:
      available === 0
        ? "Sin cupos"
        : `${available} de ${cap} cupos disponibles`,
  };
}

/** Enlace wa.me con mensaje pre-cargado. `number` sin +, solo dígitos. */
export function whatsappUrl(number: string | null | undefined, message?: string): string | null {
  if (!number) return null;
  const clean = number.replace(/\D/g, "");
  if (!clean) return null;
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
