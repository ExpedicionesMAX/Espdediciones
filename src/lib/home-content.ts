import { imageUrl, safeHref, str } from "@/lib/content-fields";

/**
 * Contenido del inicio institucional (Nosotros), guardado en
 * SiteSettings.homeContent. Este módulo es puro (sin Prisma) para poder
 * usarlo desde el formulario del panel y desde el servidor.
 *
 * Regla: un campo vacío usa el valor por defecto. Los valores por defecto
 * son PROVISIONALES (el panel los marca así) y no afirman nada sobre la
 * empresa: ni trayectoria, ni premios, ni servicios no confirmados.
 */

export const HOME_SECTIONS = [
  { key: "nosotros", label: "Nosotros / Nuestra historia" },
  { key: "filosofia", label: "Nuestra filosofía" },
  { key: "equipo", label: "Equipo", hint: "Se muestra solo si cargás integrantes." },
  { key: "viajes", label: "Nuestros Viajes (selección)" },
  { key: "proxima", label: "Próxima experiencia", hint: "La experiencia se elige en Configuración." },
  { key: "diferenciales", label: "¿Por qué nosotros?", hint: "Los pilares se editan en Configuración. Si no hay pilares, no se muestra." },
  { key: "resenas", label: "Reseñas", hint: "Se muestran las reseñas aprobadas y activas." },
  { key: "cierre", label: "Cierre y contacto", hint: "Siempre visible: el enlace «Contacto» del menú lleva acá." },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

const SECTION_KEYS = HOME_SECTIONS.map((s) => s.key) as HomeSectionKey[];

/** Secciones que no se pueden ocultar (solo reordenar). */
export const LOCKED_SECTIONS: HomeSectionKey[] = ["cierre"];

/** Visibilidad inicial de cada sección. */
const DEFAULT_VISIBILITY: Record<HomeSectionKey, boolean> = {
  nosotros: true,
  filosofia: true,
  equipo: true,
  viajes: true,
  proxima: false, // el inicio ya no se abre con un viaje; se puede reactivar
  diferenciales: true,
  resenas: true,
  cierre: true,
};

export type HomeSection = { key: HomeSectionKey; visible: boolean };
export type PhilosophyItem = { title: string; text: string };
export type TeamMember = { name: string; role: string; bio: string; photo: string };

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  story: {
    eyebrow: string;
    title: string;
    intro: string;
    body: string;
    image: string;
    imageAlt: string;
  };
  philosophy: {
    eyebrow: string;
    title: string;
    intro: string;
    items: PhilosophyItem[];
  };
  team: {
    eyebrow: string;
    title: string;
    intro: string;
    members: TeamMember[];
  };
  trips: {
    title: string;
    text: string;
    buttonLabel: string;
  };
  closing: {
    title: string;
    text: string;
    buttonLabel: string;
  };
  sections: HomeSection[];
};

/** Valores por defecto (provisionales). Vacío = "sin valor por defecto". */
export const HOME_DEFAULTS: HomeContent = {
  hero: {
    eyebrow: "", // vacío → usa el nombre del sitio de Configuración
    title: "Viajar para mirar de otra manera",
    text: "Un proyecto que une la fotografía, la naturaleza y el viaje. Conocé quiénes somos y cómo pensamos cada experiencia.",
    image: "", // vacío → usa la portada de un viaje destacado
    imageAlt: "",
    primaryLabel: "Conocé nuestra historia",
    primaryHref: "#nosotros",
    secondaryLabel: "Explorá nuestros viajes",
    secondaryHref: "/expediciones",
  },
  story: {
    eyebrow: "Nosotros",
    title: "Nuestra historia",
    intro: "",
    body: "", // vacío → usa el contenido de la página «Nosotros» del panel
    image: "", // vacío → usa una foto de los viajes publicados
    imageAlt: "",
  },
  philosophy: {
    eyebrow: "Nuestra filosofía",
    title: "Cómo entendemos el viaje",
    intro: "",
    items: [
      { title: "Exploración", text: "" },
      { title: "Fotografía", text: "" },
      { title: "Naturaleza", text: "" },
      { title: "Aprendizaje", text: "" },
      { title: "Conexión con los lugares", text: "" },
      { title: "Experiencias compartidas", text: "" },
    ],
  },
  team: {
    eyebrow: "Equipo",
    title: "Quiénes viajan con vos",
    intro: "",
    members: [],
  },
  trips: {
    title: "Nuestros Viajes",
    text: "Distintas formas de viajar, una misma manera de mirar. Descubrí nuestras expediciones fotográficas, escapadas y viajes coleccionables.",
    buttonLabel: "Ver todos nuestros viajes",
  },
  closing: {
    title: "Hablemos",
    text: "Si querés conocer más sobre el proyecto o consultar por un viaje, escribinos.",
    buttonLabel: "Escribinos por WhatsApp",
  },
  sections: SECTION_KEYS.map((key) => ({ key, visible: DEFAULT_VISIBILITY[key] })),
};

