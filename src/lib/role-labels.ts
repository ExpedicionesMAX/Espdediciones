import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Súper Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  MODERATOR: "Moderador",
  GUIDE: "Guía",
  COMMERCIAL: "Comercial",
};

export const ROLE_HINTS: Record<Role, string> = {
  SUPER_ADMIN: "Acceso total",
  ADMIN: "Administración general",
  EDITOR: "Crea y publica contenido (expediciones, destinos, guías, páginas)",
  MODERATOR: "Modera testimonios y ve consultas",
  GUIDE: "Ve la información de sus expediciones",
  COMMERCIAL: "Gestiona consultas, reservas y CRM",
};

export const ROLE_STYLES: Record<Role, string> = {
  SUPER_ADMIN: "bg-orange-100 text-orange-900",
  ADMIN: "bg-indigo-100 text-indigo-800",
  EDITOR: "bg-emerald-100 text-emerald-800",
  MODERATOR: "bg-sky-100 text-sky-800",
  GUIDE: "bg-stone-200 text-stone-700",
  COMMERCIAL: "bg-violet-100 text-violet-800",
};
