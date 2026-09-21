import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-white">
      <p className="font-display text-6xl font-semibold">404</p>
      <p className="mt-4 text-lg text-stone-300">
        No encontramos lo que buscabas.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