const MAX_ITEMS = 12;
const MAX_MEMBERS = 24;

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Secciones en el orden guardado; las que falten se agregan al final con su visibilidad por defecto. */
function normalizeSections(value: unknown): HomeSection[] {
  const out: HomeSection[] = [];
  for (const raw of arr(value)) {
    const o = obj(raw);
    const key = o.key as HomeSectionKey;
    if (SECTION_KEYS.includes(key) && !out.some((s) => s.key === key)) {
      out.push({ key, visible: LOCKED_SECTIONS.includes(key) || o.visible !== false });
    }
  }
  for (const key of SECTION_KEYS) {
    if (!out.some((s) => s.key === key)) out.push({ key, visible: DEFAULT_VISIBILITY[key] });
  }
  return out;
}

/**
 * Normaliza el JSON guardado SIN aplicar defaults: devuelve exactamente lo que
 * el administrador cargó (vacío = no cargado). Tolerante a datos viejos o rotos.
 */
export function normalizeStoredHome(value: unknown): HomeContent {
  const v = obj(value);
  const hero = obj(v.hero);
  const story = obj(v.story);
  const philosophy = obj(v.philosophy);
  const team = obj(v.team);
  const trips = obj(v.trips);
  const closing = obj(v.closing);

  return {
    hero: {
      eyebrow: str(hero.eyebrow, 120),
      title: str(hero.title, 200),
      text: str(hero.text, 600),
      image: imageUrl(hero.image),
      imageAlt: str(hero.imageAlt, 200),
      primaryLabel: str(hero.primaryLabel, 60),
      primaryHref: safeHref(hero.primaryHref),
      secondaryLabel: str(hero.secondaryLabel, 60),
      secondaryHref: safeHref(hero.secondaryHref),
    },
    story: {
      eyebrow: str(story.eyebrow, 80),
      title: str(story.title, 200),
      intro: str(story.intro, 800),
      body: str(story.body, 12000),
      image: imageUrl(story.image),
      imageAlt: str(story.imageAlt, 200),
    },
    philosophy: {
      eyebrow: str(philosophy.eyebrow, 80),
      title: str(philosophy.title, 200),
      intro: str(philosophy.intro, 800),
      items: arr(philosophy.items)
        .map((raw) => {
          const o = obj(raw);
          return { title: str(o.title, 120), text: str(o.text, 600) };
        })
        .filter((i) => i.title)
        .slice(0, MAX_ITEMS),
    },
    team: {
      eyebrow: str(team.eyebrow, 80),
      title: str(team.title, 200),
      intro: str(team.intro, 800),
      members: arr(team.members)
        .map((raw) => {
          const o = obj(raw);
          return {
            name: str(o.name, 120),
            role: str(o.role, 120),
            bio: str(o.bio, 1500),
            photo: imageUrl(o.photo),
          };
        })
        .filter((m) => m.name)
        .slice(0, MAX_MEMBERS),
    },
    trips: {
      title: str(trips.title, 120),
      text: str(trips.text, 600),
      buttonLabel: str(trips.buttonLabel, 60),
    },
    closing: {
      title: str(closing.title, 200),
      text: str(closing.text, 600),
      buttonLabel: str(closing.buttonLabel, 60),
    },
    sections: normalizeSections(v.sections),
  };
}

/** Lo guardado sobre los valores por defecto: lo que se muestra en el sitio. */
export function resolveHome(stored: HomeContent): HomeContent {
  const d = HOME_DEFAULTS;
  const p = stored.philosophy;
  const t = stored.team;
  return {
    hero: pickStrings(stored.hero, d.hero),
    story: pickStrings(stored.story, d.story),
    philosophy: {
      ...pickStrings(
        { eyebrow: p.eyebrow, title: p.title, intro: p.intro },
        { eyebrow: d.philosophy.eyebrow, title: d.philosophy.title, intro: d.philosophy.intro },
      ),
      items: p.items.length > 0 ? p.items : d.philosophy.items,
    },
    team: {
      ...pickStrings(
        { eyebrow: t.eyebrow, title: t.title, intro: t.intro },
        { eyebrow: d.team.eyebrow, title: d.team.title, intro: d.team.intro },
      ),
      members: t.members,
    },
    trips: pickStrings(stored.trips, d.trips),
    closing: pickStrings(stored.closing, d.closing),
    sections: stored.sections,
  };
}

/** Campo a campo: el valor guardado si no está vacío; si no, el por defecto. */
export function pickStrings<T extends Record<string, string>>(stored: T, defaults: T): T {
  const out = { ...defaults };
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    if (stored[k]) out[k] = stored[k];
  }
  return out;
}
