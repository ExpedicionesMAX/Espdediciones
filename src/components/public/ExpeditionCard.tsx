import Image from "next/image";
import Link from "next/link";
import type { ActivityType, Difficulty } from "@prisma/client";
import { ACTIVITY_LABELS, DIFFICULTY_LABELS, seasonLabel } from "@/lib/format";
import { categoryLabel } from "@/lib/trip-categories";

export type CardExpedition = {
  slug: string;
  name: string;
  subtitle: string | null;
  coverImage: string | null;
  activityType: ActivityType | null;
  difficulty: Difficulty | null;
  startDate: Date | null;
  endDate: Date | null;
  durationDays: number | null;
  price: unknown;
  currency: string;
  capacity: number | null;
  spotsTaken: number;
  destination: { name: string } | null;
  category?: string | null;
  availableMonths?: number[];
  region?: string | null;
  country?: string | null;
};

/** Lugar del viaje: el destino vinculado o, si no hay, la región/país cargados en el viaje. */
export function tripLocation(e: {
  destination?: { name: string } | null;
  region?: string | null;
  country?: string | null;
}): string | null {
  if (e.destination?.name) return e.destination.name;
  const parts = [e.region, e.country].filter((p): p is string => !!p && p.trim() !== "");
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Campos que necesita la tarjeta (para `select` de Prisma). */
export const CARD_SELECT = {
  slug: true,
  name: true,
  subtitle: true,
  coverImage: true,
  activityType: true,
  difficulty: true,
  startDate: true,
  endDate: true,
  durationDays: true,
  price: true,
  currency: true,
  capacity: true,
  spotsTaken: true,
  category: true,
  availableMonths: true,
  region: true,
  country: true,
  destination: { select: { name: true } },
} as const;

export function ExpeditionCard({ expedition }: { expedition: CardExpedition }) {
  // La categoría del catálogo manda; si el viaje no tiene una del catálogo, se muestra la actividad.
  const badge =
    categoryLabel(expedition.category) ??
    (expedition.activityType ? ACTIVITY_LABELS[expedition.activityType] : null);
  const season = seasonLabel(expedition.startDate, expedition.endDate, expedition.availableMonths);
  const location = tripLocation(expedition);
  const meta = [
    expedition.durationDays ? `${expedition.durationDays} días` : null,
    season,
  ].filter(Boolean);

  return (
    <article className="card-lift group relative overflow-hidden rounded-2xl bg-stone-900 shadow-sm ring-1 ring-black/5">
      <Link href={`/expediciones/${expedition.slug}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {expedition.coverImage ? (
            <Image
              src={expedition.coverImage}
              alt={expedition.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-800 text-stone-500">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {badge && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
                {badge}
              </span>
            )}
            {expedition.difficulty && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                {DIFFICULTY_LABELS[expedition.difficulty]}
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            {location && (
              <p className="text-xs font-medium uppercase tracking-wider text-stone-300">
                {location}
              </p>
            )}
            <h3 className="mt-1 font-display text-xl font-semibold leading-tight [overflow-wrap:anywhere]">
              {expedition.name}
            </h3>
            {meta.length > 0 && (
              <p className="mt-2 text-sm text-stone-300">{meta.join(" · ")}</p>
            )}
            <span className="mt-3 inline-block text-sm font-semibold text-white/90">
              Quiero saber más <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
