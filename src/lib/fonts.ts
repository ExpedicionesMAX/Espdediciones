export type FontOption = { key: string; label: string; cssVar: string };

export const FONT_OPTIONS: FontOption[] = [
  { key: "editorial", label: "Editorial (serif, elegante)", cssVar: "--font-fraunces" },
  { key: "aventura", label: "Aventura (condensada, deportiva)", cssVar: "--font-oswald" },
  { key: "impacto", label: "Impacto (títulos grandes, poster)", cssVar: "--font-anton" },
  { key: "moderno", label: "Moderna (geométrica, limpia)", cssVar: "--font-montserrat" },
];

export const FONT_VARS: Record<string, string> = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.key, f.cssVar]),
);

export function fontVar(key: string | null | undefined): string {
  return (key && FONT_VARS[key]) || "--font-fraunces";
}
