"use client";

import { useActionState } from "react";
import {
  submitReservation,
  type ReservationFormState,
} from "@/server/actions/reservations";

const initial: ReservationFormState = { ok: false };

/** Arma el link wa.me con un mensaje para coordinar el pago y mandar el comprobante. */
function buildWhatsappPaymentUrl(
  number: string | null | undefined,
  expeditionName?: string,
  priceLabel?: string | null,
  depositLabel?: string | null,
): string | null {
  const clean = (number ?? "").replace(/\D/g, "");
  if (!clean) return null;

  let msg = `¡Hola! Me inscribí a «${expeditionName ?? "una expedición"}» y quiero coordinar el pago para reservar mi lugar.`;
  if (depositLabel && priceLabel) {
    msg += ` Puedo abonar la seña (${depositLabel}) o el total (${priceLabel}).`;
  } else if (depositLabel) {
    msg += ` Puedo abonar la seña (${depositLabel}).`;
  } else if (priceLabel) {
    msg += ` El total es ${priceLabel}.`;
  }
  msg += " Les envío el comprobante por acá.";

  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-ink";

export function ReservationForm({
  expeditionId,
  isFull,
  whatsappNumber,
  expeditionName,
  priceLabel,
  depositLabel,
}: {
  expeditionId: string;
  isFull?: boolean;
  whatsappNumber?: string | null;
  expeditionName?: string;
  priceLabel?: string | null;
  depositLabel?: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitReservation, initial);

  if (state.ok && state.success) {
    const wa = buildWhatsappPaymentUrl(
      whatsappNumber,
      expeditionName,
      priceLabel,
      depositLabel,
    );
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

        {!state.waitlist && wa && (
          <div className="mt-5 border-t border-emerald-200 pt-5">
            <p className="text-sm text-emerald-900">
              Para reservar tu lugar, coordiná el pago
              {depositLabel || priceLabel ? " " : ""}
              {depositLabel && priceLabel
                ? `(seña ${depositLabel} o total ${priceLabel})`
                : depositLabel
                  ? `(seña ${depositLabel})`
                  : priceLabel
                    ? `(${priceLabel})`
                    : ""}{" "}
              y envianos el comprobante por WhatsApp.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2m0 18.15a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.24-8.23s8.23 3.69 8.23 8.23-3.69 8.24-8.22 8.24m4.5-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.37.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42-.14 0-.3-.02-.47-.02s-.43.06-.66.31c-.22.24-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29" />
              </svg>
              Coordinar pago por WhatsApp
            </a>
          </div>
        )}
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
