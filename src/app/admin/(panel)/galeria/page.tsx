import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galería Fotográfica" };

export default async function GalleryAdminPage() {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      url: true,
      width: true,
      height: true,
      title: true,
      description: true,
      alt: true,
      published: true,
      order: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Galería Fotográfica</h1>
          <p className="mt-1 max-w-2xl text-stone-500">
            Fotos propias para la página Galería. Las fotos nuevas entran como <strong>borrador</strong>:
            no se ven en el sitio hasta que las publicás. Es independiente de las fotos de cada viaje y de
            «Nuestra historia».
          </p>
        </div>
        <Link
          href="/galeria"
          target="_blank"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Ver la galería ↗
        </Link>
      </div>
      <div className="mt-8">
        <GalleryManager initial={photos} />
      </div>
    </div>
  );
}
