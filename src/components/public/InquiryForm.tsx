"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryFormState } from "@/server/actions/inquiries";

const initial: InquiryFormState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent focus:outline-none";

export function InquiryForm({
  expeditionId,
  expeditionName,
}: {
  expeditionId?: string;
  expeditionName?: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initial);

  if (state.ok && state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-display text-lg font-semibold text-emerald-900">
          ¡Gracias por tu consulta!
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          La recibimos y te vamos a responder a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {expeditionId && (
        <input type="hidden" name="expeditionId" value={expeditionId} />
      )}
      {/* honeypot anti-bot: oculto para humanos */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {expeditionName && (
        <p className="text-sm text-stone-600">
          Consulta sobre <strong className="text-ink">{expeditionName}</strong>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Nombre
          </label>
          <input id="name" name="name" required className={inputClass} />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Teléfono / WhatsApp
          </label>
          <input id="phone" name="phone" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className={inputClass}
          placeholder="Contanos qué te gustaría saber…"
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      {state.error && !state.success && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar consulta"}
      </button>
      <p className="text-center text-xs text-stone-500">
        Tu consulta es privada y no se publica en el sitio.
      </p>
    </form>
  );
}
