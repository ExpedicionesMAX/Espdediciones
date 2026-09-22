"use client";

import { useState } from "react";
import { deleteExpedition } from "@/server/actions/expeditions";

/** Botón de borrado con doble confirmación, para la lista de expediciones. */
export function DeleteExpeditionButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={deleteExpedition}
      onSubmit={(e) => {
        const ok = window.confirm(
          `¿Eliminar la expedición «${name}»?\n\n` +
            "Esta acción es permanente. Se borran también sus inscripciones. " +
            "Si solo querés sacarla del sitio, usá «Archivar».",
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
        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
    </form>
  );
}
