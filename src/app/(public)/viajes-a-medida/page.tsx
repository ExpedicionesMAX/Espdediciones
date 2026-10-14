import Link from "next/link";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/public/InquiryForm";
import { ContentImage } from "@/components/public/ContentImage";
import { getSiteSettings } from "@/lib/site";
import { getCustomTripContent, getTripPhotos } from "@/lib/page-content";
import { paragraphs } from "@/lib/content-fields";
import { whatsappUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ content }, photos] = await Promise.all([getCustomTripContent(), getTripPhotos()]);
  const image = content.hero.image || photos[1]?.url || photos[0]?.url;
  return {
    title: content.seo.title,
    description: content.seo.description,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function CustomTripPage() {
  const [settings, { content }, photos] = await Promise.all([
    getSiteSettings(),
    getCustomTripContent(),
    getTripPhotos(),
  ]);
  const { hero, intro, process, form, whatsapp } = content;

  // Foto propia o, si no hay, una foto real de los viajes (distinta a la del inicio si se puede).
  const heroPhoto = hero.image
    ? { url: hero.image, alt: hero.imageAlt || hero.title }
    : (photos[1] ?? photos[0] ?? null);
  const wa = whatsappUrl(settings.whatsappNumber, whatsapp.message);
  const introParagraphs = paragraphs(intro.body);

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-ink">
        {heroPhoto && (
          <ContentImage src={heroPhoto.url} alt={hero.imageAlt || heroPhoto.alt} sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-300">{hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              {hero.title}
            </h1>
            {hero.text && <p className="mt-5 max-w-xl text-lg text-stone-200">{hero.text}</p>}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              {form.show && (
                <a
                  href="#consulta"
                  className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                >
                  {form.title}
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {whatsapp.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROPUESTA */}
      <section className="reveal mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:py-28">
        <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {intro.title}
        </h2>
        <div className="space-y-5 text-lg leading-relaxed text-stone-700">
          {introParagraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* PROCESO DE CONSULTA */}
      {process.steps.length > 0 && (
        <section className="reveal bg-paper" aria-labelledby="proceso-titulo">
          <div className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="proceso-titulo" className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {process.title}
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {process.steps.map((s, i) => (
                <li key={i} className="border-t border-ink/80 pt-5">
                  <span className="font-display text-sm font-semibold tracking-[0.2em] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-ink">{s.title}</h3>
                  {s.text && <p className="mt-2 text-stone-600">{s.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* CONSULTA */}
      <section
        id="consulta"
        className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:py-28"
      >
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{form.title}</h2>
          <p className="mt-4 max-w-md text-stone-600">{form.text}</p>
          <ul className="mt-8 space-y-3 text-sm text-stone-700">
            {settings.contactEmail && (
              <li>
                <span className="font-medium text-ink">Email:</span>{" "}
                <a href={`mailto:${settings.contactEmail}`} className="text-accent hover:underline">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && (
              <li>
                <span className="font-medium text-ink">Teléfono:</span> {settings.contactPhone}
              </li>
            )}
          </ul>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {whatsapp.label}
            </a>
          )}
          <p className="mt-10 text-sm text-stone-500">
            ¿Preferís un viaje ya armado?{" "}
            <Link href="/expediciones" className="font-semibold text-accent hover:text-accent-dark">
              Mirá nuestros viajes <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>

        {form.show ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <InquiryForm origin="a-medida" />
          </div>
        ) : null}
      </section>
    </>
  );
}
