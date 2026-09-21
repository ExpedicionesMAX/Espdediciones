import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard } from "@/components/public/ExpeditionCard";
import { MediaGallery } from "@/components/public/MediaGallery";
import { buildMediaList } from "@/lib/media";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await prisma.destination.findUnique({
    where: { slug },
    select: { name: true, description: true, coverImage: true, country: true },
  });
  if (!d) return { title: "Destino no encontrado" };
  const description = d.description ?? `Expediciones en ${d.name}, ${d.country}.`;
  return {
    title: d.name,
    description,
    openGraph: {
      title: d.name,
      description,
      images: d.coverImage ? [{ url: d.coverImage }] : undefined,
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const destination = await prisma.destination.findUnique({ where: { slug } });
  if (!destination) notFound();

  const expeditions = await prisma.expedition.findMany({
    where: publicExpeditionWhere({ destinationId: destination.id }),
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    select: cardSelect,
  });

  return (
    <>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        {destination.coverImage ? (
          <Image src={destination.coverImage} alt={destination.name} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-32 text-white sm:px-6">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-300">
            {destination.country}
            {destination.region ? ` · ${destination.region}` : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">{destination.name}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {destination.description && (
          <p className="rich-text max-w-3xl text-lg text-stone-700">{destination.description}</p>
        )}

        {destination.gallery.length > 0 && (
          <div className="mt-10">
            <MediaGallery items={buildMediaList(destination.gallery)} />
          </div>
        )}

        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Expediciones en {destination.name}
          </h2>
          {expeditions.length === 0 ? (
            <p className="mt-4 text-stone-500">No hay expediciones publicadas por ahora.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {expeditions.map((e) => (
                <ExpeditionCard key={e.slug} expedition={e} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <Link href="/destinos" className="text-sm font-semibold text-accent hover:text-accent-dark">
            ← Todos los destinos
          </Link>
        </div>
      </div>
    </>
  );
}
