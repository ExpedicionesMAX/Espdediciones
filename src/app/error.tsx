"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción, acá se podría enviar el error a un servicio de monitoreo.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-white">
      <p className="font-display text-5xl font-semibold">Algo salió mal</p>
      <p className="mt-4 max-w-md text-stone-300">
        Tuvimos un problema para mostrar esta página. Podés reintentar o volver al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
