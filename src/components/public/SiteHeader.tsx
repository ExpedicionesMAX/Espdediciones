"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const VIAJES = [
  { href: "/expediciones", label: "Expediciones Fotográficas" },
  { href: "/expediciones?categoria=coleccionable", label: "Viajes Coleccionables" },
  { href: "/expediciones?categoria=escapada", label: "Escapadas" },
  { href: "/expediciones?categoria=a-medida", label: "Viajes a Medida" },
];

export function SiteHeader({
  siteName,
  logoUrl,
  pages = [],
}: {
  siteName: string;
  logoUrl?: string | null;
  pages?: { slug: string; title: string }[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [viajesOpen, setViajesOpen] = useState(false);
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setViajesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setViajesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const solid = scrolled || open;
  const viajesActive = pathname.startsWith("/expediciones");

  // Sobre Nosotros va antes del menú; el resto (FAQ, etc.) después.
  const beforePages = pages.filter((p) => /sobre|nosotros/i.test(p.title));
  const afterPages = pages.filter((p) => !/sobre|nosotros/i.test(p.title));

  const pageLink = (p: { slug: string; title: string }, mobile = false) => (
    <Link
      key={p.slug}
      href={`/${p.slug}`}
      className={
        mobile
          ? "rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
          : cn("nav-underline text-sm font-medium", pathname === `/${p.slug}` && "text-accent")
      }
    >
      {p.title}
    </Link>
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            siteName
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {beforePages.map((p) => pageLink(p))}

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
              className={cn(
                "nav-underline flex items-center gap-1 text-sm font-medium",
                viajesActive && "text-accent",
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
                className={cn("transition-transform", viajesOpen && "rotate-180")}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {viajesOpen && (
              <div className="absolute left-0 top-full min-w-60 pt-3">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-paper py-1 text-ink shadow-lg">
                  {VIAJES.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-stone-100"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nuestros Productos — Próximamente */}
          <Link
            href="/productos"
            className="nav-underline flex items-center gap-2 text-sm font-medium"
          >
            Nuestros Productos
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Próximamente
            </span>
          </Link>

          {afterPages.map((p) => pageLink(p))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-paper px-4 pb-6 pt-2 text-ink md:hidden">
          <nav className="flex flex-col gap-1">
            {beforePages.map((p) => pageLink(p, true))}
            <p className="px-2 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
              Nuestros Viajes
            </p>
            {VIAJES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                {s.label}
              </Link>
            ))}
            <Link
              href="/productos"
              className="flex items-center gap-2 rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
            >
              Nuestros Productos
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Próximamente
              </span>
            </Link>
            {afterPages.map((p) => pageLink(p, true))}
          </nav>
        </div>
      )}
    </header>
  );
}
