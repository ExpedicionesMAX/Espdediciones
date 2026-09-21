import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) return { title: "Página no encontrada" };

  const title = page.seoTitle ?? page.title;
  const description = page.seoDescription ?? page.subtitle ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.coverImage ? [{ url: page.coverImage }] : undefined,
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) notFound();

  const paragraphs = (page.content ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      {page.coverImage ? (
        <section className="relative flex min-h-[45vh] items-end overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.coverImage} alt={page.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
          <div className="relative mx-auto w-full max-w-3xl px-4 pb-12 pt-32 text-white sm:px-6">
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">{page.title}</h1>
            {page.subtitle && <p className="mt-3 text-lg text-stone-200">{page.subtitle}</p>}
          </div>
        </section>
      ) : (
        <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">{page.title}</h1>
            {page.subtitle && <p className="mt-3 text-lg text-stone-300">{page.subtitle}</p>}
          </div>
        </section>
      )}

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {paragraphs.length > 0 ? (
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="rich-text text-stone-700">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Esta página todavía no tiene contenido.</p>
        )}
      </article>
    </>
  );
}
