export type TextField = {
  key: string;
  label: string;
  default: string;
  group: string;
  multiline?: boolean;
};

export type SiteTexts = Record<string, string>;

export const SITE_TEXTS: TextField[] = [
  // Página Expediciones
  { key: "expsTitle", label: "Título", default: "Expediciones", group: "Página Expediciones" },

  // Página Fechas
  { key: "fechasTitle", label: "Título", default: "Próximas fechas", group: "Página Fechas" },
  { key: "fechasSubtitle", label: "Subtítulo", default: "Todas nuestras salidas, ordenadas por mes.", group: "Página Fechas", multiline: true },

  // Página Destinos
  { key: "destinosTitle", label: "Título", default: "Destinos", group: "Página Destinos" },
  { key: "destinosSubtitle", label: "Subtítulo", default: "Los territorios donde caminamos, escalamos y fotografiamos.", group: "Página Destinos", multiline: true },

  // Página Guías
  { key: "guiasTitle", label: "Título", default: "Guías", group: "Página Guías" },
  { key: "guiasSubtitle", label: "Subtítulo", default: "El equipo que lidera cada travesía.", group: "Página Guías", multiline: true },

  // Página Comunidad
  { key: "comunidadTitle", label: "Título", default: "Comunidad", group: "Página Comunidad" },
  { key: "comunidadSubtitle", label: "Subtítulo", default: "Las voces de quienes ya caminaron, escalaron y fotografiaron con nosotros.", group: "Página Comunidad", multiline: true },
  { key: "comunidadCtaTitle", label: "Título del cierre", default: "¿Querés ser parte de la próxima historia?", group: "Página Comunidad" },
  { key: "comunidadCtaButton", label: "Botón del cierre", default: "Descubrí las expediciones", group: "Página Comunidad" },

  // Página Contacto
  { key: "contactoTitle", label: "Título", default: "Contacto", group: "Página Contacto" },
  { key: "contactoSubtitle", label: "Subtítulo", default: "Contanos qué expedición tenés en mente y te respondemos a la brevedad.", group: "Página Contacto", multiline: true },
  { key: "contactoHablemos", label: "Título del bloque «Hablemos»", default: "Hablemos", group: "Página Contacto" },
  { key: "contactoHablemosText", label: "Texto del bloque «Hablemos»", default: "Podés escribirnos por el formulario o directo por WhatsApp.", group: "Página Contacto", multiline: true },

  // Rótulos de la ficha de expedición
  { key: "expLaExpedicion", label: "Descripción", default: "La expedición", group: "Rótulos de la expedición" },
  { key: "expItinerario", label: "Itinerario", default: "Itinerario", group: "Rótulos de la expedición" },
  { key: "expGaleria", label: "Galería", default: "Galería", group: "Rótulos de la expedición" },
  { key: "expIncluye", label: "Incluye", default: "Incluye", group: "Rótulos de la expedición" },
  { key: "expNoIncluye", label: "No incluye", default: "No incluye", group: "Rótulos de la expedición" },
  { key: "expRequisitos", label: "Requisitos", default: "Requisitos", group: "Rótulos de la expedición" },
  { key: "expEquipamiento", label: "Equipamiento", default: "Equipamiento", group: "Rótulos de la expedición" },
  { key: "expGuias", label: "Guías", default: "Guías", group: "Rótulos de la expedición" },
  { key: "expTestimonios", label: "Testimonios", default: "Testimonios", group: "Rótulos de la expedición" },
  { key: "expFaq", label: "Preguntas frecuentes", default: "Preguntas frecuentes", group: "Rótulos de la expedición" },
  { key: "expInscripcion", label: "Inscripción", default: "Inscripción", group: "Rótulos de la expedición" },
];

export const TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_TEXTS.map((t) => [t.key, t.default]),
);
