"use client";

import { useState } from "react";
import { CATALOG_CATEGORIES, categoryLabel } from "@/lib/trip-categories";
import { MAX_HOME_TRIPS } from "@/lib/home-content";

export type TripOption = {
  id: string;
  name: string;
  category: string;
  cover: string | null;
  /** Publicado y visible hoy en el sitio. */
  published: boolean;
};

/**
 * Elegir qué viajes se muestran en «Nuestros Viajes» del inicio: interruptor
 * por viaje, filtro por categoría y orden con flechas. Sin elegidos = automático.
 */
export function TripPicker({
  options,
  selectedIds,
  onChange,
}: {
  options: TripOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  // Ids guardados que ya no existen (viaje borrado) se ignoran.
  const selected = selectedIds.filter((id) => options.some((o) => o.id === id));
  const full = selected.length >= MAX_HOME_TRIPS;

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : full ? selected : [...selected, id]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= selected.length) return;
    const next = [...selected];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const list = options.filter((o) => filter === "all" || o.category === filter);
  const badge = (o: TripOption) => categoryLabel(o.category) ?? "Viaje a medida";

  const Thumb = ({ o }: { o: TripOption }) =>
    o.cover ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={o.cover} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
    ) : (
      <span className="h-12 w-16 shrink-0 rounded-md bg-stone-200" />
    );

  return (
    <div className="space-y-5">
      {/* Elegidos, en orden */}
      <div>
        <p className="text-sm font-medium text-ink">
          Se muestran en el inicio {selected.length > 0 && <span className="text-stone-400">({selected.length})</span>}
        </p>
        {selected.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-stone-300 p-3 text-sm text-stone-500">
            Ninguno elegido: se muestran <strong>automáticamente</strong> hasta 3 viajes (los marcados
            como destacados o, si no hay, los primeros publicados). Prendé los que quieras abajo.
          </p>
        ) : (
          <ol className="mt-2 space-y-2">
            {selected.map((id, i) => {
              const o = options.find((x) => x.id === id)!;
              return (
                <li key={id} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2">
                  <span className="w-5 text-center text-xs font-semibold text-stone-400">{i + 1}</span>
                  <Thumb o={o} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{o.name}</span>
                    <span className="block text-xs text-stone-500">
                      {badge(o)}
                      {!o.published && <span className="text-amber-700"> · Borrador: no se ve hasta publicarlo</span>}
                    </span>
                  </span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Subir ${o.name}`}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="px-1.5 text-stone-500 hover:text-ink disabled:opacity-30" aria-label={`Bajar ${o.name}`}>↓</button>
                  <button type="button" onClick={() => toggle(id)} className="px-1.5 text-sm font-medium text-red-600 hover:text-red-700" aria-label={`Quitar ${o.name} del inicio`}>✕</button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Todos los viajes */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Todos tus viajes</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
            {[["all", "Todos"] as const, ...CATALOG_CATEGORIES.map((c) => [c.key, c.label] as const)].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filter === key ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-stone-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">No hay viajes en esta categoría.</p>
        ) : (
          <ul className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
            {list.map((o) => {
              const on = selected.includes(o.id);
              return (
                <li key={o.id} className="flex items-center gap-3 p-2">
                  <Thumb o={o} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{o.name}</span>
                    <span className="block text-xs text-stone-500">
                      {badge(o)}
                      {!o.published && <span className="text-amber-700"> · Borrador</span>}
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`Mostrar ${o.name} en el inicio`}
                    onClick={() => toggle(o.id)}
                    disabled={!on && full}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${on ? "bg-accent" : "bg-stone-300"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {full && (
          <p className="mt-2 text-xs text-amber-700">Llegaste al máximo de {MAX_HOME_TRIPS} viajes en el inicio.</p>
        )}
      </div>
    </div>
  );
}
