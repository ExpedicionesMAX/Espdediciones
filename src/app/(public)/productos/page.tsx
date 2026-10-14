import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nuestros Productos",
  description: "Muy pronto vas a poder ver nuestros productos.",
  // Página provisoria sin contenido propio: que los buscadores no la indexen todavía.
  robots: { index: false, follow: true },
};

export default async function ProductosPage() {
  const settings = await getSiteSettings();
  return (
    // Fondo oscuro arriba: el menú es transparente con texto blanco hasta que se hace scroll.
    <section className="bg-ink px-4 pb-24 pt-36 text-center text-white sm:px-6 sm:pb-32 sm:pt-44">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Próximamente
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">Nuestros Productos</h1>
        <p className="mt-4 max-w-xl text-stone-300">
          Estamos preparando esta sección. Muy pronto vas a poder conocer los productos de{" "}
          {settings.siteName}.
        </p>
        <Link
          href="/expediciones"
          className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Mientras tanto, mirá nuestros viajes
        </Link>
      </div>
    </section>
  );
}
