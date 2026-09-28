"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const EXPEDICIONES = { href: "/expediciones", label: "Expediciones Fotográficas" };

const SUBCATS = [
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
  const [expOpen, setExpOpen] = useState(false);
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
    setExpOpen(false);
  }, [pathname]);

  // Cerrar el desplegable al hacer clic fuera.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setExpOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const solid = scrolled || open;
  const expActive = pathname === "/expediciones" || pathname.startsWith("/expediciones");

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
          <Link
            href="/"
            className={cn("nav-underline text-sm font-medium", pathname === "/" && "text-accent")}
          >
            Inicio
          </Link>

          {/* Expediciones Fotográficas + desplegable */}
          <div
            ref={dropRef}
            className="relative"
            onMouseEnter={() => setExpOpen(true)}
            onMouseLeave={() => setExpOpen(false)}
          >
            <div className="flex items-center gap-1">
              <Link
                href={EXPEDICIONES.href}
                className={cn("nav-underline text-sm font-medium", expActive && "text-accent")}
              >
                {EXPEDICIONES.label}
              </Link>
              <button
                type="button"
                onClick={() => setExpOpen((v) => !v)}
                aria-label="Ver categorías"
                aria-expanded={expOpen}
                className="p-0.5"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className={cn("transition-transform", expOpen && "rotate-180")}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {expOpen && (
              <div className="absolute left-0 top-full min-w-56 pt-3">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-paper py-1 text-ink shadow-lg">
                  {SUBCATS.map((s) => (
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

          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className={cn(
                "nav-underline text-sm font-medium",
                pathname === `/${p.slug}` && "text-accent",
              )}
            >
              {p.title}
            </Link>
          ))}
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
            <Link href="/" className="rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100">
              Inicio
            </Link>
            <Link
              href={EXPEDICIONES.href}
              className="rounded-lg px-2 py-3 text-base font-medium hover:bg-stone-100"
            >
              {EXPEDICIONES.label}
            </Link>
            {SUBCATS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                {s.label}
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
