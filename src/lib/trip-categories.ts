/**
 * Categorías del catálogo «Nuestros Viajes».
 *
 * `Expedition.category` admite además "a-medida" (compatibilidad con datos
 * anteriores), pero Viajes a Medida NO es una categoría del catálogo: tiene su
 * propia página en /viajes-a-medida y nunca aparece como filtro.
 */
export const CATALOG_CATEGORIES = [
  { key: "fotografica", label: "Expediciones Fotográficas" },
  { key: "escapada", label: "Escapadas" },
  { key: "coleccionable", label: "Viajes Coleccionables" },
] as const;

export type CatalogCategoryKey = (typeof CATALOG_CATEGORIES)[number]["key"];

export const CATALOG_CATEGORY_KEYS: CatalogCategoryKey[] = CATALOG_CATEGORIES.map((c) => c.key);

export function isCatalogCategory(value: unknown): value is CatalogCategoryKey {
  return typeof value === "string" && (CATALOG_CATEGORY_KEYS as string[]).includes(value);
}

export function categoryLabel(key: string | null | undefined): string | null {
  return CATALOG_CATEGORIES.find((c) => c.key === key)?.label ?? null;
}

/** URL del catálogo filtrado por categoría (sin categoría = todos los viajes). */
export function catalogHref(key?: CatalogCategoryKey | null): string {
  return key ? `/expediciones?categoria=${key}` : "/expediciones";
}

export const CUSTOM_TRIP_PATH = "/viajes-a-medida";
