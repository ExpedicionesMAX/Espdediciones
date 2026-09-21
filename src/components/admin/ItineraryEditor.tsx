"use client";

import { useState } from "react";

export type ItineraryDayValue = {
  title: string;
  description?: string;
  distanceKm?: string;
  elevationGain?: string;
  altitude?: string;
  accommodation?: string;
};

const cell =
  "w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-accent focus:outline-none";

export function ItineraryEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: ItineraryDayValue[];
}) {
  const [days, setDays] = useState<ItineraryDayValue[]>(
    defaultValue && defaultValue.length ? defaultValue : [],
  );

  const update = (i: number, patch: Partial<ItineraryDayValue>) =>
    setDays((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const add = () => setDays((ds) => [...ds, { title: "" }]);
  const remove = (i: number) =>
    setDays((ds) => ds.filter((_, idx) => idx !== i));

  const serialized = JSON.stringify(
    days
      .filter((d) => d.title.trim())
      .map((d, idx) => ({
        dayNumber: idx + 1,
        title: d.title,
        description: d.description || undefined,
        distanceKm: d.distanceKm || undefined,
        elevationGain: d.elevationGain || undefined,
        altitude: d.altitude || undefined,
        accommodation: d.accommodation || undefined,
      })),
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      {days.length === 0 && (
        <p className="text-sm text-stone-500">Todavía no agregaste días.</p>
      )}

      {days.map((d, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-accent">Día {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Quitar
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Título del día"
              value={d.title}
              onChange={(e) => update(i, { title: e.target.value })}
              className={cell + " sm:col-span-2"}
            />
            <textarea
              placeholder="Descripción"
              value={d.description ?? ""}
              onChange={(e) => update(i, { description: e.target.value })}
              rows={2}
              className={cell + " sm:col-span-2"}
            />
            <input
              placeholder="Distancia (km)"
              inputMode="decimal"
              value={d.distanceKm ?? ""}
              onChange={(e) => update(i, { distanceKm: e.target.value })}
              className={cell}
            />
            <input
              placeholder="Desnivel (m)"
              inputMode="numeric"
              value={d.elevationGain ?? ""}
              onChange={(e) => update(i, { elevationGain: e.target.value })}
              className={cell}
            />
            <input
              placeholder="Altitud (m)"
              inputMode="numeric"
              value={d.altitude ?? ""}
              onChange={(e) => update(i, { altitude: e.target.value })}
              className={cell}
            />
            <input
              placeholder="Alojamiento"
              value={d.accommodation ?? ""}
              onChange={(e) => update(i, { accommodation: e.target.value })}
              className={cell}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:border-accent hover:text-accent"
      >
        + Agregar día
      </button>
    </div>
  );
}
