import Link from "next/link";
import type { SiteSettingsData } from "@/lib/site";

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
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
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
              <Link href="/expediciones" className="hover:text-white">
                Expediciones
              </Link>
            </li>
            <li>
              <Link href="/destinos" className="hover:text-white">
                Destinos
              </Link>
            </li>
            <li>
              <Link href="/guias" className="hover:text-white">
                Guías
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Contacto
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {settings.contactEmail && (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && <li>{settings.contactPhone}</li>}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
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
