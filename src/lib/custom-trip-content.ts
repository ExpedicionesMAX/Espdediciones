import { imageUrl, str } from "@/lib/content-fields";
import { pickStrings } from "@/lib/home-content";

/**
 * Contenido de la página Viajes a Medida, guardado en
 * SiteSettings.customTripContent. Puro (sin Prisma).
 * Campo vacío = valor por defecto (provisional). Los valores por defecto no
 * prometen destinos, precios ni condiciones: solo invitan a consultar.
 */

export type ProcessStep = { title: string; text: string };

export type CustomTripContent = {
  hero: { eyebrow: string; title: string; text: string; image: string; imageAlt: string };
  intro: { title: string; body: string };
  process: { title: string; steps: ProcessStep[] };
  form: { show: boolean; title: string; text: string };
  whatsapp: { label: string; message: string };
  seo: { title: string; description: string };
};

export const CUSTOM_TRIP_DEFAULTS: CustomTripContent = {
  hero: {
    eyebrow: "Viajes a Medida",
    title: "Diseñamos el viaje que tenés en mente",
    text: "Contanos qué tenés en mente y armamos la travesía con vos.",
    image: "", // vacío → usa una foto de los viajes publicados
    imageAlt: "",
  },
  intro: {
    title: "Una experiencia pensada a partir de tu idea",
    body: "Si ninguno de nuestros viajes se ajusta a lo que buscás, podés consultarnos por una experiencia diseñada según tus intereses, tus tiempos y tu forma de viajar.",
  },
  process: {
    title: "Cómo es la consulta",
    steps: [
      { title: "Nos contás tu idea", text: "Qué te gustaría vivir y fotografiar, en qué época y con quién viajás." },
      { title: "Conversamos", text: "Revisamos juntos los detalles y respondemos tus dudas." },
      { title: "Definimos los próximos pasos", text: "Si la propuesta es viable, avanzamos juntos con la organización." },
    ],
  },
  form: {
    show: true,
    title: "Contanos tu idea",
    text: "Completá el formulario y te respondemos a la brevedad.",
  },
  whatsapp: {
    label: "Consultar por WhatsApp",
    message: "Hola, quiero consultar por un viaje a medida.",
  },
  seo: {
    title: "Viajes a Medida",
    description: "Consultá por una experiencia de viaje y fotografía diseñada según tus intereses.",
  },
};

const MAX_STEPS = 8;

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Lo que cargó el administrador, saneado y sin defaults. */
export function normalizeStoredCustomTrip(value: unknown): CustomTripContent {
  const v = obj(value);
  const hero = obj(v.hero);
  const intro = obj(v.intro);
  const process = obj(v.process);
  const form = obj(v.form);
  const whatsapp = obj(v.whatsapp);
  const seo = obj(v.seo);
  return {
    hero: {
      eyebrow: str(hero.eyebrow, 80),
      title: str(hero.title, 200),
      text: str(hero.text, 600),
      image: imageUrl(hero.image),
      imageAlt: str(hero.imageAlt, 200),
    },
    intro: { title: str(intro.title, 200), body: str(intro.body, 6000) },
    process: {
      title: str(process.title, 200),
      steps: (Array.isArray(process.steps) ? process.steps : [])
        .map((raw) => {
          const o = obj(raw);
          return { title: str(o.title, 120), text: str(o.text, 600) };
        })
        .filter((s) => s.title)
        .slice(0, MAX_STEPS),
    },
    form: { show: form.show !== false, title: str(form.title, 200), text: str(form.text, 600) },
    whatsapp: { label: str(whatsapp.label, 60), message: str(whatsapp.message, 500) },
    seo: { title: str(seo.title, 120), description: str(seo.description, 300) },
  };
}

/** Lo guardado sobre los valores por defecto. */
export function resolveCustomTrip(stored: CustomTripContent): CustomTripContent {
  const d = CUSTOM_TRIP_DEFAULTS;
  return {
    hero: pickStrings(stored.hero, d.hero),
    intro: pickStrings(stored.intro, d.intro),
    process: {
      title: stored.process.title || d.process.title,
      steps: stored.process.steps.length > 0 ? stored.process.steps : d.process.steps,
    },
    form: {
      show: stored.form.show,
      title: stored.form.title || d.form.title,
      text: stored.form.text || d.form.text,
    },
    whatsapp: pickStrings(stored.whatsapp, d.whatsapp),
    seo: pickStrings(stored.seo, d.seo),
  };
}
