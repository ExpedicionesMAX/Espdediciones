"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import {
  createUserSchema,
  updateUserSchema,
  passwordSchema,
} from "@/lib/validations/user";

export type UserFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requirePermission(PERMISSIONS.USER_MANAGE);

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;
  const email = d.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "Ya existe un usuario con ese email.",
      fieldErrors: { email: ["Email en uso"] },
    };
  }

  const hashedPassword = await bcrypt.hash(d.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: d.name ?? null,
      role: d.role,
      hashedPassword,
      active: true,
    },
  });

  await logActivity({
    userId: admin.id,
    action: "create",
    entityType: "User",
    entityId: user.id,
    summary: `Creó el usuario ${email} (${d.role})`,
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?created=1");
}

export async function updateUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requirePermission(PERMISSIONS.USER_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return { ok: false, error: "Falta el identificador." };

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "El usuario no existe." };

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  // Protección contra auto-bloqueo: nadie puede cambiarse su propio rol ni desactivarse.
  const isSelf = id === admin.id;
  const role = isSelf ? existing.role : d.role;
  const active = isSelf ? true : d.active;

  await prisma.user.update({
    where: { id },
    data: { name: d.name ?? null, role, active },
  });

  await logActivity({
    userId: admin.id,
    action: "update",
    entityType: "User",
    entityId: id,
    summary: `Editó el usuario ${existing.email}`,
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
  redirect(`/admin/usuarios/${id}?saved=1`);
}

export async function resetUserPassword(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requirePermission(PERMISSIONS.USER_MANAGE);
  const id = formData.get("id")?.toString();
  if (!id) return { ok: false, error: "Falta el identificador." };

  const parsed = passwordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá la contraseña.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const existing = await prisma.user.update({
    where: { id },
    data: { hashedPassword },
    select: { email: true },
  });

  await logActivity({
    userId: admin.id,
    action: "update",
    entityType: "User",
    entityId: id,
    summary: `Cambió la contraseña de ${existing.email}`,
  });

  redirect(`/admin/usuarios/${id}?pwd=1`);
}
