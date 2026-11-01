/**
 * Velo oscuro sobre una foto de portada, para que el texto encima se lea.
 * Se elige en el panel; vacío o inválido = "medium" (el velo de siempre).
 */
export const OVERLAYS = ["none", "light", "medium", "strong"] as const;
export type Overlay = (typeof OVERLAYS)[number];

export const DEFAULT_OVERLAY: Overlay = "medium";

/** Degradé (Tailwind, con `bg-gradient-to-t`) de cada intensidad. */
export const OVERLAY_CLASS: Record<Overlay, string> = {
  none: "",
  light: "from-black/55 via-black/15 to-transparent",
  medium: "from-black/85 via-black/40 to-black/30",
  strong: "from-black/90 via-black/60 to-black/45",
};

export const OVERLAY_LABELS: Record<Overlay, string> = {
  none: "Sin velo",
  light: "Suave",
  medium: "Medio (actual)",
  strong: "Fuerte",
};

/** Valor para guardar: una intensidad válida distinta de la de siempre, o null. */
export function normalizeOverlay(value: unknown): Overlay | null {
  return typeof value === "string" && (OVERLAYS as readonly string[]).includes(value) && value !== DEFAULT_OVERLAY
    ? (value as Overlay)
    : null;
}

/** Intensidad a usar (la de siempre si no hay una elegida). */
export function resolveOverlay(value: unknown): Overlay {
  return normalizeOverlay(value) ?? DEFAULT_OVERLAY;
}

/** Clases del degradé ("" = sin velo). */
export function overlayClass(value: unknown): string {
  return OVERLAY_CLASS[resolveOverlay(value)];
}

/** Con poco o ningún velo, el texto lleva sombra para seguir leyéndose. */
export function overlayNeedsTextShadow(value: unknown): boolean {
  const o = resolveOverlay(value);
  return o === "none" || o === "light";
}
