import { z } from "zod";

/** Preprocesadores reutilizables: "" y null → undefined antes de validar. */
export const clean = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

export const optString = z.preprocess(clean, z.string().trim().optional());
export const optNumber = z.preprocess(clean, z.coerce.number().optional());
export const optUrl = z.preprocess(clean, z.string().url("URL inválida").optional());
