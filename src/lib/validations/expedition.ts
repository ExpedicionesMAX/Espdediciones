import { z } from "zod";

const clean = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const optString = z.preprocess(clean, z.string().trim().optional());
const optNumber = z.preprocess(clean, z.coerce.number().optional());
const optInt = z.preprocess(clean, z.coerce.number().int().optional());
const optDate = z.preprocess(clean, z.coerce.date().optional());
const optUrl = z.preprocess(
  clean,
  z.string().url("URL inválida").optional(),
);

export const ACTIVITY_TYPES = [
  "TREKKING",
  "MOUNTAINEERING",
  "EXPEDITION",
  "PHOTOGRAPHY",
  "CLIMBING",
  "TRAVESIA",
  "NATURE",
] as const;

export const DIFFICULTIES = [
  "EASY",
  "MODERATE",
  "HARD",
  "TECHNICAL",
  "EXTREME",
] as const;

export const STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "OPEN",
  "LIMITED",
  "FULL",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export const TEMPLATES = ["CINEMATIC", "EDITORIAL", "EXTREME"] as const;

export const itineraryDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, "Título del día requerido"),
  description: optString,
  distanceKm: optNumber,
  elevationGain: optInt,
  altitude: optInt,
  accommodation: optString,
});

export const expeditionInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: optString,
  title: optString,
  subtitle: optString,
  shortDescription: optString,
  fullDescription: optString,

  activityType: z.preprocess(clean, z.enum(ACTIVITY_TYPES).optional()),
  difficulty: z.preprocess(clean, z.enum(DIFFICULTIES).optional()),

  destinationId: optString,
  country: optString,
  region: optString,

  startDate: optDate,
  endDate: optDate,
  durationDays: optInt,
  distanceKm: optNumber,
  elevationGain: optInt,
  maxAltitude: optInt,
  minAge: optInt,

  capacity: optInt,
  price: optNumber,
  currency: z.preprocess(clean, z.string().default("USD")),
  depositPrice: optNumber,
  registrationDeadline: optDate,

  coverImage: optUrl,
  videoUrl: optUrl,
  gallery: z.array(z.string().url()).default([]),

  leadGuideId: optString,

  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  recommendations: optString,

  itinerary: z.array(itineraryDaySchema).default([]),

  template: z.preprocess(clean, z.enum(TEMPLATES).default("CINEMATIC")),
  status: z.preprocess(clean, z.enum(STATUSES).default("DRAFT")),
  featured: z.coerce.boolean().default(false),

  seoTitle: optString,
  seoDescription: optString,
  whatsappMessage: optString,
});

export type ExpeditionInput = z.infer<typeof expeditionInputSchema>;
