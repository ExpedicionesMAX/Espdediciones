"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CATALOG_CATEGORIES, CUSTOM_TRIP_PATH, catalogHref } from "@/lib/trip-categories";

// Nuestros Viajes: el catálogo completo y sus tres categorías (Viajes a Medida va aparte).
const VIAJES = [
  { href: catalogHref(null), label: "Todos nuestros viajes", key: null as string | null },
  ...CATALOG_CATEGORIES.map((c) => ({ href: catalogHref(c.key), label: c.label, key: c.key as string | null })),
];

export function SiteHeader(props: {
  siteName: string;
  logoUrl?: string | null;
  pages?: { slug: string; title: string }[];
}) {
  // useSearchParams requiere un Suspense para no forzar render dinámico de todo el árbol.
  return (
    <Suspense fallback={<HeaderInner {...props} categoria={null} />}>
      <HeaderWithParams {...props} />
    </Suspense>
  );
}

function HeaderWithParams(props: {
  siteName: string;
  logoUrl?: string | null;
  pages?: { slug: string; title: string }[];
}) {
  const categoria = useSearchParams().get("categoria");
  return <HeaderInner {...props} categoria={categoria} />;
}

function HeaderInner({
  siteName,
  logoUrl,
  pages = [],
  categoria,
}: {
  siteName: string;
  logoUrl?: string | null;
  pages?: { slug: string; title: string }[];
  categoria: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [viajesOpen, setViajesOpen] = useState(false);
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);

  // Al cambiar de página se cierran los menús (ajuste de estado durante el render, sin efecto).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setViajesOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setViajesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViajesOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const solid = scrolled || open;
  const viajesActive = pathname === "/expediciones" || pathname.startsWith("/expediciones/");
  const closeAll = () => {
    setOpen(false);
    setViajesOpen(false);
  };

  const desktopLink = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className="nav-underline text-sm font-medium"
    >
      {label}
    </Link>
  );

  const mobileLink = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      onClick={closeAll}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100",
        active && "text-accent",
      )}
    >
      {label}
    </Link>
  );

  // Sobre la foto (header transparente) el badge va claro para mantener el contraste.
  const badge = (onPhoto: boolean) => (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        onPhoto ? "bg-white/20 text-white" : "bg-accent/15 text-accent",
      )}
    >
      Próximamente
    </span>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 print:hidden",
        solid
          ? "bg-paper/90 text-ink border-b border-stone-200 backdrop-blur"
          : "bg-transparent text-white",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0 font-display text-xl font-semibold tracking-tight" onClick={closeAll}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            siteName
          )}
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {desktopLink("/", "Nosotros", pathname === "/")}

          {/* Nuestros Viajes + desplegable */}
          <div
            ref={dropRef}
            className="relative"
            onMouseEnter={() => setViajesOpen(true)}
            onMouseLeave={() => setViajesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setViajesOpen((v) => !v)}
              aria-expanded={viajesOpen}
              aria-controls="menu-viajes"
              className={cn(
                "nav-underline flex items-center gap-1 text-sm font-medium",
                viajesActive && "nav-active",
              )}
            >
              Nuestros Viajes
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
                className={cn("transition-transform", viajesOpen && "rotate-180")}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {viajesOpen && (
              <div id="menu-viajes" className="absolute left-0 top-full min-w-64 pt-3">
                <ul className="overflow-hidden rounded-xl border border-stone-200 bg-paper py-1 text-ink shadow-lg">
                  {VIAJES.map((s, i) => {
                    const active = pathname === "/expediciones" && (categoria ?? null) === s.key;
                    return (
                      <li key={s.href} className={i === 0 ? "border-b border-stone-200" : undefined}>
                        <Link
                          href={s.href}
                          onClick={closeAll}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block px-4 py-2.5 text-sm font-medium hover:bg-stone-100",
                            active && "text-accent",
                          )}
                        >
                          {s.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {desktopLink(CUSTOM_TRIP_PATH, "Viajes a Medida", pathname === CUSTOM_TRIP_PATH)}

          {/* Nuestros Productos — Próximamente */}
          <Link
            href="/productos"
            aria-current={pathname === "/productos" ? "page" : undefined}
            className="nav-underline flex items-center gap-2 text-sm font-medium"
          >
            Nuestros Productos
            {badge(!solid)}
          </Link>

          {pages.map((p) => desktopLink(`/${p.slug}`, p.title, pathname === `/${p.slug}`))}

          {desktopLink("/#contacto", "Contacto", false)}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu-movil"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="menu-movil"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-stone-200 bg-paper px-4 pb-6 pt-2 text-ink lg:hidden"
        >
          <nav aria-label="Principal" className="flex flex-col gap-1">
            {mobileLink("/", "Nosotros", pathname === "/")}
            <p className="px-2 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
              Nuestros Viajes
            </p>
            {VIAJES.map((s) => {
              const active = pathname === "/expediciones" && (categoria ?? null) === s.key;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={closeAll}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-stone-100",
                    active ? "text-accent" : "text-stone-600",
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-stone-200" />
            {mobileLink(CUSTOM_TRIP_PATH, "Viajes a Medida", pathname === CUSTOM_TRIP_PATH)}
            <Link
              href="/productos"
              onClick={closeAll}
              className="flex items-center gap-2 rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
            >
              Nuestros Productos
              {badge(false)}
            </Link>
            {pages.map((p) => mobileLink(`/${p.slug}`, p.title, pathname === `/${p.slug}`))}
            {mobileLink("/#contacto", "Contacto", false)}
          </nav>
        </div>
      )}
    </header>
  );
}
