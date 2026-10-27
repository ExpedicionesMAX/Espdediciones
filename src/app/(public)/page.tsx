import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard, CARD_SELECT } from "@/components/public/ExpeditionCard";
import { ReviewsCarousel } from "@/components/public/ReviewsCarousel";
import { ContentImage } from "@/components/public/ContentImage";
import { StoryPhotos, type StoryPhoto } from "@/components/public/StoryPhotos";
import { getSiteSettings, type WhyPillar } from "@/lib/site";
import { getAboutPageFallback, getHomeContent, getTripPhotos } from "@/lib/page-content";
import { paragraphs } from "@/lib/content-fields";
import { getSiteTexts } from "@/lib/site-texts";
import type { HomeSectionKey } from "@/lib/home-content";
import { CUSTOM_TRIP_PATH } from "@/lib/trip-categories";
import { whatsappUrl, formatDateRange } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Velo sobre la foto de portada según lo elegido en el panel ("medium" = el de siempre). */
const HERO_OVERLAY_CLASS: Record<string, string> = {
  none: "",
  light: "from-black/55 via-black/15 to-transparent",
  medium: "from-black/85 via-black/40 to-black/30",
  strong: "from-black/90 via-black/60 to-black/45",
};

/** Tamaños del título y del texto de portada elegibles en el panel. */
const HERO_TITLE_CLASS: Record<string, string> = {
  sm: "text-2xl sm:text-4xl lg:text-5xl",
  md: "text-3xl sm:text-5xl lg:text-6xl",
  lg: "text-4xl sm:text-6xl lg:text-7xl", // el tamaño que tenía antes
  xl: "text-5xl sm:text-7xl lg:text-8xl",
};
const HERO_TEXT_CLASS: Record<string, string> = {
  sm: "text-sm sm:text-base",
  md: "text-base sm:text-[17px]",
  lg: "text-lg sm:text-xl",
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  vimeo: "Vimeo",
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, { content }, photos] = await Promise.all([
    getSiteSettings(),
    getHomeContent(),
    getTripPhotos(),
  ]);
  const title = settings.tagline ? `${settings.siteName} — ${settings.tagline}` : settings.siteName;
  const description = content.hero.text;
  const image = content.hero.image || photos[0]?.url;
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

