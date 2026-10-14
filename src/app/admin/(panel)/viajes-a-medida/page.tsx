import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site";
import { getCustomTripContent } from "@/lib/page-content";
import { CustomTripForm } from "@/components/admin/CustomTripForm";
import { CUSTOM_TRIP_PATH } from "@/lib/trip-categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Viajes a Medida" };

export default async function CustomTripAdminPage() {
  await requirePermission(PERMISSIONS.PAGE_MANAGE);
  const [{ stored }, settings] = await Promise.all([getCustomTripContent(), getSiteSettings()]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Viajes a Medida</h1>
          <p className="mt-1 text-stone-500">
            Página propia para consultas de viajes diseñados a pedido. No forma parte del catálogo.
          </p>
        </div>
        <Link
          href={CUSTOM_TRIP_PATH}
          target="_blank"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Ver la página ↗
        </Link>
      </div>
      <div className="mt-8">
        <CustomTripForm stored={stored} hasWhatsapp={!!settings.whatsappNumber} />
      </div>
    </div>
  );
}
