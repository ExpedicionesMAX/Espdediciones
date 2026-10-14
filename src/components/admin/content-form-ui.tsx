"use client";

/**
 * Piezas compartidas de los editores de contenido (Inicio y Viajes a Medida).
 * Convención: el valor vacío usa el texto por defecto, que se ve como sugerencia
 * (placeholder) y se marca «Provisional» para que se note qué falta completar.
 */

export const labelCls = "mb-1 flex flex-wrap items-center gap-2 text-sm font-medium text-ink";
export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ProvisionalBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
      Provisional
    </span>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  rows = 3,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const provisional = !value && !!placeholder;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
        {provisional && <ProvisionalBadge />}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={inputCls}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

/** Lista editable: agregar, quitar y reordenar elementos. */
export function ListEditor<T>({
  items,
  onChange,
  newItem,
  addLabel,
  max,
  emptyText,
  renderItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  addLabel: string;
  max: number;
  emptyText: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const update = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-stone-400">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-stone-200 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-400">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-stone-400 hover:text-ink disabled:opacity-30" aria-label="Subir">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1.5 text-stone-400 hover:text-ink disabled:opacity-30" aria-label="Bajar">↓</button>
              <button type="button" onClick={() => remove(i)} className="px-1.5 text-red-500 hover:text-red-700" aria-label="Eliminar">✕</button>
            </div>
          </div>
          {renderItem(item, (patch) => update(i, patch), i)}
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, newItem()])}
          className="rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:border-accent hover:text-accent"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}

/** Indicador «Cambios sin guardar» para las barras de guardado. */
export function UnsavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-2 text-xs font-medium text-amber-700" aria-live="polite">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
      Cambios sin guardar
    </span>
  );
}

/** Barra de guardado con mensajes de resultado. */
export function SaveBar({
  pending,
  success,
  error,
  label,
  dirty = false,
}: {
  pending: boolean;
  success?: boolean;
  error?: string;
  label: string;
  dirty?: boolean;
}) {
  return (
    <div className="space-y-3" aria-live="polite">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {/* El éxito se muestra solo cuando el servidor lo confirmó y no hubo cambios después. */}
      {success && !dirty && !pending && (
        <p className="rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          Guardado. Los cambios ya se ven en el sitio.
        </p>
      )}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        {dirty ? (
          <p className="flex items-center gap-2 text-xs font-medium text-amber-700">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
            Cambios sin guardar
          </p>
        ) : (
          <p className="text-xs text-stone-400">Vacío = usa el texto sugerido (marcado «Provisional»).</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : label}
        </button>
      </div>
    </div>
  );
}
