"use client";

import { useActionState } from "react";
import {
  submitReservation,
  type ReservationFormState,
} from "@/server/actions/reservations";

const initial: ReservationFormState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-ink";

export function ReservationForm({
  expeditionId,
  isFull,
}: {
  expeditionId: string;
  isFull?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitReservation, initial);

  if (state.ok && state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-display text-lg font-semibold text-emerald-900">
          {state.waitlist ? "¡Estás en la lista de espera!" : "¡Inscripción recibida!"}
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          {state.waitlist
            ? "Te avisamos apenas se libere un lugar."
            : "Te vamos a contactar para confirmar los detalles y la reserva."}
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

      {isFull && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          La expedición está completa. Podés anotarte en la <strong>lista de espera</strong>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>Nombre</label>
          <input id="firstName" name="firstName" required className={inputClass} />
          {err("firstName") && <p className="mt-1 text-xs text-red-600">{err("firstName")}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Apellido</label>
          <input id="lastName" name="lastName" required className={inputClass} />
          {err("lastName") && <p className="mt-1 text-xs text-red-600">{err("lastName")}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required className={inputClass} />
          {err("email") && <p className="mt-1 text-xs text-red-600">{err("email")}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Teléfono / WhatsApp</label>
          <input id="phone" name="phone" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className={labelClass}>País</label>
          <input id="country" name="country" className={inputClass} />
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>Ciudad</label>
          <input id="city" name="city" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="emergencyContact" className={labelClass}>Contacto de emergencia</label>
        <input id="emergencyContact" name="emergencyContact" className={inputClass} placeholder="Nombre y teléfono" />
      </div>

      <div>
        <label htmlFor="experience" className={labelClass}>Experiencia previa</label>
        <textarea id="experience" name="experience" rows={2} className={inputClass} placeholder="Contanos tu experiencia en montaña / trekking" />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Observaciones</label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
      </div>

      {state.error && !state.success && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Enviando…" : isFull ? "Anotarme en lista de espera" : "Enviar inscripción"}
      </button>
      <p className="text-center text-xs text-stone-500">
        Tu inscripción es una preinscripción: el equipo la revisa y te contacta. No es un pago.
      </p>
    </form>
  );
}