/** Rótulo pequeño sobre los títulos de sección. */
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.25em] ${light ? "text-stone-400" : "text-accent"}`}
    >
      {children}
    </p>
  );
}

export default async function HomePage() {
  const [settings, { content }, aboutPage, photos, texts] = await Promise.all([
    getSiteSettings(),
    getHomeContent(),
    getAboutPageFallback(),
    getTripPhotos(),
    getSiteTexts(),
  ]);
  const visible = new Set(content.sections.filter((s) => s.visible).map((s) => s.key));
  const { hero, story, philosophy, team, trips, closing } = content;
  const centered = hero.align === "center";

  // ── Datos reales para las secciones de viajes (solo si se muestran) ──
  const [selection, upcoming, reviewsRaw] = await Promise.all([
    visible.has("viajes") ? getTripSelection() : Promise.resolve([]),
    visible.has("proxima") ? getUpcoming(settings.upcomingExpeditionId) : Promise.resolve(null),
    visible.has("resenas")
      ? prisma.testimonial.findMany({
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
        })
      : Promise.resolve([]),
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

  // ── Imágenes: las cargadas en el panel; si no, fotos reales de los viajes ──
  const heroPhoto = hero.image
    ? { url: hero.image, alt: hero.imageAlt || hero.title }
    : (photos[0] ?? null);
  // Fotos de la historia cargadas en el panel; si no hay, una foto real de un viaje (no ampliable).
  const fallbackStoryPhoto = photos.find((p) => p.url !== heroPhoto?.url) ?? null;
  const storyPhotos: StoryPhoto[] =
    story.images.length > 0
      ? story.images.map((img) => ({ ...img, alt: img.alt || img.title || story.title }))
      : fallbackStoryPhoto
        ? [{ url: fallbackStoryPhoto.url, alt: fallbackStoryPhoto.alt, width: null, height: null }]
        : [];
  const hasStoryPhotos = storyPhotos.length > 0;

  // «Nuestra historia»: lo cargado en el inicio o, si no, la página «Nosotros» del panel.
  const storyBody = paragraphs(story.body || aboutPage?.content || "");
  const storyIntro = story.intro;

  const wa = whatsappUrl(settings.whatsappNumber, "Hola, quiero conocer más sobre el proyecto.");
  const socials = Object.entries(settings.social ?? {}).filter(([, url]) => !!url);

  const sections: Record<HomeSectionKey, React.ReactNode> = {
    // ── NOSOTROS / NUESTRA HISTORIA ──
    nosotros:
      storyBody.length > 0 || storyIntro ? (
        <section
          key="nosotros"
          id="nosotros"
          aria-labelledby="nosotros-titulo"
          className="scroll-mt-20"
        >
          <div
            className={`mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28 ${
              hasStoryPhotos
                ? `grid gap-12 lg:grid-cols-2 lg:gap-16 ${storyPhotos.length > 1 ? "items-start" : "items-center"}`
                : ""
            }`}
          >
            {hasStoryPhotos && (
              <div className="reveal">
                <StoryPhotos photos={storyPhotos} interactive={story.images.length > 0} />
              </div>
            )}
            {/* Con varias fotos, el texto va primero (a la izquierda en escritorio) y las fotos lo acompañan. */}
            <div
              className={
                !hasStoryPhotos ? "mx-auto max-w-3xl" : storyPhotos.length > 1 ? "lg:order-first" : ""
              }
            >
              <Eyebrow>{story.eyebrow}</Eyebrow>
              <h2
                id="nosotros-titulo"
                className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl"
              >
                {story.title}
              </h2>
              {storyIntro && (
                <p className="mt-6 text-xl leading-relaxed text-ink-soft">{storyIntro}</p>
              )}
              {storyBody.length > 0 && (
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone-700">
                  {storyBody.map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null,

    // ── NUESTRA FILOSOFÍA ──
    filosofia:
      philosophy.items.length > 0 ? (
        <section
          key="filosofia"
          id="filosofia"
          aria-labelledby="filosofia-titulo"
          className="reveal scroll-mt-20 bg-ink text-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="max-w-2xl">
              <Eyebrow light>{philosophy.eyebrow}</Eyebrow>
              <h2
                id="filosofia-titulo"
                className="mt-4 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl"
              >
                {philosophy.title}
              </h2>
              {philosophy.intro && (
                <p className="mt-6 text-lg leading-relaxed text-stone-300">{philosophy.intro}</p>
              )}
            </div>
            <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {philosophy.items.map((item, i) => (
                <li key={i} className="border-t border-white/20 pt-5">
                  <span className="font-display text-sm tracking-[0.2em] text-stone-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-semibold">{item.title}</h3>
                  {item.text && <p className="mt-3 text-stone-300">{item.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null,

    // ── EQUIPO (solo si hay integrantes cargados) ──
    equipo:
      team.members.length > 0 ? (
        <section
          key="equipo"
          id="equipo"
          aria-labelledby="equipo-titulo"
          className="reveal mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28"
        >
          <div className="max-w-2xl">
            <Eyebrow>{team.eyebrow}</Eyebrow>
            <h2
              id="equipo-titulo"
              className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl"
            >
              {team.title}
            </h2>
            {team.intro && <p className="mt-6 text-lg leading-relaxed text-stone-600">{team.intro}</p>}
          </div>
          <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.members.map((m, i) => (
              <li key={i}>
                {m.photo && (
                  <div className="relative mb-5 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-200">
                    <ContentImage
                      src={m.photo}
                      alt={m.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold text-ink">{m.name}</h3>
                {m.role && <p className="mt-1 text-sm font-medium text-accent">{m.role}</p>}
                {m.bio && <p className="mt-3 whitespace-pre-line text-stone-600">{m.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      ) : null,

    // ── NUESTROS VIAJES (selección real) ──
    viajes: (
      <section
        key="viajes"
        id="viajes"
        aria-labelledby="viajes-titulo"
        className="reveal scroll-mt-20 border-t border-stone-200 bg-paper"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <h2
              id="viajes-titulo"
              className="font-display text-4xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-5xl"
            >
              {trips.title}
            </h2>
            {trips.text && <p className="mt-5 text-lg leading-relaxed text-stone-600">{trips.text}</p>}
          </div>
          {selection.length > 0 && (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {selection.map((e) => (
                <ExpeditionCard key={e.slug} expedition={e} />
              ))}
            </div>
          )}
          <div className="mt-12">
            <Link
              href="/expediciones"
              className="inline-block rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-stone-800"
            >
              {trips.buttonLabel}
            </Link>
          </div>
        </div>
      </section>
    ),

    // ── PRÓXIMA EXPERIENCIA (opcional, se activa desde el panel) ──
    proxima: upcoming ? (
      <section key="proxima" className="reveal mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
            {upcoming.subtitle && <p className="mt-2 text-lg text-stone-600">{upcoming.subtitle}</p>}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-500">
              {upcoming.destination && <span>{upcoming.destination.name}</span>}
              {upcoming.startDate && <span>{formatDateRange(upcoming.startDate, upcoming.endDate)}</span>}
              {upcoming.durationDays ? <span>{upcoming.durationDays} días</span> : null}
            </div>
            {upcoming.shortDescription && <p className="mt-4 text-stone-700">{upcoming.shortDescription}</p>}
            <Link
              href={`/expediciones/${upcoming.slug}`}
              className="mt-7 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Conocer más detalles
            </Link>
          </div>
        </div>
      </section>
    ) : null,

    // ── ¿POR QUÉ NOSOTROS? (pilares de Configuración) ──
    diferenciales:
      pillars.length > 0 ? (
        <section key="diferenciales" className="reveal mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
      ) : null,

    // ── RESEÑAS ──
    resenas:
      reviews.length > 0 ? (
        <section key="resenas" className="reveal bg-ink py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{texts.homeReviewsTitle}</h2>
            {texts.homeReviewsSubtitle && <p className="mt-2 text-stone-300">{texts.homeReviewsSubtitle}</p>}
            <div className="mt-10">
              <ReviewsCarousel reviews={reviews} />
            </div>
          </div>
        </section>
      ) : null,

    // ── CIERRE INSTITUCIONAL Y CONTACTO ──
    cierre: (
      <section
        key="cierre"
        id="contacto"
        aria-labelledby="contacto-titulo"
        className="reveal scroll-mt-20 border-t border-stone-200"
      >
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2
            id="contacto-titulo"
            className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl"
          >
            {closing.title}
          </h2>
          {closing.text && (
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-600">{closing.text}</p>
          )}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                {closing.buttonLabel}
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="rounded-full px-7 py-3 text-sm font-semibold text-ink ring-1 ring-inset ring-stone-300 transition-colors hover:bg-stone-100"
              >
                {settings.contactEmail}
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-stone-600">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url as string} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 text-sm text-stone-500">
            ¿Tenés una idea propia?{" "}
            <Link href={CUSTOM_TRIP_PATH} className="font-semibold text-accent hover:text-accent-dark">
              Consultá por un viaje a medida <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>
    ),
  };

  return (
    <>
      {/* HERO INSTITUCIONAL */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-ink">
        {heroPhoto && (
          <ContentImage src={heroPhoto.url} alt={hero.imageAlt || heroPhoto.alt} sizes="100vw" priority />
        )}
        {/* Velo oscuro para que el texto se lea; la intensidad se elige en el panel. */}
        {HERO_OVERLAY_CLASS[hero.overlay] && (
          <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${HERO_OVERLAY_CLASS[hero.overlay]}`} />
        )}
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:pb-28">
          <div
            className={`max-w-3xl animate-fade-up text-white ${centered ? "mx-auto text-center" : ""} ${hero.overlay === "none" || hero.overlay === "light" ? "hero-text-shadow" : ""}`}
          >
            {/* Rótulo superior: solo si tiene letras o números (vacío o un «.» = no se muestra) */}
            {/[\p{L}\p{N}]/u.test(hero.eyebrow) && (
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-stone-300">
                {hero.eyebrow}
              </p>
            )}
            <h1
              className={`font-display font-semibold leading-[1.08] [overflow-wrap:anywhere] ${HERO_TITLE_CLASS[hero.titleSize] ?? HERO_TITLE_CLASS.md}`}
            >
              {hero.title}
            </h1>
            {hero.text && (
              <p
                className={`mt-5 max-w-xl leading-relaxed text-stone-200 ${centered ? "mx-auto" : ""} ${HERO_TEXT_CLASS[hero.textSize] ?? HERO_TEXT_CLASS.md}`}
              >
                {hero.text}
              </p>
            )}
            <div className={`mt-9 flex flex-wrap gap-3 sm:gap-4 ${centered ? "justify-center" : ""}`}>
              <HeroLink
                href={hero.primaryHref}
                className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                {hero.primaryLabel}
              </HeroLink>
              <HeroLink
                href={hero.secondaryHref}
                className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {hero.secondaryLabel}
              </HeroLink>
            </div>
            {settings.reviewsLabel &&
              (settings.reviewsUrl ? (
                <a
                  href={settings.reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-block text-sm font-medium text-stone-200 hover:text-white"
                >
                  {settings.reviewsLabel}
                </a>
              ) : (
                <p className="mt-7 text-sm font-medium text-stone-200">{settings.reviewsLabel}</p>
              ))}
          </div>
        </div>
      </section>

      {content.sections.filter((s) => s.visible).map((s) => sections[s.key])}
    </>
  );
}

