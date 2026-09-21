"use client";

import { useActionState } from "react";
import type { Role } from "@prisma/client";
import {
  updateUser,
  resetUserPassword,
  type UserFormState,
} from "@/server/actions/users";
import { ROLE_LABELS } from "@/lib/role-labels";
import { ROLES } from "@/lib/validations/user";

const initial: UserFormState = { ok: false };

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:bg-stone-100 disabled:text-stone-400";

export function UserEditForm({
  values,
  isSelf,
}: {
  values: { id: string; name: string; role: Role; active: boolean };
  isSelf: boolean;
}) {
  const [uState, updateAction, uPending] = useActionState(updateUser, initial);
  const [pState, pwdAction, pPending] = useActionState(resetUserPassword, initial);

  return (
    <div className="max-w-xl space-y-8">
      <form action={updateAction} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Datos y rol</h2>
        <input type="hidden" name="id" value={values.id} />
        {uState.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{uState.error}</p>}

        <div>
          <label htmlFor="name" className={labelCls}>Nombre</label>
          <input id="name" name="name" defaultValue={values.name} className={inputCls} />
        </div>
        <div>
          <label htmlFor="role" className={labelCls}>Rol</label>
          <select id="role" name="role" defaultValue={values.role} disabled={isSelf} className={inputCls}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r as Role]}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="active" defaultChecked={values.active} disabled={isSelf} className="h-4 w-4 rounded border-stone-300" />
          Usuario activo (puede ingresar)
        </label>
        {isSelf && (
          <p className="text-xs text-stone-500">
            No podés cambiar tu propio rol ni desactivarte (para evitar quedar afuera).
          </p>
        )}

        <button
          type="submit"
          disabled={uPending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {uPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <form action={pwdAction} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Cambiar contraseña</h2>
        <input type="hidden" name="id" value={values.id} />
        {pState.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pState.error}</p>}
        <div>
          <label htmlFor="password" className={labelCls}>Nueva contraseña</label>
          <input id="password" name="password" type="text" minLength={8} required className={inputCls} placeholder="mínimo 8 caracteres" />
          {pState.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-600">{pState.fieldErrors.password[0]}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pPending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {pPending ? "Cambiando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
