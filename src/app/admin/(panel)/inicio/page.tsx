import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site";
import { getAboutPageFallback, getHomeContent } from "@/lib/page-content";
import { HomeContentForm } from "@/components/admin/HomeContentForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inicio (Nosotros)" };

export default async function HomeContentPage() {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const [{ stored }, settings, about] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getAboutPageFallback(),
  ]);

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
        <HomeContentForm stored={stored} siteName={settings.siteName} aboutPageText={about?.content ?? ""} />
      </div>
    </div>
  );
}
