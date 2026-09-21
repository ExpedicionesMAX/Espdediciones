import { z } from "zod";
import { clean } from "./fields";

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "MODERATOR",
  "GUIDE",
  "COMMERCIAL",
] as const;

export const createUserSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  name: z.preprocess(clean, z.string().trim().optional()),
  role: z.enum(ROLES),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const updateUserSchema = z.object({
  name: z.preprocess(clean, z.string().trim().optional()),
  role: z.enum(ROLES),
  active: z.coerce.boolean().default(false),
});

export const passwordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
