"use client";

import { useEffect, useState } from "react";

const DEFAULT_MESSAGE = "Tenés cambios sin guardar. ¿Querés salir igual?";

/**
 * Mientras `dirty` sea true, avisa antes de abandonar la página: al cerrar o
 * recargar la pestaña (beforeunload) y al tocar un enlace interno del panel.
 */
export function useUnsavedChanges(dirty: boolean, message = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // requerido por algunos navegadores para mostrar el aviso
    };

    // Fase de captura: corre antes que el manejador de <Link> de Next.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // externo: lo cubre beforeunload
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);
}

/**
 * Para formularios no controlados: se marca "sucio" al escribir, se limpia al
 * enviar (el envío ya está en curso o redirige al guardar) y vuelve a quedar
 * "sucio" si el servidor responde con error, porque los cambios no se guardaron.
 */
export function useDirtyForm<S extends { error?: string }>(state: S) {
  const [dirty, setDirty] = useState(false);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.error) setDirty(true);
  }
  useUnsavedChanges(dirty);
  return {
    dirty,
    /** Para cambios que no disparan un evento de formulario (p. ej. elegir una foto). */
    markDirty: () => setDirty(true),
    formProps: { onChange: () => setDirty(true), onSubmit: () => setDirty(false) },
  };
}

/**
 * Para formularios cuyo contenido vive en estado (JSON): compara lo actual con
 * lo último que el servidor confirmó como guardado.
 */
export function useSavedSnapshot<S extends { success?: boolean }>(current: string, state: S) {
  const [saved, setSaved] = useState(current);
  const [submitted, setSubmitted] = useState(current);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.success) setSaved(submitted);
  }
  const dirty = current !== saved;
  useUnsavedChanges(dirty);
  return { dirty, onSubmit: () => setSubmitted(current) };
}
