"use client";

import { useActionState, useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { FocusPicker } from "@/components/admin/FocusPicker";
import { updateTexts, type TextsFormState } from "@/server/actions/texts";
import { SITE_TEXTS, type TextField } from "@/lib/site-texts-schema";
import { useDirtyForm } from "@/components/admin/useUnsavedChanges";
import { UnsavedBadge } from "@/components/admin/content-form-ui";

const initial: TextsFormState = { ok: false };

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

/**
 * Campo de foto dentro de «Textos del sitio»: el valor viaja en un campo oculto.
 * Si tiene un campo de encuadre asociado (`focusKey`), muestra el editor para
 * elegir qué parte se ve o mostrar la foto entera.
 */
function ImageTextField({
  id,
  defaultValue,
  focusKey,
  defaultFocus,
  onChange,
}: {
  id: string;
  defaultValue: string;
  focusKey?: string;
  defaultFocus?: string;
  onChange: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [focus, setFocus] = useState(defaultFocus ?? "");
  return (
    <>
      <input type="hidden" name={id} value={value} />
      {focusKey && <input type="hidden" name={focusKey} value={value ? focus : ""} />}
      <ImageField
        id={id}
        value={value}
        folder="sitio"
        onChange={(url) => {
          setValue(url);
          setFocus(""); // foto nueva: empieza centrada
          onChange();
        }}
        hint="Ideal: foto horizontal y de buena calidad. Si la dejás vacía, se usa una foto de tus viajes."
      />
      {focusKey && value && (
        <div className="mt-4">
          <FocusPicker
            imageUrl={value}
            value={focus}
            onChange={(f) => {
              setFocus(f);
              onChange();
            }}
            mainAspect="3 / 1" // portada de Nuestros Viajes: 62% del alto de la pantalla
            previews={[{ label: "En celular", aspect: "3 / 4", className: "w-20" }]}
          />
        </div>
      )}
    </>
  );
}

export function TextsForm({ stored }: { stored: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(updateTexts, initial);
  const { dirty, markDirty, formProps } = useDirtyForm(state);

  // Los encuadres no se muestran solos: van dentro del campo de su foto.
  const groups = SITE_TEXTS.filter((f) => !f.hidden && f.kind !== "focus").reduce<Record<string, TextField[]>>((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});

  return (
    <form action={formAction} {...formProps} className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <UnsavedBadge show={dirty && !pending} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar textos"}
        </button>
      </div>

      {state.success && !dirty && (
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
                {f.kind === "image" ? (
                  <ImageTextField
                    id={f.key}
                    defaultValue={stored[f.key] ?? ""}
                    // Campo de encuadre de esta foto: la misma clave terminada en «Focus»
                    focusKey={SITE_TEXTS.some((t) => t.key === f.key.replace(/Image$/, "Focus") && t.kind === "focus") ? f.key.replace(/Image$/, "Focus") : undefined}
                    defaultFocus={stored[f.key.replace(/Image$/, "Focus")] ?? ""}
                    onChange={markDirty}
                  />
                ) : f.multiline ? (
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

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
        <p className="text-xs text-stone-400">Vacío = usa el texto por defecto.</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar textos"}
        </button>
      </div>
    </form>
  );
}
