import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard, CARD_SELECT } from "@/components/public/ExpeditionCard";
import { TripCategoryPills } from "@/components/public/TripCategoryPills";
import { getSiteTexts } from "@/lib/site-texts";
import { getTripPhotos } from "@/lib/page-content";
import { ContentImage } from "@/components/public/ContentImage";
import {
  CATALOG_CATEGORY_KEYS,
  CUSTOM_TRIP_PATH,
  categoryLabel,
  isCatalogCategory,
  type CatalogCategoryKey,
} from "@/lib/trip-categories";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ categoria?: string }>;

const INTRO_KEYS: Record<CatalogCategoryKey, string> = {
  fotografica: "catFotograficaIntro",
  escapada: "catEscapadaIntro",
  coleccionable: "catColeccionableIntro",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const texts = await getSiteTexts();
  const active = isCatalogCategory(sp.categoria) ? sp.categoria : null;
  if (active) {
    return {
      title: `${categoryLabel(active)} · ${texts.expsTitle}`,
      description: texts[INTRO_KEYS[active]],
    };
  }
  return { title: texts.expsTitle, description: texts.expsSubtitle };
}

export default async function ExpeditionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Viajes a Medida no es una categoría del catálogo: los enlaces viejos van a su página.
  if (sp.categoria === "a-medida") redirect(CUSTOM_TRIP_PATH);

  const active = isCatalogCategory(sp.categoria) ? sp.categoria : null;

  const where: Prisma.ExpeditionWhereInput = {
    category: active ?? { in: CATALOG_CATEGORY_KEYS },
  };
  const [texts, photos, expeditions] = await Promise.all([
    getSiteTexts(),
    getTripPhotos(),
    prisma.expedition.findMany({
      where: publicExpeditionWhere(where),
      orderBy: [{ featured: "desc" }, { homeOrder: "asc" }, { name: "asc" }],
      select: CARD_SELECT,
    }),
  ]);

  const count = expeditions.length;
  // Portada: la elegida en «Textos del sitio»; si no, una foto real de los viajes publicados.
  const cover = texts.expsCoverImage || photos[0]?.url || null;

  return (
    <>
      {/* ENCABEZADO: portada + título protagonista + filtros */}
      <section
        className={`relative overflow-hidden bg-ink px-4 pb-10 pt-32 text-white sm:px-6 sm:pb-12 sm:pt-36 ${cover ? "flex min-h-[62vh] items-end" : ""}`}
      >
        {cover && (
          <>
            <ContentImage src={cover} alt="" sizes="100vw" priority />
            {/* Contraste: el texto y los filtros siempre legibles sobre la foto */}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
          </>
        )}
        <div className="relative mx-auto w-full max-w-6xl">
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            {texts.expsTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-200">{texts.expsSubtitle}</p>
          <div className="mt-10">
            <TripCategoryPills active={active} allLabel={texts.expsAllLabel} />
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="catalogo-titulo">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-stone-200 pb-5">
          <h2 id="catalogo-titulo" className="font-display text-2xl font-semibold text-ink">
            {active ? categoryLabel(active) : texts.expsAllLabel}
          </h2>
          {count > 0 && (
            <p className="text-sm text-stone-500">
              {count} {count === 1 ? "viaje" : "viajes"}
            </p>
          )}
        </div>
        {active && texts[INTRO_KEYS[active]] && (
          <p className="mt-4 max-w-2xl text-stone-600">{texts[INTRO_KEYS[active]]}</p>
        )}

        {count === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center sm:py-20">
            <p className="font-display text-2xl text-ink">{texts.expsEmptyTitle}</p>
            <p className="mx-auto mt-3 max-w-md text-stone-500">{texts.expsEmptyText}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {active && (
                <Link
                  href="/expediciones"
                  scroll={false}
                  className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
                >
                  Ver todos los viajes
                </Link>
              )}
              <Link
                href={CUSTOM_TRIP_PATH}
                className="rounded-full px-6 py-2.5 text-sm font-semibold text-ink ring-1 ring-inset ring-stone-300 transition-colors hover:bg-stone-100"
              >
                Consultar un viaje a medida
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expeditions.map((e) => (
              <ExpeditionCard key={e.slug} expedition={e} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
