"use client";

import { useActionState } from "react";
import { updateTexts, type TextsFormState } from "@/server/actions/texts";
import { SITE_TEXTS, type TextField } from "@/lib/site-texts-schema";

const initial: TextsFormState = { ok: false };

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function TextsForm({ stored }: { stored: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(updateTexts, initial);

  const groups = SITE_TEXTS.reduce<Record<string, TextField[]>>((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});

  return (
    <form action={formAction} className="space-y-6 pb-24">
      {state.success && (
        <p className="rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          Textos guardados. Los cambios ya se ven en el sitio.
        </p>
      )}

      {Object.entries(groups).map(([group, fields]) => (
        <section key={group} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">{group}</h2>
          <div className="mt-4 space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="mb-1 block text-sm font-medium text-ink">
                  {f.label}
                </label>
                {f.multiline ? (
                  <textarea
                    id={f.key}
                    name={f.key}
                    rows={2}
                    defaultValue={stored[f.key] ?? ""}
                    placeholder={f.default}
                    className={inputCls}
                  />
                ) : (
                  <input
                    id={f.key}
                    name={f.key}
                    defaultValue={stored[f.key] ?? ""}
                    placeholder={f.default}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className="text-xs text-stone-400">Vacío = usa el texto por defecto.</p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar textos"}
          </button>
        </div>
      </div>
    </form>
  );
}
