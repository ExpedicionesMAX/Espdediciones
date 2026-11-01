import "server-only";
import { getSiteSettings } from "@/lib/site";

/**
 * Datos comunes de la vista previa al compartir (WhatsApp, redes). Next
 * reemplaza el `openGraph` del layout por el de cada página, así que cada
 * página los agrega con `...(await siteOpenGraph())`.
 */
export async function siteOpenGraph() {
  const s = await getSiteSettings();
  return { siteName: s.siteName, locale: "es_AR", type: "website" as const };
}
