"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/cn";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/role-labels";

type NavItem = {
  href: string;
  label: string;
  permission?: Permission;
};

type NavGroup = { title: string; items: NavItem[] };

// Módulos agrupados por tarea. Destinos, Guías, Reservas y CRM siguen existiendo
// (rutas y datos intactos) pero no se enlazan: no forman parte del sitio actual.
const GROUPS: NavGroup[] = [
  {
    title: "General",
    items: [
      { href: "/admin/dashboard", label: "Resumen" },
      { href: "/admin/notificaciones", label: "Notificaciones" },
    ],
  },
  {
    title: "Sitio web",
    items: [
      { href: "/admin/inicio", label: "Inicio (Nosotros)", permission: PERMISSIONS.PAGE_MANAGE },
      { href: "/admin/viajes-a-medida", label: "Viajes a Medida", permission: PERMISSIONS.PAGE_MANAGE },
      { href: "/admin/galeria", label: "Galería Fotográfica", permission: PERMISSIONS.MEDIA_MANAGE },
      { href: "/admin/textos", label: "Textos del sitio", permission: PERMISSIONS.SETTINGS_MANAGE },
      { href: "/admin/paginas", label: "Otras páginas", permission: PERMISSIONS.PAGE_MANAGE },
    ],
  },
  {
    title: "Viajes",
    items: [
      { href: "/admin/expediciones", label: "Viajes y categorías", permission: PERMISSIONS.EXPEDITION_READ },
      { href: "/admin/calendario", label: "Calendario", permission: PERMISSIONS.EXPEDITION_READ },
    ],
  },
  {
    title: "Consultas y reseñas",
    items: [
      // Recibe las consultas del formulario de Viajes a Medida.
      { href: "/admin/consultas", label: "Consultas", permission: PERMISSIONS.INQUIRY_READ },
      { href: "/admin/testimonios", label: "Testimonios", permission: PERMISSIONS.CONTENT_MODERATE },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/admin/configuracion", label: "Configuración y contacto", permission: PERMISSIONS.SETTINGS_MANAGE },
      { href: "/admin/estadisticas", label: "Estadísticas", permission: PERMISSIONS.STATS_VIEW },
      { href: "/admin/usuarios", label: "Usuarios", permission: PERMISSIONS.USER_MANAGE },
    ],
  },
];

export function AdminSidebar({
  user,
  siteName,
}: {
  user: { name?: string | null; role: Role; permissions: string[] };
  siteName: string;
}) {
  const pathname = usePathname();

  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => !item.permission || hasPermission(user, item.permission)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/admin/dashboard" className="font-display text-xl font-semibold leading-tight text-white">
          {siteName}
        </Link>
        <p className="mt-1 text-xs text-stone-400">Panel de administración</p>
      </div>

      <nav aria-label="Panel" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              {g.title}
            </p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "text-stone-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm font-medium text-white">{user.name ?? "Usuario"}</p>
        <p className="text-xs text-stone-400">{ROLE_LABELS[user.role] ?? user.role}</p>
      </div>
    </div>
  );
}
