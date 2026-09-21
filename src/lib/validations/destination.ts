import { z } from "zod";
import { optNumber, optString, optUrl } from "./fields";

export const destinationInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: optString,
  country: z.string().trim().min(2, "El país es obligatorio"),
  region: optString,
  description: optString,
  coverImage: optUrl,
  gallery: z.array(z.string().url()).default([]),
  latitude: optNumber,
  longitude: optNumber,
});

export type DestinationInput = z.infer<typeof destinationInputSchema>;
