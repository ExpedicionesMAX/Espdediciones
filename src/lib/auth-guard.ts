import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";

/**
 * Usuario de la sesión, verificado contra la base en cada request.
 * La sesión es un JWT que dura semanas: sin esta verificación, un usuario
 * desactivado (o al que se le quitó un rol/permiso) seguiría operando hasta
 * que venciera su token. Rol y permisos salen siempre de la base.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id) return null;

  const fresh = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, role: true, permissions: true, active: true },
  });
  if (!fresh || !fresh.active) return null;

  return {
    ...sessionUser,
    name: fresh.name,
    email: fresh.email,
    role: fresh.role,
    permissions: fresh.permissions,
  };
});

/** Requiere sesión. Redirige al login si no hay usuario (o si fue desactivado). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    // Si había un token pero el usuario ya no es válido, el login no debe
    // rebotar al panel (evita un bucle de redirecciones).
    const session = await auth();
    redirect(session?.user ? "/admin/login?sesion=vencida" : "/admin/login");
  }
  return user;
}

/** Requiere un permiso concreto. Redirige al dashboard si no lo tiene. */
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!hasPermission(user, permission)) {
    redirect("/admin/dashboard?error=forbidden");
  }
  return user;
}
