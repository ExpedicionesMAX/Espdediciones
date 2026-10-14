export type TextField = {
  key: string;
  label: string;
  default: string;
  group: string;
  multiline?: boolean;
  /**
   * Texto de una sección que ya no está en el sitio (páginas eliminadas en
   * rediseños anteriores). No se muestra en el editor, pero si tiene un valor
   * guardado se conserva al guardar.
   */
  hidden?: boolean;
};

export type SiteTexts = Record<string, string>;

export const SITE_TEXTS: TextField[] = [
  // Catálogo Nuestros Viajes (/expediciones)
  { key: "expsTitle", label: "Título", default: "Nuestros Viajes", group: "Página Nuestros Viajes" },
  { key: "expsSubtitle", label: "Texto de presentación", default: "Distintas formas de viajar, una misma manera de mirar. Elegí cómo querés explorar.", group: "Página Nuestros Viajes", multiline: true },
  { key: "expsAllLabel", label: "Filtro «todos los viajes»", default: "Todos", group: "Página Nuestros Viajes" },
  { key: "catFotograficaIntro", label: "Presentación de Expediciones Fotográficas", default: "Nuestros viajes fotográficos guiados.", group: "Página Nuestros Viajes", multiline: true },
  { key: "catEscapadaIntro", label: "Presentación de Escapadas", default: "Salidas cortas para desconectar.", group: "Página Nuestros Viajes", multiline: true },
  { key: "catColeccionableIntro", label: "Presentación de Viajes Coleccionables", default: "Experiencias únicas para coleccionar.", group: "Página Nuestros Viajes", multiline: true },
  { key: "expsEmptyTitle", label: "Categoría sin viajes: título", default: "Próximamente", group: "Página Nuestros Viajes" },
  { key: "expsEmptyText", label: "Categoría sin viajes: texto", default: "Por el momento no hay experiencias publicadas en esta categoría. Mirá el resto de nuestros viajes o consultanos por uno a medida.", group: "Página Nuestros Viajes", multiline: true },

  // Inicio — sección de reseñas
  { key: "homeReviewsTitle", label: "Título de la sección de reseñas", default: "Lo que dicen nuestros expedicionarios", group: "Inicio — Reseñas" },
  { key: "homeReviewsSubtitle", label: "Bajada de la sección de reseñas", default: "Experiencias que quedan.", group: "Inicio — Reseñas" },

  // Página Fechas
  { key: "fechasTitle", label: "Título", default: "Próximas fechas", group: "Página Fechas", hidden: true },
  { key: "fechasSubtitle", label: "Subtítulo", default: "Todas nuestras salidas, ordenadas por mes.", group: "Página Fechas", multiline: true, hidden: true },

  // Página Destinos
  { key: "destinosTitle", label: "Título", default: "Destinos", group: "Página Destinos", hidden: true },
  { key: "destinosSubtitle", label: "Subtítulo", default: "Los territorios donde caminamos, escalamos y fotografiamos.", group: "Página Destinos", multiline: true, hidden: true },

  // Página Guías
  { key: "guiasTitle", label: "Título", default: "Guías", group: "Página Guías", hidden: true },
  { key: "guiasSubtitle", label: "Subtítulo", default: "El equipo que lidera cada travesía.", group: "Página Guías", multiline: true, hidden: true },

  // Página Comunidad
  { key: "comunidadTitle", label: "Título", default: "Comunidad", group: "Página Comunidad", hidden: true },
  { key: "comunidadSubtitle", label: "Subtítulo", default: "Las voces de quienes ya caminaron, escalaron y fotografiaron con nosotros.", group: "Página Comunidad", multiline: true, hidden: true },
  { key: "comunidadCtaTitle", label: "Título del cierre", default: "¿Querés ser parte de la próxima historia?", group: "Página Comunidad", hidden: true },
  { key: "comunidadCtaButton", label: "Botón del cierre", default: "Descubrí las expediciones", group: "Página Comunidad", hidden: true },

  // Página Contacto
  { key: "contactoTitle", label: "Título", default: "Contacto", group: "Página Contacto", hidden: true },
  { key: "contactoSubtitle", label: "Subtítulo", default: "Contanos qué expedición tenés en mente y te respondemos a la brevedad.", group: "Página Contacto", multiline: true, hidden: true },
  { key: "contactoHablemos", label: "Título del bloque «Hablemos»", default: "Hablemos", group: "Página Contacto", hidden: true },
  { key: "contactoHablemosText", label: "Texto del bloque «Hablemos»", default: "Podés escribirnos por el formulario o directo por WhatsApp.", group: "Página Contacto", multiline: true, hidden: true },

  // Rótulos de la ficha de expedición
  { key: "expLaExpedicion", label: "Descripción", default: "La expedición", group: "Rótulos de la expedición" },
  { key: "expItinerario", label: "Itinerario", default: "Itinerario", group: "Rótulos de la expedición" },
  { key: "expGaleria", label: "Galería", default: "Galería", group: "Rótulos de la expedición" },
  { key: "expIncluye", label: "Incluye", default: "Incluye", group: "Rótulos de la expedición" },
  { key: "expNoIncluye", label: "No incluye", default: "No incluye", group: "Rótulos de la expedición" },
  { key: "expRequisitos", label: "Requisitos", default: "Requisitos", group: "Rótulos de la expedición" },
  { key: "expEquipamiento", label: "Equipamiento", default: "Equipamiento", group: "Rótulos de la expedición" },
  { key: "expGuias", label: "Guías", default: "Guías", group: "Rótulos de la expedición", hidden: true },
  { key: "expTestimonios", label: "Testimonios", default: "Testimonios", group: "Rótulos de la expedición" },
  { key: "expFaq", label: "Preguntas frecuentes", default: "Preguntas frecuentes", group: "Rótulos de la expedición", hidden: true },
  { key: "expInscripcion", label: "Inscripción", default: "Inscripción", group: "Rótulos de la expedición", hidden: true },
];

export const TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_TEXTS.map((t) => [t.key, t.default]),
);
