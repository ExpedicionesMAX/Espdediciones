import Image from "next/image";
import Link from "next/link";
import type { ActivityType, Difficulty } from "@prisma/client";
import {
  ACTIVITY_LABELS,
  DIFFICULTY_LABELS,
  formatDateRange,
  formatPrice,
  spotsInfo,
} from "@/lib/format";

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
};

export function ExpeditionCard({ expedition }: { expedition: CardExpedition }) {
  const spots = spotsInfo(expedition.capacity, expedition.spotsTaken);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-stone-900 shadow-sm ring-1 ring-black/5">
      <Link href={`/expediciones/${expedition.slug}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {expedition.coverImage ? (
            <Image
              src={expedition.coverImage}
              alt={expedition.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-800 text-stone-500">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {expedition.activityType && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
                {ACTIVITY_LABELS[expedition.activityType]}
              </span>
            )}
            {expedition.difficulty && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                {DIFFICULTY_LABELS[expedition.difficulty]}
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            {expedition.destination && (
              <p className="text-xs font-medium uppercase tracking-wider text-stone-300">
                {expedition.destination.name}
              </p>
            )}
            <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
              {expedition.name}
            </h3>
            <p className="mt-2 text-sm text-stone-300">
              {formatDateRange(expedition.startDate, expedition.endDate)}
              {expedition.durationDays ? ` · ${expedition.durationDays} días` : ""}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {formatPrice(expedition.price, expedition.currency)}
              </span>
              <span className="text-xs text-stone-300">{spots.label}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
