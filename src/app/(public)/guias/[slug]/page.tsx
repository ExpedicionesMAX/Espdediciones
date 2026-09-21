import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { ExpeditionCard } from "@/components/public/ExpeditionCard";

export const dynamic = "force-dynamic";

type Social = { instagram?: string; youtube?: string; facebook?: string; website?: string };

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  website: "Sitio web",
};

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
  const g = await prisma.guide.findUnique({
    where: { slug },
    select: { name: true, bio: true, photo: true },
  });
  if (!g) return { title: "Guía no encontrado" };
  return {
    title: g.name,
    description: g.bio ?? `Perfil de ${g.name}, guía de expediciones.`,
    openGraph: {
      title: g.name,
      description: g.bio ?? undefined,
      images: g.photo ? [{ url: g.photo }] : undefined,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide) notFound();

  const expeditions = await prisma.expedition.findMany({
    where: publicExpeditionWhere({
      OR: [{ leadGuideId: guide.id }, { guides: { some: { id: guide.id } } }],
    }),
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    select: cardSelect,
  });

  const social = (guide.social as Social | null) ?? {};
  const socialLinks = Object.entries(social).filter(([, v]) => !!v);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6">
      <Link href="/guias" className="text-sm font-medium text-accent hover:text-accent-dark">
        ← Guías
      </Link>

      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <div className="relative aspect-square w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-200">
          {guide.photo && (
            <Image src={guide.photo} alt={guide.name} fill sizes="176px" className="object-cover" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-4xl font-semibold text-ink">{guide.name}</h1>
          {guide.specialties.length > 0 && (
            <p className="mt-2 text-accent">{guide.specialties.join(" · ")}</p>
          )}
          {guide.bio && <p className="rich-text mt-4 text-stone-700">{guide.bio}</p>}

          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
            {guide.languages.length > 0 && (
              <p className="text-stone-600">
                <span className="font-medium text-ink">Idiomas:</span>{" "}
                {guide.languages.join(", ")}
              </p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
              {socialLinks.map(([key, url]) => (
                <li key={key}>
                  <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(guide.experience || guide.certifications.length > 0) && (
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {guide.experience && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Experiencia</h2>
              <p className="rich-text mt-3 text-stone-700">{guide.experience}</p>
            </div>
          )}
          {guide.certifications.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Certificaciones</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-stone-700">
                {guide.certifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {expeditions.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">Sus expediciones</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expeditions.map((e) => (
              <ExpeditionCard key={e.slug} expedition={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
