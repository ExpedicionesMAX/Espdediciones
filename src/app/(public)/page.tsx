import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard } from "@/components/public/ExpeditionCard";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const settings = await getSiteSettings();

  const heroExp = await prisma.expedition.findFirst({
    where: publicExpeditionWhere(),
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    select: {
      slug: true,
      name: true,
      subtitle: true,
      shortDescription: true,
      coverImage: true,
      activityType: true,
      destination: { select: { name: true } },
    },
  });

  const [expeditions, destinations] = await Promise.all([
    prisma.expedition.findMany({
      where: publicExpeditionWhere(
        heroExp ? { slug: { not: heroExp.slug } } : undefined,
      ),
      orderBy: [{ featured: "desc" }, { startDate: "asc" }],
      take: 6,
      select: cardSelect,
    }),
    prisma.destination.findMany({
      where: { expeditions: { some: publicExpeditionWhere() } },
      take: 3,
      select: { slug: true, name: true, country: true, coverImage: true },
    }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        {heroExp?.coverImage ? (
          <Image
            src={heroExp.coverImage}
            alt={heroExp.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-300">
              {settings.tagline}
            </p>
            {heroExp ? (
              <>
                <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
                  {heroExp.name}
                </h1>
                {(heroExp.subtitle || heroExp.shortDescription) && (
                  <p className="mt-5 max-w-xl text-lg text-stone-200">
                    {heroExp.subtitle ?? heroExp.shortDescription}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={`/expediciones/${heroExp.slug}`}
                    className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                  >
                    Ver esta expedición
                  </Link>
                  <Link
                    href="/expediciones"
                    className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                  >
                    Todas las expediciones
                  </Link>
                </div>
                {settings.reviewsLabel &&
                  (settings.reviewsUrl ? (
                    <a
                      href={settings.reviewsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-block text-sm font-medium text-stone-200 hover:text-white"
                    >
                      {settings.reviewsLabel}
                    </a>
                  ) : (
                    <p className="mt-6 text-sm font-medium text-stone-200">{settings.reviewsLabel}</p>
                  ))}
              </>
            ) : (
              <>
                <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">
                  {settings.siteName}
                </h1>
                <p className="mt-5 text-lg text-stone-200">
                  Aún no hay expediciones publicadas. Cargá la primera desde el
                  panel.
                </p>
                <Link
                  href="/admin"
                  className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
                >
                  Ir al panel
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      {settings.homeWhyItems.length > 0 && (
        <section className="reveal border-b border-stone-200 bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            {settings.homeWhyTitle && (
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {settings.homeWhyTitle}
              </h2>
            )}
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {settings.homeWhyItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    ✓
                  </span>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* PRÓXIMAS EXPEDICIONES */}
      {expeditions.length > 0 && (
        <section className="reveal mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {settings.homeExpsTitle}
              </h2>
              <p className="mt-2 text-stone-600">{settings.homeExpsSubtitle}</p>
            </div>
            <Link
              href="/expediciones"
              className="text-sm font-semibold text-accent hover:text-accent-dark"
            >
              Ver todas →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expeditions.map((e) => (
              <ExpeditionCard key={e.slug} expedition={e} />
            ))}
          </div>
        </section>
      )}

      {/* DESTINOS */}
      {destinations.length > 0 && (
        <section className="reveal bg-ink py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Destinos
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {destinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/expediciones?destino=${d.slug}`}
                  className="group relative block aspect-[3/2] overflow-hidden rounded-2xl"
                >
                  {d.coverImage && (
                    <Image
                      src={d.coverImage}
                      alt={d.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="text-xs uppercase tracking-wider text-stone-300">
                      {d.country}
                    </p>
                    <p className="font-display text-2xl font-semibold">{d.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="reveal mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">
          {settings.ctaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">{settings.ctaText}</p>
        <Link
          href="/contacto"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
        >
          {settings.ctaButton}
        </Link>
      </section>
    </>
  );
}
