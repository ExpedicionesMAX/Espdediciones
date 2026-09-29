"use client";

import { useRef } from "react";

export type Review = {
  id: string;
  authorName: string;
  text: string;
  photo: string | null;
  rating: number | null;
  expeditionName: string | null;
};

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 360), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="w-[85%] flex-none snap-start rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:w-[360px]"
          >
            {r.rating ? (
              <p className="text-accent">
                {"★".repeat(r.rating)}
                <span className="text-stone-300">{"★".repeat(5 - r.rating)}</span>
              </p>
            ) : null}
            <blockquote className="mt-3 text-stone-700">“{r.text}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt={r.authorName} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 font-display text-lg font-semibold text-accent">
                  {r.authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-ink">{r.authorName}</p>
                {r.expeditionName && (
                  <p className="text-xs text-stone-500">{r.expeditionName}</p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {reviews.length > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-ink transition-colors hover:bg-stone-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-ink transition-colors hover:bg-stone-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
