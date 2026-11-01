import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Datos para «Agregar a la pantalla de inicio» en el celular: nombre e ícono
 * del sitio (los de Configuración).
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSiteSettings();
  const icon = s.faviconUrl || s.logoUrl;
  return {
    name: s.siteName,
    short_name: s.siteName,
    description: s.tagline ?? undefined,
    start_url: "/",
    display: "browser",
    background_color: "#faf9f7",
    theme_color: "#1c1917",
    lang: "es-AR",
    // El ícono creado en el panel es un PNG de 512×512; el logo puede tener otra medida.
    icons: icon ? [{ src: icon, sizes: s.faviconUrl ? "512x512" : "any", purpose: "any" }] : [],
  };
}
