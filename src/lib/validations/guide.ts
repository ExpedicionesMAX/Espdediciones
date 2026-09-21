import { z } from "zod";
import { optString, optUrl } from "./fields";

export const guideInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: optString,
  photo: optUrl,
  bio: optString,
  experience: optString,
  certifications: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  social: z
    .object({
      instagram: optUrl,
      youtube: optUrl,
      facebook: optUrl,
      website: optUrl,
    })
    .partial()
    .optional(),
});

export type GuideInput = z.infer<typeof guideInputSchema>;
