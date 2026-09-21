import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Expedition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";
import { buildMediaList } from "@/lib/media";
import { MediaGallery } from "@/components/public/MediaGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { ReservationForm } from "@/components/public/ReservationForm";
import { TestimonialForm } from "@/components/public/TestimonialForm";
import {
  ACTIVITY_LABELS,
  DIFFICULTY_LABELS,
  formatDateRange,
  formatPrice,
  spotsInfo,
  whatsappUrl,
} from "@/lib/format";

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
  const description =
    exp.seoDescription ?? exp.shortDescription ?? undefined;
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
      leadGuide: true,
      guides: true,
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
  const spots = spotsInfo(exp.capacity, exp.spotsTaken);
  const reservable = visible && ["OPEN", "LIMITED", "FULL"].includes(exp.status);
  const isFull = exp.status === "FULL";

  const testimonials = await prisma.testimonial.findMany({
    where: { expeditionId: exp.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const media = buildMediaList(exp.gallery, exp.videoUrl);
  const faqs = (exp.faqs as { q: string; a: string }[] | null) ?? [];
  const allGuides = [exp.leadGuide, ...exp.guides].filter(
    (g, i, arr) => g && arr.findIndex((x) => x?.id === g.id) === i,
  );

  const waMessage =
    exp.whatsappMessage ??
    `Hola, quiero recibir información sobre la expedición ${exp.name}.`;
  const wa = whatsappUrl(settings.whatsappNumber, waMessage);

  const facts: { label: string; value: string }[] = [];
  if (exp.durationDays) facts.push({ label: "Duración", value: `${exp.durationDays} días` });
  if (exp.difficulty) facts.push({ label: "Dificultad", value: DIFFICULTY_LABELS[exp.difficulty] });
  if (exp.distanceKm) facts.push({ label: "Distancia", value: `${exp.distanceKm} km` });
  if (exp.maxAltitude) facts.push({ label: "Altitud máx.", value: `${exp.maxAltitude} m` });
  if (exp.elevationGain) facts.push({ label: "Desnivel", value: `+${exp.elevationGain} m` });
  if (exp.capacity) facts.push({ label: "Grupo", value: `${exp.capacity} personas` });

  return (
    <>
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
          <p className="mt-4 text-sm text-stone-300">
            {formatDateRange(exp.startDate, exp.endDate)}
          </p>
        </div>
      </section>

      {/* QUICK FACTS */}
      {facts.length > 0 && (
        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-6">
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
              <h2 className="font-display text-2xl font-semibold text-ink">La expedición</h2>
              <p className="rich-text mt-4 text-stone-700">{exp.fullDescription}</p>
            </section>
          )}

          {/* ITINERARIO */}
          {exp.itinerary.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Itinerario</h2>
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
              <h2 className="font-display text-2xl font-semibold text-ink">Galería</h2>
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
                  <h2 className="font-display text-xl font-semibold text-ink">Incluye</h2>
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
                  <h2 className="font-display text-xl font-semibold text-ink">No incluye</h2>
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
                  <h2 className="font-display text-xl font-semibold text-ink">Equipamiento</h2>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-stone-700">
                    {exp.equipment.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {exp.requirements.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Requisitos</h2>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-stone-700">
                    {exp.requirements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* GUÍAS */}
          {allGuides.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Guías</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {allGuides.map((g) =>
                  g ? (
                    <div key={g.id} className="flex gap-4">
                      {g.photo && (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                          <Image src={g.photo} alt={g.name} fill sizes="64px" className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-ink">{g.name}</p>
                        {g.specialties.length > 0 && (
                          <p className="text-xs text-accent">{g.specialties.join(" · ")}</p>
                        )}
                        {g.bio && <p className="mt-1 text-sm text-stone-600">{g.bio}</p>}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </section>
          )}

          {/* TESTIMONIOS */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">Testimonios</h2>
            {testimonials.length > 0 ? (
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
                    <figcaption className="mt-3 text-sm font-medium text-ink">
                      — {t.authorName}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-stone-500">
                Todavía no hay testimonios. ¿Hiciste esta expedición? Sé la primera persona en contarlo.
              </p>
            )}
            {visible && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-ink">Dejá tu testimonio</h3>
                <div className="mt-4">
                  <TestimonialForm expeditionId={exp.id} />
                </div>
              </div>
            )}
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Preguntas frecuentes</h2>
              <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
                {faqs.map((f, i) => (
                  <details key={i} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
                      {f.q}
                      <span className="text-accent transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-stone-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* INSCRIPCIÓN */}
          {reservable && (
            <section id="inscribirme">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {isFull ? "Lista de espera" : "Inscripción"}
              </h2>
              <p className="mt-2 text-stone-600">
                {isFull
                  ? "La expedición está completa. Anotate y te avisamos si se libera un lugar."
                  : "Completá tus datos para preinscribirte. El equipo te contacta para confirmar."}
              </p>
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <ReservationForm expeditionId={exp.id} isFull={isFull} />
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Desde</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {formatPrice(exp.price, exp.currency)}
            </p>
            {exp.depositPrice != null && (
              <p className="mt-1 text-sm text-stone-500">
                Reserva: {formatPrice(exp.depositPrice, exp.currency)}
              </p>
            )}
            <p className="mt-3 text-sm font-medium text-ink">{spots.label}</p>

            <div className="mt-5 space-y-3">
              {reservable && (
                <a
                  href="#inscribirme"
                  className="block rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-white hover:bg-accent-dark"
                >
                  {isFull ? "Lista de espera" : "Inscribirme"}
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Consultar por WhatsApp
                </a>
              )}
              <a
                href="#consultar"
                className="block rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-white hover:bg-stone-800"
              >
                Enviar consulta
              </a>
            </div>
            <a
              href={`/expediciones/${exp.slug}/ficha`}
              target="_blank"
              className="mt-3 block text-center text-sm font-medium text-accent hover:text-accent-dark"
            >
              Descargar ficha técnica (PDF)
            </a>
          </div>

          <div id="consultar" className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-ink">
              Pedí información
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Te respondemos con todos los detalles.
            </p>
            <div className="mt-4">
              <InquiryForm expeditionId={exp.id} expeditionName={exp.name} />
            </div>
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
