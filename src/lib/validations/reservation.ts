import { z } from "zod";
import { optString } from "./fields";

export const reservationInputSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresá tu nombre"),
  lastName: z.string().trim().min(2, "Ingresá tu apellido"),
  email: z.string().trim().email("Email inválido"),
  phone: optString,
  country: optString,
  city: optString,
  emergencyContact: optString,
  experience: optString,
  notes: optString,
  expeditionId: z.string().min(1),
});

export type ReservationInput = z.infer<typeof reservationInputSchema>;
