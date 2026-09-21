import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { UserEditForm } from "@/components/admin/UserEditForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar usuario" };

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; pwd?: string }>;
}) {
  const admin = await requirePermission(PERMISSIONS.USER_MANAGE);
  const { id } = await params;
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/usuarios" className="text-sm text-stone-500 hover:text-ink">← Usuarios</Link>
      <h1 className="mb-1 mt-2 font-display text-3xl font-semibold text-ink">{user.name ?? user.email}</h1>
      <p className="mb-6 text-stone-500">{user.email}</p>

      {sp.saved && <p className="mb-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Cambios guardados.</p>}
      {sp.pwd && <p className="mb-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Contraseña actualizada.</p>}

      <UserEditForm
        values={{ id: user.id, name: user.name ?? "", role: user.role, active: user.active }}
        isSelf={user.id === admin.id}
      />
    </div>
  );
}
