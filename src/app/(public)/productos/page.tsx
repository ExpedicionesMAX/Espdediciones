import Link from "next/link";

export const metadata = {
  title: "Nuestros Productos",
  description: "Muy pronto vas a poder ver nuestros productos.",
};

export default function ProductosPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
      <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        Próximamente
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Nuestros Productos
      </h1>
      <p className="mt-4 max-w-xl text-stone-600">
        Estamos preparando esta sección. Muy pronto vas a poder conocer los productos de Cumbre.
      </p>
      <Link
        href="/expediciones"
        className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Mientras tanto, mirá nuestros viajes
      </Link>
    </section>
  );
}
