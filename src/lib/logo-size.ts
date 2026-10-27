/**
 * Tamaños del logo del encabezado (se eligen en Configuración).
 * "md" es el tamaño que tenía el sitio hasta ahora.
 */
export const LOGO_SIZES = [
  { key: "sm", label: "Chico", className: "h-9 sm:h-10" },
  { key: "md", label: "Mediano", className: "h-10 sm:h-12" },
  { key: "lg", label: "Grande", className: "h-14 sm:h-16" },
  { key: "xl", label: "Muy grande", className: "h-16 sm:h-20" },
] as const;

export type LogoSize = (typeof LOGO_SIZES)[number]["key"];

export function normalizeLogoSize(v: unknown): LogoSize {
  return LOGO_SIZES.some((s) => s.key === v) ? (v as LogoSize) : "md";
}

export function logoSizeClass(v: unknown): string {
  const key = normalizeLogoSize(v);
  return LOGO_SIZES.find((s) => s.key === key)!.className;
}

/**
 * Sombra del logo para darle relieve. Es un drop-shadow: sigue la forma del
 * logo (si es un PNG transparente, la silueta; si es una imagen rectangular,
 * el rectángulo). "none" = como estaba.
 */
export const LOGO_SHADOWS = [
  { key: "none", label: "Sin sombra", className: "" },
  { key: "soft", label: "Sutil", className: "drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" },
  { key: "strong", label: "Marcada", className: "drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]" },
] as const;

export type LogoShadow = (typeof LOGO_SHADOWS)[number]["key"];

export function normalizeLogoShadow(v: unknown): LogoShadow {
  return LOGO_SHADOWS.some((s) => s.key === v) ? (v as LogoShadow) : "none";
}

export function logoShadowClass(v: unknown): string {
  const key = normalizeLogoShadow(v);
  return LOGO_SHADOWS.find((s) => s.key === key)!.className;
}
