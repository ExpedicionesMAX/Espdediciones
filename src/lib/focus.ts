/**
 * Encuadre de una foto recortada: el punto (en %) que se mantiene visible al
 * llenar un recuadro con `object-fit: cover`. Se guarda como "X% Y%".
 * "50% 50%" es el centro (lo de siempre).
 */
export type Focus = { x: number; y: number };

export const CENTER: Focus = { x: 50, y: 50 };

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Lee "X% Y%" (o "X Y"); cualquier otra cosa → null (= centro). */
export function parseFocus(value: unknown): Focus | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{1,3}(?:\.\d+)?)%?\s+(\d{1,3}(?:\.\d+)?)%?$/);
  if (!m) return null;
  const x = Number(m[1]);
  const y = Number(m[2]);
  if (x > 100 || y > 100) return null;
  return { x: clamp(x), y: clamp(y) };
}

/** Valor para guardar: "X% Y%", o null si es el centro o no es válido. */
export function normalizeFocus(value: unknown): string | null {
  const f = parseFocus(value);
  if (!f || (f.x === 50 && f.y === 50)) return null;
  return `${f.x}% ${f.y}%`;
}

/** Valor CSS para `object-position` (centro si no hay encuadre). */
export function focusCss(value: unknown): string {
  const f = parseFocus(value) ?? CENTER;
  return `${f.x}% ${f.y}%`;
}
