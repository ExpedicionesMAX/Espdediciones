"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/expediciones", label: "Expediciones" },
  { href: "/fechas", label: "Fechas" },
  { href: "/destinos", label: "Destinos" },
  { href: "/guias", label: "Guías" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/contacto", label: "Contacto" },
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
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

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
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            siteName
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-opacity hover:opacity-70",
                pathname === l.href && "underline decoration-accent decoration-2 underline-offset-8",
              )}
            >
              {l.label}
            </Link>
          ))}
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="text-sm font-medium transition-opacity hover:opacity-70"
            >
              {p.title}
            </Link>
          ))}
          <Link
            href="/expediciones"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Ver expediciones
          </Link>
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
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
              >
                {l.label}
              </Link>
            ))}
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
              >
                {p.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
