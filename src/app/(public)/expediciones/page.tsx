import Link from "next/link";
import type { ActivityType, Difficulty, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard } from "@/components/public/ExpeditionCard";
import { ACTIVITY_LABELS, DIFFICULTY_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Expediciones",
  description: "Todas nuestras expediciones, travesías y ascensiones.",
};

const cardSelect = {
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
  destination: { select: { name: true } },
} as const;

const ACTIVITIES = Object.keys(ACTIVITY_LABELS) as ActivityType[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

type SearchParams = Promise<{
  q?: string;
  actividad?: string;
  dificultad?: string;
  destino?: string;
}>;

export default async function ExpeditionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const extra: Prisma.ExpeditionWhereInput = {};
  if (sp.q) {
    extra.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { subtitle: { contains: sp.q, mode: "insensitive" } },
      { shortDescription: { contains: sp.q, mode: "insensitive" } },
      { destination: { name: { contains: sp.q, mode: "insensitive" } } },
    ];
  }
  if (sp.actividad && ACTIVITIES.includes(sp.actividad as ActivityType)) {
    extra.activityType = sp.actividad as ActivityType;
  }
  if (sp.dificultad && DIFFICULTIES.includes(sp.dificultad as Difficulty)) {
    extra.difficulty = sp.dificultad as Difficulty;
  }
  if (sp.destino) {
    extra.destination = { slug: sp.destino };
  }

  const [expeditions, destinations] = await Promise.all([
    prisma.expedition.findMany({
      where: publicExpeditionWhere(extra),
      orderBy: [{ featured: "desc" }, { startDate: "asc" }],
      select: cardSelect,
    }),
    prisma.destination.findMany({
      where: { expeditions: { some: publicExpeditionWhere() } },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const selectClass =
    "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Expediciones
          </h1>
          <p className="mt-3 max-w-xl text-stone-300">
            {expeditions.length} experiencia
            {expeditions.length === 1 ? "" : "s"} disponible
            {expeditions.length === 1 ? "" : "s"}.
          </p>
        </div>
      </section>

      <div className="border-b border-stone-200 bg-paper">
        <form
          method="get"
          className="mx-auto flex max-w-6xl flex-wrap items-end gap-3 px-4 py-5 sm:px-6"
        >
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="q" className="mb-1 block text-xs font-medium text-stone-500">
              Buscar
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Nombre, destino…"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="actividad" className="mb-1 block text-xs font-medium text-stone-500">
              Actividad
            </label>
            <select id="actividad" name="actividad" defaultValue={sp.actividad ?? ""} className={selectClass}>
              <option value="">Todas</option>
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dificultad" className="mb-1 block text-xs font-medium text-stone-500">
              Dificultad
            </label>
            <select id="dificultad" name="dificultad" defaultValue={sp.dificultad ?? ""} className={selectClass}>
              <option value="">Todas</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="destino" className="mb-1 block text-xs font-medium text-stone-500">
              Destino
            </label>
            <select id="destino" name="destino" defaultValue={sp.destino ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Filtrar
          </button>
          <Link
            href="/expediciones"
            className="px-2 py-2 text-sm font-medium text-stone-500 hover:text-ink"
          >
            Limpiar
          </Link>
        </form>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {expeditions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-20 text-center">
            <p className="font-display text-xl text-ink">
              No encontramos expediciones con esos filtros.
            </p>
            <Link
              href="/expediciones"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-dark"
            >
              Ver todas
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expeditions.map((e) => (
              <ExpeditionCard key={e.slug} expedition={e} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
