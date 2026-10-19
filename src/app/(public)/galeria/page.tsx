import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedGallery } from "@/lib/gallery";
import { getSiteTexts } from "@/lib/site-texts";
import { PhotoGallery } from "@/components/public/PhotoGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [texts, { photos }] = await Promise.all([getSiteTexts(), getPublishedGallery(0, 1)]);
  return {
    title: texts.galeriaTitle,
    description: texts.galeriaSubtitle,
    openGraph: {
      title: texts.galeriaTitle,
      description: texts.galeriaSubtitle,
      images: photos[0] ? [{ url: photos[0].url }] : undefined,
    },
  };
}

export default async function GalleryPage() {
  const [texts, { photos, hasMore }] = await Promise.all([getSiteTexts(), getPublishedGallery()]);

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6 sm:pb-14 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            {texts.galeriaTitle}
          </h1>
          {texts.galeriaSubtitle && (
            <p className="mt-5 max-w-xl text-lg text-stone-300">{texts.galeriaSubtitle}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-label={texts.galeriaTitle}>
        {photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-20 text-center">
            <p className="font-display text-2xl text-ink">{texts.galeriaEmptyTitle}</p>
            <p className="mx-auto mt-3 max-w-md text-stone-500">{texts.galeriaEmptyText}</p>
            <Link
              href="/expediciones"
              className="mt-7 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Mirá nuestros viajes
            </Link>
          </div>
        ) : (
          <PhotoGallery initial={photos} initialHasMore={hasMore} />
        )}
      </section>
    </>
  );
}
