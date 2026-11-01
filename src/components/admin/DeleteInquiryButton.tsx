"use client";

import { useState } from "react";
import { deleteInquiry } from "@/server/actions/inquiries";

/** Botón de borrado con confirmación, para la lista de consultas. */
export function DeleteInquiryButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={deleteInquiry}
      onSubmit={(e) => {
        const ok = window.confirm(
          `¿Eliminar la consulta de «${name}»?\n\n` +
            "Esta acción es permanente. El contacto sigue guardado en el CRM.",
        );
        if (!ok) {
          e.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="px-2 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
    </form>
  );
}
