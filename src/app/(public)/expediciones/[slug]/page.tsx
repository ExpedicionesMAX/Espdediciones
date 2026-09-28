import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Expedition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";
import { getSiteTexts } from "@/lib/site-texts";
import { buildMediaList } from "@/lib/media";
import { MediaGallery } from "@/components/public/MediaGallery";
import { DIFFICULTY_LABELS, ACTIVITY_LABELS, whatsappUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

function isVisible(exp: Pick<Expedition, "publishedAt" | "status" | "unpublishAt">): boolean {
  if (!exp.publishedAt || exp.publishedAt > new Date()) return false;
  if (!["OPEN", "LIMITED", "FULL", "COMPLETED"].includes(exp.status)) return false;
  if (exp.unpublishAt && exp.unpublishAt <= new Date()) return false;
  return true;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = await prisma.expedition.findUnique({
    where: { slug },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      shortDescription: true,
      ogImage: true,
      coverImage: true,
    },
  });
  if (!exp) return { title: "Expedición no encontrada" };

  const title = exp.seoTitle ?? exp.name;
  const description = exp.seoDescription ?? exp.shortDescription ?? undefined;
  const image = exp.ogImage ?? exp.coverImage ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ExpeditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const exp = await prisma.expedition.findUnique({
    where: { slug },
    include: {
      destination: true,
      itinerary: { orderBy: { dayNumber: "asc" } },
    },
  });

  if (!exp) notFound();

  const visible = isVisible(exp);
  const session = await auth();
  const isStaff = !!session?.user;
  if (!visible && !isStaff) notFound();

  // Contar vista pública (fire-and-forget, sin bloquear el render)
  if (visible && !isStaff) {
    void prisma.expedition
      .update({ where: { id: exp.id }, data: { viewsCount: { increment: 1 } } })
      .catch(() => {});
  }

  const settings = await getSiteSettings();
  const texts = await getSiteTexts();

  // Solo testimonios aprobados y anclados a esta expedición (los ancla el admin).
  const testimonials = await prisma.testimonial.findMany({
    where: { expeditionId: exp.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const media = buildMediaList(exp.gallery, exp.videoUrl);

  const waMessage =
    exp.whatsappMessage ??
    `Hola, quiero sumarme al grupo para conocer más sobre el viaje ${exp.name}.`;
  const wa = whatsappUrl(settings.whatsappNumber, waMessage);

  const facts: { label: string; value: string }[] = [];
  if (exp.durationDays) facts.push({ label: "Duración", value: `${exp.durationDays} días` });
  if (exp.difficulty) facts.push({ label: "Dificultad", value: DIFFICULTY_LABELS[exp.difficulty] });
  if (exp.distanceKm) facts.push({ label: "Distancia", value: `${exp.distanceKm} km` });
  if (exp.maxAltitude) facts.push({ label: "Altitud máx.", value: `${exp.maxAltitude} m` });
  if (exp.elevationGain) facts.push({ label: "Desnivel", value: `+${exp.elevationGain} m` });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: exp.name,
    description: exp.shortDescription ?? exp.subtitle ?? undefined,
    image: exp.coverImage ? [exp.coverImage] : undefined,
    provider: { "@type": "Organization", name: settings.siteName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {!visible && isStaff && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
          Vista previa · esta expedición no está publicada
        </div>
      )}

      {/* HERO */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        {exp.coverImage ? (
          <Image src={exp.coverImage} alt={exp.name} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 text-white sm:px-6">
          <div className="flex flex-wrap gap-2">
            {exp.activityType && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
                {ACTIVITY_LABELS[exp.activityType]}
              </span>
            )}
            {exp.destination && (
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur">
                {exp.destination.name}
                {exp.destination.country ? ` · ${exp.destination.country}` : ""}
              </span>
            )}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {exp.name}
          </h1>
          {exp.subtitle && (
            <p className="mt-4 max-w-2xl text-lg text-stone-200">{exp.subtitle}</p>
          )}
          {exp.durationDays ? (
            <p className="mt-4 text-sm text-stone-300">{exp.durationDays} días de viaje</p>
          ) : null}
        </div>
      </section>

      {/* QUICK FACTS */}
      {facts.length > 0 && (
        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label} className="px-2 text-center">
                <p className="text-xs uppercase tracking-wider text-stone-500">{f.label}</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px]">
        {/* MAIN */}
        <div className="space-y-14">
          {exp.fullDescription && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">{texts.expLaExpedicion}</h2>
              <p className="rich-text mt-4 text-stone-700">{exp.fullDescription}</p>
            </section>
          )}

          {/* ITINERARIO */}
          {exp.itinerary.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">{texts.expItinerario}</h2>
              <ol className="mt-6 space-y-6 border-l border-stone-200 pl-6">
                {exp.itinerary.map((day) => (
                  <li key={day.id} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-paper" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Día {day.dayNumber}
                    </p>
                    <h3 className="mt-1 font-medium text-ink">{day.title}</h3>
                    {day.description && (
                      <p className="mt-1 text-sm text-stone-600">{day.description}</p>
                    )}
                    <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-stone-500">
                      {day.distanceKm ? <span>{day.distanceKm} km</span> : null}
                      {day.elevationGain ? <span>+{day.elevationGain} m</span> : null}
                      {day.altitude ? <span>{day.altitude} m</span> : null}
                      {day.accommodation ? <span>{day.accommodation}</span> : null}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* GALERÍA (fotos + videos, en pantalla completa) */}
          {media.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">{texts.expGaleria}</h2>
              <p className="mt-1 text-sm text-stone-500">Tocá una foto o video para verlo en pantalla completa.</p>
              <div className="mt-6">
                <MediaGallery items={media} />
              </div>
            </section>
          )}

          {/* INCLUYE / NO INCLUYE */}
          {(exp.includes.length > 0 || exp.excludes.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {exp.includes.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{texts.expIncluye}</h2>
                  <ul className="mt-4 space-y-2">
                    {exp.includes.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-700">
                        <span className="text-emerald-600">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp.excludes.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{texts.expNoIncluye}</h2>
                  <ul className="mt-4 space-y-2">
                    {exp.excludes.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-500">
                        <span className="text-stone-400">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* EQUIPAMIENTO / REQUISITOS */}
          {(exp.equipment.length > 0 || exp.requirements.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {exp.equipment.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{texts.expEquipamiento}</h2>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-stone-700">
                    {exp.equipment.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {exp.requirements.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{texts.expRequisitos}</h2>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-stone-700">
                    {exp.requirements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* TESTIMONIOS (solo lectura; el admin decide cuáles se anclan) */}
          {testimonials.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">{texts.expTestimonios}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {testimonials.map((t) => (
                  <figure key={t.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                    {t.rating ? (
                      <p className="text-accent">
                        {"★".repeat(t.rating)}
                        <span className="text-stone-300">{"★".repeat(5 - t.rating)}</span>
                      </p>
                    ) : null}
                    <blockquote className="mt-2 text-stone-700">“{t.text}”</blockquote>
                    <figcaption className="mt-3 text-sm font-medium text-ink">— {t.authorName}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR — solo WhatsApp para sumarse al grupo */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-ink">
              ¿Querés saber más sobre este viaje?
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Sumate al grupo de WhatsApp y te contamos todos los detalles: fechas, lugares y
              cómo participar.
            </p>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.86 9.86 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                Unite al grupo de WhatsApp
              </a>
            ) : (
              <p className="mt-5 rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-500">
                Configurá el número de WhatsApp en el panel para habilitar este botón.
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="border-t border-stone-200 bg-paper py-10 text-center">
        <Link href="/expediciones" className="text-sm font-semibold text-accent hover:text-accent-dark">
          ← Ver todas las expediciones
        </Link>
      </div>
    </>
  );
}
