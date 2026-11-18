/**
 * Arma las filas de un collage «justificado»: todas las fotos de una fila
 * tienen la misma altura y la fila ocupa el ancho completo, así no quedan
 * huecos y ninguna foto se recorta. Recibe la proporción (ancho/alto) de cada
 * foto y devuelve los índices agrupados por fila.
 *
 * - La primera fila es la principal: una foto apaisada va sola; si es vertical
 *   se le suma otra para que no quede gigante.
 * - Las demás llevan 2 o 3 fotos (las verticales se agrupan de a 3).
 * - Una foto suelta al final se suma a la fila anterior.
 */
export type CollageOptions = { firstRowTarget?: number; rowTarget?: number; maxPerRow?: number };

const safe = (r: number) => (Number.isFinite(r) && r > 0 ? r : 1);

export function collageRows(ratios: number[], opts: CollageOptions = {}): number[][] {
  const { firstRowTarget = 1.25, rowTarget = 2.2, maxPerRow = 3 } = opts;
  const rows: number[][] = [];
  let cur: number[] = [];
  let sum = 0;
  ratios.forEach((raw, i) => {
    cur.push(i);
    sum += safe(raw);
    const target = rows.length === 0 ? firstRowTarget : rowTarget;
    if (sum >= target || cur.length === maxPerRow) {
      rows.push(cur);
      cur = [];
      sum = 0;
    }
  });
  if (cur.length > 0) {
    const last = rows[rows.length - 1];
    if (cur.length === 1 && last && last.length <= maxPerRow) last.push(...cur);
    else rows.push(cur);
  }
  return rows;
}

/**
 * Cuántas filas del collage van al costado del texto para que ambas columnas
 * terminen a la par. `textUnits` = alto del texto ÷ ancho de la columna de
 * fotos; `gapUnits` = separación entre filas en la misma unidad. Siempre al
 * menos una fila.
 */
export function rowsBesideText(
  rows: number[][],
  ratios: number[],
  textUnits: number,
  gapUnits = 0,
): number {
  if (rows.length === 0) return 0;
  let height = 0;
  let best = 1;
  let bestDiff = Infinity;
  rows.forEach((row, i) => {
    height += (i > 0 ? gapUnits : 0) + 1 / row.reduce((s, idx) => s + safe(ratios[idx]), 0);
    const diff = Math.abs(height - textUnits);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  });
  return best;
}
