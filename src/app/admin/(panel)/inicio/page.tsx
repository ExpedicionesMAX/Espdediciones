import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { getAboutPageFallback, getHomeContent } from "@/lib/page-content";
import { publicExpeditionWhere } from "@/lib/expeditions-query";
import { tripCover } from "@/lib/media";
import { HomeContentForm, type TripOption } from "@/components/admin/HomeContentForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inicio (Nosotros)" };

export default async function HomeContentPage() {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const [{ stored }, settings, about, trips, visible] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getAboutPageFallback(),
    // Todos los viajes (también borradores), para elegir cuáles van en el inicio.
    prisma.expedition.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, category: true, coverImage: true, gallery: true },
    }),
    prisma.expedition.findMany({ where: publicExpeditionWhere(), select: { id: true } }),
  ]);
  const visibleIds = new Set(visible.map((v) => v.id));
  const tripOptions: TripOption[] = trips.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    cover: tripCover(t),
    published: visibleIds.has(t.id),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Inicio (Nosotros)</h1>
          <p className="mt-1 text-stone-500">
            La página principal presenta el proyecto: quiénes son, su historia y su filosofía, y
            después invita a descubrir los viajes.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Ver el inicio ↗
        </Link>
      </div>
      <div className="mt-8">
        <HomeContentForm
          stored={stored}
          siteName={settings.siteName}
          aboutPageText={about?.content ?? ""}
          tripOptions={tripOptions}
        />
      </div>
    </div>
  );
}