/** Botón del hero: anclas y rutas internas sin pestaña nueva; URLs externas en pestaña nueva. */
function HeroLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Hasta 3 viajes reales: los destacados primero; si no hay destacados, los publicados. */
async function getTripSelection() {
  const featured = await prisma.expedition.findMany({
    where: publicExpeditionWhere({ featured: true }),
    orderBy: [{ homeOrder: "asc" }, { name: "asc" }],
    take: 3,
    select: CARD_SELECT,
  });
  if (featured.length > 0) return featured;
  return prisma.expedition.findMany({
    where: publicExpeditionWhere(),
    orderBy: [{ homeOrder: "asc" }, { name: "asc" }],
    take: 3,
    select: CARD_SELECT,
  });
}

/** Próxima experiencia: la elegida en Configuración; si no, la de fecha futura más cercana. */
async function getUpcoming(upcomingId: string | null) {
  const select = {
    slug: true,
    name: true,
    subtitle: true,
    shortDescription: true,
    coverImage: true,
    startDate: true,
    endDate: true,
    durationDays: true,
    destination: { select: { name: true } },
  } as const;
  const chosen = upcomingId
    ? await prisma.expedition.findFirst({ where: publicExpeditionWhere({ id: upcomingId }), select })
    : null;
  if (chosen) return chosen;
  return prisma.expedition.findFirst({
    where: publicExpeditionWhere({ startDate: { gte: new Date() } }),
    orderBy: { startDate: "asc" },
    select,
  });
}
