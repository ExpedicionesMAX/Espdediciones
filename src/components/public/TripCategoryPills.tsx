import Link from "next/link";
import { cn } from "@/lib/cn";
import { CATALOG_CATEGORIES, catalogHref, type CatalogCategoryKey } from "@/lib/trip-categories";

/**
 * Filtros del catálogo como enlaces reales (?categoria=…): funcionan sin JS,
 * se pueden compartir y el servidor filtra con los datos de la base.
 * El filtro activo se marca con aria-current. Volver a tocar el activo lo deja
 * igual (comportamiento predecible); «Todos» quita el filtro.
 */
export function TripCategoryPills({
  active,
  allLabel,
}: {
  active: CatalogCategoryKey | null;
  allLabel: string;
}) {
  const pill = (isActive: boolean) =>
    cn(
      "inline-flex shrink-0 snap-start items-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-paper text-ink"
        : "text-stone-200 ring-1 ring-inset ring-white/25 hover:bg-white/10 hover:text-white",
    );

  return (
    <nav aria-label="Categorías de viajes" className="-mx-4 sm:mx-0">
      <ul className="no-scrollbar flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0">
        <li className="flex shrink-0 items-center">
          <Link
            href={catalogHref(null)}
            aria-current={active === null ? "page" : undefined}
            className={pill(active === null)}
            scroll={false}
          >
            {allLabel}
          </Link>
          <span aria-hidden="true" className="ml-2.5 h-5 w-px bg-white/20" />
        </li>
        {CATALOG_CATEGORIES.map((c) => (
          <li key={c.key} className="shrink-0">
            <Link
              href={catalogHref(c.key)}
              aria-current={active === c.key ? "page" : undefined}
              className={pill(active === c.key)}
              scroll={false}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
