import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS, ROLE_STYLES } from "@/lib/role-labels";
import { UserCreateForm } from "@/components/admin/UserCreateForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usuarios" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const admin = await requirePermission(PERMISSIONS.USER_MANAGE);
  const sp = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Usuarios</h1>
      <p className="mt-1 text-stone-500">Tu equipo y sus roles. Cada rol define qué puede hacer.</p>

      {sp.created && (
        <p className="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Usuario creado.</p>
      )}

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Nuevo usuario</h2>
        <div className="mt-4">
          <UserCreateForm />
        </div>
      </section>

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {u.name ?? u.email}
                      {u.id === admin.id && <span className="ml-2 text-xs text-stone-400">(vos)</span>}
                    </p>
                    {u.name && <p className="text-xs text-stone-400">{u.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="text-xs font-medium text-emerald-700">Activo</span>
                    ) : (
                      <span className="text-xs font-medium text-stone-400">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/usuarios/${u.id}`} className="text-sm font-medium text-accent hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
