"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type CalendarExpedition = {
  slug: string;
  name: string;
  subtitle: string | null;
  coverImage: string | null;
  durationDays: number | null;
  availableMonths: number[];
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function MonthCalendar({ expeditions }: { expeditions: CalendarExpedition[] }) {
  const now = new Date().getMonth() + 1; // 1-12
  const [month, setMonth] = useState(now);

  const forMonth = expeditions.filter((e) => e.availableMonths.includes(month));

  return (
    <div>
      {/* Selector de meses */}
      <div className="flex flex-wrap gap-2">
        {MONTHS.map((label, i) => {
          const m = i + 1;
          const has = expeditions.some((e) => e.availableMonths.includes(m));
          const active = m === month;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMonth(m)}
              className={[
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-white"
                  : has
                    ? "bg-white text-ink ring-1 ring-stone-200 hover:ring-accent"
                    : "bg-white/60 text-stone-400 ring-1 ring-stone-100",
              ].join(" ")}
            >
              <span className="sm:hidden">{MONTHS_SHORT[i]}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Viajes disponibles ese mes */}
      <div className="mt-8">
        {forMonth.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-14 text-center text-stone-500">
            No hay viajes programados para {MONTHS[month - 1]}. Probá con otro mes.
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forMonth.map((e) => (
              <li
                key={e.slug}
                className="card-lift group overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                  {e.coverImage && (
                    <Image
                      src={e.coverImage}
                      alt={e.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-ink">{e.name}</h3>
                  {e.subtitle && (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">{e.subtitle}</p>
                  )}
                  {e.durationDays ? (
                    <p className="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                      {e.durationDays} días
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <Link
                      href={`/expediciones/${e.slug}`}
                      className="inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                    >
                      Quiero saber más
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
