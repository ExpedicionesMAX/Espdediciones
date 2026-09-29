import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard } from "@/components/public/ExpeditionCard";
import { ReviewsCarousel } from "@/components/public/ReviewsCarousel";
import { getSiteSettings, type WhyPillar } from "@/lib/site";
import { whatsappUrl, formatDateRange } from "@/lib/format";

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

  // PRÓXIMA: la elegida en admin; si no, la de fecha futura más cercana; si no, la primera.
  let upcoming = settings.upcomingExpeditionId
    ? await prisma.expedition.findFirst({
        where: publicExpeditionWhere({ id: settings.upcomingExpeditionId }),
        select: {
          slug: true,
          name: true,
          subtitle: true,
          shortDescription: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          durationDays: true,
          destination: { select: { name: true } },
        },
      })
    : null;
  if (!upcoming) {
    upcoming = await prisma.expedition.findFirst({
      where: publicExpeditionWhere({ startDate: { gte: new Date() } }),
      orderBy: { startDate: "asc" },
      select: {
        slug: true,
        name: true,
        subtitle: true,
        shortDescription: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        durationDays: true,
        destination: { select: { name: true } },
      },
    });
  }

  const [featured, reviewsRaw] = await Promise.all([
    prisma.expedition.findMany({
      where: publicExpeditionWhere({ featured: true }),
      orderBy: [{ homeOrder: "asc" }, { name: "asc" }],
      take: 6,
      select: cardSelect,
    }),
    prisma.testimonial.findMany({
      where: { status: "APPROVED", active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        authorName: true,
        text: true,
        photo: true,
        rating: true,
        expedition: { select: { name: true } },
      },
    }),
  ]);

  const reviews = reviewsRaw.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    text: r.text,
    photo: r.photo,
    rating: r.rating,
    expeditionName: r.expedition?.name ?? null,
  }));

  const rawPillars: WhyPillar[] =
    settings.homeWhyPillars.length > 0
      ? settings.homeWhyPillars
      : settings.homeWhyItems.map((t, i) => ({ title: t, active: true, order: i }));
  const pillars = rawPillars
    .filter((p) => p.active !== false && p.title)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const wa = whatsappUrl(settings.whatsappNumber, "Hola, quiero saber más sobre los viajes.");

  return (
    <>
      {/* 1. HERO */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        {heroExp?.coverImage ? (
          <Image src={heroExp.coverImage} alt={heroExp.name} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-300">
              {settings.tagline}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              {settings.siteName}
            </h1>
            {heroExp?.subtitle || heroExp?.shortDescription ? (
              <p className="mt-5 max-w-xl text-lg text-stone-200">
                {heroExp.subtitle ?? heroExp.shortDescription}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/expediciones"
                className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Descubrí nuestros viajes
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Escribinos por WhatsApp
                </a>
              )}
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
          </div>
        </div>
      </section>

      {/* 2. PRÓXIMA EXPEDICIÓN / VIAJE */}
      {upcoming && (
        <section className="reveal mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid-cols-2">
            <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[420px]">
              {upcoming.coverImage ? (
                <Image
                  src={upcoming.coverImage}
                  alt={upcoming.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-stone-200" />
              )}
            </div>
            <div className="p-8 sm:p-10">
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                Próximamente
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                {upcoming.name}
              </h2>
              {upcoming.subtitle && (
                <p className="mt-2 text-lg text-stone-600">{upcoming.subtitle}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-500">
                {upcoming.destination && <span>📍 {upcoming.destination.name}</span>}
                {upcoming.startDate && <span>🗓️ {formatDateRange(upcoming.startDate, upcoming.endDate)}</span>}
                {upcoming.durationDays ? <span>⏳ {upcoming.durationDays} días</span> : null}
              </div>
              {upcoming.shortDescription && (
                <p className="mt-4 text-stone-700">{upcoming.shortDescription}</p>
              )}
              <Link
                href={`/expediciones/${upcoming.slug}`}
                className="mt-7 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Conocer más detalles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. EXPERIENCIAS DESTACADAS */}
      {featured.length > 0 && (
        <section className="reveal bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                  Experiencias destacadas
                </h2>
                <p className="mt-2 text-stone-600">Una selección de nuestros viajes.</p>
              </div>
              <Link href="/expediciones" className="text-sm font-semibold text-accent hover:text-accent-dark">
                Ver todos →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((e) => (
                <ExpeditionCard key={e.slug} expedition={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. ¿POR QUÉ NOSOTROS? */}
      {pillars.length > 0 && (
        <section className="reveal mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {settings.homeWhyTitle || "¿Por qué nosotros?"}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                  {p.icon || "✦"}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{p.title}</h3>
                {p.description && <p className="mt-2 text-sm text-stone-600">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. RESEÑAS DE EXPEDICIONARIOS */}
      {reviews.length > 0 && (
        <section className="reveal bg-ink py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Lo que dicen nuestros expedicionarios
            </h2>
            <p className="mt-2 text-stone-300">Experiencias que quedan.</p>
            <div className="mt-10">
              <ReviewsCarousel reviews={reviews} />
            </div>
          </div>
        </section>
      )}

      {/* 6. CTA FINAL */}
      <section className="reveal mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">
          {settings.ctaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">{settings.ctaText}</p>
        <Link
          href="/expediciones"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
        >
          {settings.ctaButton}
        </Link>
      </section>
    </>
  );
}
