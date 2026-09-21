"use client";

import { useActionState } from "react";
import {
  submitTestimonial,
  type TestimonialFormState,
} from "@/server/actions/testimonials";

const initial: TestimonialFormState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-ink";

export function TestimonialForm({ expeditionId }: { expeditionId: string }) {
  const [state, formAction, pending] = useActionState(submitTestimonial, initial);

  if (state.ok && state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-display text-lg font-semibold text-emerald-900">
          ¡Gracias por compartir tu experiencia!
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          Tu testimonio quedó pendiente de revisión. Si se aprueba, aparecerá acá.
        </p>
      </div>
    );
  }

  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="expeditionId" value={expeditionId} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="authorName" className={labelClass}>Nombre</label>
          <input id="authorName" name="authorName" required className={inputClass} />
          {err("authorName") && <p className="mt-1 text-xs text-red-600">{err("authorName")}</p>}
        </div>
        <div>
          <label htmlFor="rating" className={labelClass}>Valoración</label>
          <select id="rating" name="rating" defaultValue="5" className={inputClass}>
            <option value="5">★★★★★ Excelente</option>
            <option value="4">★★★★ Muy buena</option>
            <option value="3">★★★ Buena</option>
            <option value="2">★★ Regular</option>
            <option value="1">★ Mala</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="authorEmail" className={labelClass}>Email (opcional, no se publica)</label>
        <input id="authorEmail" name="authorEmail" type="email" className={inputClass} />
        {err("authorEmail") && <p className="mt-1 text-xs text-red-600">{err("authorEmail")}</p>}
      </div>

      <div>
        <label htmlFor="text" className={labelClass}>Tu experiencia</label>
        <textarea id="text" name="text" rows={4} required className={inputClass} placeholder="Contanos cómo fue la expedición…" />
        {err("text") && <p className="mt-1 text-xs text-red-600">{err("text")}</p>}
      </div>

      {state.error && !state.success && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar testimonio"}
      </button>
      <p className="text-center text-xs text-stone-500">
        Los testimonios se revisan antes de publicarse.
      </p>
    </form>
  );
}
