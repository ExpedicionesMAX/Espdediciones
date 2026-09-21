import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { getSiteTexts } from "@/lib/site-texts";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Guías",
  description: "El equipo que lidera nuestras expediciones.",
};

export default async function GuidesIndexPage() {
  const texts = await getSiteTexts();
  const guides = await prisma.guide.findMany({
    where: {
      OR: [
        { ledExpeditions: { some: publicExpeditionWhere() } },
        { expeditions: { some: publicExpeditionWhere() } },
      ],
    },
    orderBy: { name: "asc" },
    select: { slug: true, name: true, photo: true, specialties: true, bio: true },
  });

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{texts.guiasTitle}</h1>
          <p className="mt-3 max-w-xl text-stone-300">{texts.guiasSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {guides.length === 0 ? (
          <p className="py-20 text-center text-stone-500">
            Todavía no hay guías con expediciones publicadas.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <Link key={g.slug} href={`/guias/${g.slug}`} className="group text-center">
                <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full bg-stone-200">
                  {g.photo && (
                    <Image
                      src={g.photo}
                      alt={g.name}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-ink">{g.name}</h2>
                {g.specialties.length > 0 && (
                  <p className="mt-1 text-sm text-accent">{g.specialties.join(" · ")}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
