/** Estado de carga del catálogo (mientras el servidor filtra los viajes). */
export default function CatalogLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando viajes…</span>
      <section className="bg-ink px-4 pb-10 pt-32 sm:px-6 sm:pb-12 sm:pt-36">
        <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
          <div className="h-12 w-72 max-w-full rounded-lg bg-white/10 sm:h-16 sm:w-[28rem]" />
          <div className="mt-6 h-5 w-96 max-w-full rounded bg-white/10" />
          <div className="mt-10 flex gap-2.5 overflow-hidden">
            {[20, 52, 28, 48].map((w, i) => (
              <div key={i} className="h-10 shrink-0 rounded-full bg-white/10" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="h-7 w-48 rounded bg-stone-200" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-stone-200" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
