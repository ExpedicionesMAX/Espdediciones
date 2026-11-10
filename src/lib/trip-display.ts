/**
 * Qué datos de un viaje se muestran en el sitio. Se elige por viaje en el
 * panel (Expedition.publicInfo). Un dato solo aparece si está activado Y
 * cargado. Sin elección guardada, cada dato usa su valor por defecto: los que
 * el sitio ya mostraba siguen visibles; los nuevos (precio, cupos…) ocultos.
 */
export const TRIP_INFO = [
  { key: "dates", label: "Fechas / temporada", default: true },
  { key: "price", label: "Precio", default: false },
  { key: "deposit", label: "Seña / reserva", default: false },
  { key: "spots", label: "Lugares disponibles", default: false },
  { key: "deadline", label: "Cierre de inscripción", default: false },
  { key: "duration", label: "Duración", default: true },
  { key: "difficulty", label: "Dificultad", default: true },
  { key: "location", label: "Lugar (región / país)", default: true },
] as const;

export type TripInfoKey = (typeof TRIP_INFO)[number]["key"];
export type TripDisplay = Record<TripInfoKey, boolean>;

/** Lo guardado (o nada) → qué se muestra, con los valores por defecto. */
export function tripDisplay(value: unknown): TripDisplay {
  const stored =
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    TRIP_INFO.map((f) => [f.key, typeof stored[f.key] === "boolean" ? stored[f.key] : f.default]),
  ) as TripDisplay;
}

/** «Quedan N lugares» / «Completo»; sin cupos totales cargados → null (no se muestra). */
export function spotsText(capacity: number | null | undefined, taken: number | null | undefined): string | null {
  if (!capacity || capacity <= 0) return null;
  const left = Math.max(capacity - (taken ?? 0), 0);
  if (left === 0) return "Completo";
  return left === 1 ? "Queda 1 lugar" : `Quedan ${left} lugares`;
}

/** Lee las casillas «show_<dato>» del formulario del viaje. */
export function tripDisplayFromForm(fd: FormData): TripDisplay {
  return Object.fromEntries(TRIP_INFO.map((f) => [f.key, fd.get(`show_${f.key}`) === "on"])) as TripDisplay;
}
