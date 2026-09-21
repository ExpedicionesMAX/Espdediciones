"use client";

import { useActionState } from "react";
import type { Role } from "@prisma/client";
import { createUser, type UserFormState } from "@/server/actions/users";
import { ROLE_LABELS, ROLE_HINTS } from "@/lib/role-labels";
import { ROLES } from "@/lib/validations/user";

const initial: UserFormState = { ok: false };

const labelCls = "mb-1 block text-sm font-medium text-ink";
const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function UserCreateForm() {
  const [state, formAction, pending] = useActionState(createUser, initial);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>Email *</label>
          <input id="email" name="email" type="email" required className={inputCls} />
          {err("email") && <p className="mt-1 text-xs text-red-600">{err("email")}</p>}
        </div>
        <div>
          <label htmlFor="name" className={labelCls}>Nombre</label>
          <input id="name" name="name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="role" className={labelCls}>Rol</label>
          <select id="role" name="role" defaultValue="EDITOR" className={inputCls}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r as Role]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="password" className={labelCls}>Contraseña inicial</label>
          <input id="password" name="password" type="text" required minLength={8} className={inputCls} placeholder="mínimo 8 caracteres" />
          {err("password") && <p className="mt-1 text-xs text-red-600">{err("password")}</p>}
        </div>
      </div>

      <ul className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
        {ROLES.map((r) => (
          <li key={r}>
            <span className="font-medium text-stone-700">{ROLE_LABELS[r as Role]}:</span>{" "}
            {ROLE_HINTS[r as Role]}
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
