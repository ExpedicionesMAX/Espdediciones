import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteTexts } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comunidad",
  description: "Experiencias y testimonios de quienes ya vivieron nuestras expediciones.",
};

export default async function CommunityPage() {
  const texts = await getSiteTexts();
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { expedition: { select: { name: true, slug: true } } },
  });

  return (
    <>
      <section className="bg-ink px-4 pb-14 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{texts.comunidadTitle}</h1>
          <p className="mt-3 max-w-xl text-stone-300">{texts.comunidadSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-20 text-center">
            <p className="font-display text-xl text-ink">Todavía no hay testimonios publicados.</p>
            <p className="mt-2 text-stone-500">
              ¿Viviste una expedición con nosotros? Dejá tu testimonio en su página.
            </p>
            <Link
              href="/expediciones"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Ver expediciones
            </Link>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="mb-6 break-inside-avoid rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                {t.rating ? (
                  <p className="text-accent">
                    {"★".repeat(t.rating)}
                    <span className="text-stone-300">{"★".repeat(5 - t.rating)}</span>
                  </p>
                ) : null}
                <blockquote className="mt-2 text-stone-700">“{t.text}”</blockquote>
                <figcaption className="mt-4 border-t border-stone-100 pt-3 text-sm">
                  <span className="font-medium text-ink">{t.authorName}</span>
                  {t.expedition && (
                    <>
                      <span className="text-stone-400"> · </span>
                      <Link
                        href={`/expediciones/${t.expedition.slug}`}
                        className="text-accent hover:underline"
                      >
                        {t.expedition.name}
                      </Link>
                    </>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-stone-200 bg-paper px-4 py-14 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl font-display text-2xl font-semibold text-ink sm:text-3xl">
          {texts.comunidadCtaTitle}
        </h2>
        <Link
          href="/expediciones"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          {texts.comunidadCtaButton}
        </Link>
      </section>
    </>
  );
}
