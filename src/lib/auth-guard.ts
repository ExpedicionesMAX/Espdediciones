import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Requiere sesión. Redirige al login si no hay usuario. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
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
