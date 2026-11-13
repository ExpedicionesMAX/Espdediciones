import Link from "next/link";
import type { SiteSettingsData } from "@/lib/site";
import { CATALOG_CATEGORIES, CUSTOM_TRIP_PATH, catalogHref } from "@/lib/trip-categories";
import { SOCIAL_ICON_PATHS } from "@/components/public/social-icons";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  vimeo: "Vimeo",
};

export function SiteFooter({ settings }: { settings: SiteSettingsData }) {
  const socials = Object.entries(settings.social ?? {}).filter(
    ([, url]) => !!url,
  );

  return (
    <footer className="bg-ink text-stone-300 print:hidden">
      {/* En pantallas grandes, Contacto ocupa dos columnas para que el email entre en un renglón. */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-semibold text-white">
            {settings.siteName}
          </p>
          {settings.tagline && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
              {settings.tagline}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Explorar
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href={catalogHref(null)} className="hover:text-white">
                Nuestros Viajes
              </Link>
            </li>
            {CATALOG_CATEGORIES.map((c) => (
              <li key={c.key} className="pl-3">
                <Link href={catalogHref(c.key)} className="text-stone-400 hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/galeria" className="hover:text-white">
                Galería Fotográfica
              </Link>
            </li>
            <li>
              <Link href={CUSTOM_TRIP_PATH} className="hover:text-white">
                Viajes a Medida
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Contacto
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {settings.contactEmail && (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="[overflow-wrap:anywhere] hover:text-white">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && <li>{settings.contactPhone}</li>}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-3">
              {socials.map(([key, url]) => {
                const label = SOCIAL_LABELS[key] ?? key;
                const icon = SOCIAL_ICON_PATHS[key];
                return (
                  <li key={key}>
                    <a
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      {icon ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                          <path d={icon} />
                        </svg>
                      ) : (
                        // Red sin ícono: su inicial
                        <span className="text-sm font-semibold">{label.charAt(0).toUpperCase()}</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. Todos los derechos
            reservados.
          </p>
          <Link href="/admin" className="hover:text-stone-300">
            Panel de administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
