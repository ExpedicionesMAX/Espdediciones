import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const nav = { name: user.name, role: user.role, permissions: user.permissions };

  const mobileLinks = [
    { href: "/admin/dashboard", label: "Dashboard", show: true },
    {
      href: "/admin/expediciones",
      label: "Expediciones",
      show: hasPermission(user, PERMISSIONS.EXPEDITION_READ),
    },
    {
      href: "/admin/destinos",
      label: "Destinos",
      show: hasPermission(user, PERMISSIONS.DESTINATION_MANAGE),
    },
    {
      href: "/admin/guias",
      label: "Guías",
      show: hasPermission(user, PERMISSIONS.GUIDE_MANAGE),
    },
    {
      href: "/admin/paginas",
      label: "Páginas",
      show: hasPermission(user, PERMISSIONS.PAGE_MANAGE),
    },
    {
      href: "/admin/reservas",
      label: "Reservas",
      show: hasPermission(user, PERMISSIONS.RESERVATION_READ),
    },
    {
      href: "/admin/crm",
      label: "CRM",
      show: hasPermission(user, PERMISSIONS.CRM_READ),
    },
    {
      href: "/admin/consultas",
      label: "Consultas",
      show: hasPermission(user, PERMISSIONS.INQUIRY_READ),
    },
    {
      href: "/admin/testimonios",
      label: "Testimonios",
      show: hasPermission(user, PERMISSIONS.CONTENT_MODERATE),
    },
    {
      href: "/admin/estadisticas",
      label: "Stats",
      show: hasPermission(user, PERMISSIONS.STATS_VIEW),
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      show: hasPermission(user, PERMISSIONS.USER_MANAGE),
    },
    {
      href: "/admin/configuracion",
      label: "Config",
      show: hasPermission(user, PERMISSIONS.SETTINGS_MANAGE),
    },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">
        <AdminSidebar user={nav} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <Link href="/" target="_blank" className="text-sm text-stone-500 hover:text-ink">
            Ver sitio ↗
          </Link>
          <LogoutButton />
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2 lg:hidden">
          {mobileLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
