"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/cn";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";

type NavItem = {
  href: string;
  label: string;
  permission?: Permission;
};

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/expediciones", label: "Expediciones", permission: PERMISSIONS.EXPEDITION_READ },
  { href: "/admin/destinos", label: "Destinos", permission: PERMISSIONS.DESTINATION_MANAGE },
  { href: "/admin/guias", label: "Guías", permission: PERMISSIONS.GUIDE_MANAGE },
  { href: "/admin/reservas", label: "Reservas", permission: PERMISSIONS.RESERVATION_READ },
  { href: "/admin/consultas", label: "Consultas / CRM", permission: PERMISSIONS.INQUIRY_READ },
];

// Módulos previstos por el brief que se irán habilitando (no son enlaces falsos).
const UPCOMING = ["Media Library", "Testimonios", "Estadísticas", "Usuarios"];

export function AdminSidebar({
  user,
}: {
  user: { name?: string | null; role: Role; permissions: string[] };
}) {
  const pathname = usePathname();

  const visible = NAV.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/admin/dashboard" className="font-display text-xl font-semibold text-white">
          Cumbre
        </Link>
        <p className="mt-1 text-xs text-stone-400">Panel de administración</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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

        <p className="px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Próximamente
        </p>
        {UPCOMING.map((label) => (
          <span
            key={label}
            className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-stone-600"
          >
            {label}
          </span>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm font-medium text-white">{user.name ?? "Usuario"}</p>
        <p className="text-xs text-stone-400">{user.role}</p>
      </div>
    </div>
  );
}
