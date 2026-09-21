import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicExpeditionWhere } from "@/lib/expeditions-query";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Destinos",
  description: "Los territorios donde operamos nuestras expediciones.",
};

export default async function DestinationsIndexPage() {
  const destinations = await prisma.destination.findMany({
    where: { expeditions: { some: publicExpeditionWhere() } },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      country: true,
      region: true,
      coverImage: true,
      _count: {
        select: { expeditions: { where: publicExpeditionWhere() } },
      },
    },
  });

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Destinos</h1>
          <p className="mt-3 max-w-xl text-stone-300">
            Los territorios donde caminamos, escalamos y fotografiamos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {destinations.length === 0 ? (
          <p className="py-20 text-center text-stone-500">
            Todavía no hay destinos con expediciones publicadas.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinos/${d.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900"
              >
                {d.coverImage && (
                  <Image
                    src={d.coverImage}
                    alt={d.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-wider text-stone-300">
                    {d.country}
                    {d.region ? ` · ${d.region}` : ""}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{d.name}</h2>
                  <p className="mt-2 text-sm text-stone-300">
                    {d._count.expeditions} expedición
                    {d._count.expeditions === 1 ? "" : "es"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
