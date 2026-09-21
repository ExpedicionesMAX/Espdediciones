import { z } from "zod";
import { clean } from "./fields";

export const testimonialInputSchema = z.object({
  authorName: z.string().trim().min(2, "Ingresá tu nombre"),
  authorEmail: z.preprocess(clean, z.string().email("Email inválido").optional()),
  text: z
    .string()
    .trim()
    .min(10, "Contanos tu experiencia (mínimo 10 caracteres)")
    .max(2000),
  rating: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(1).max(5).optional(),
  ),
  expeditionId: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().optional(),
  ),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
