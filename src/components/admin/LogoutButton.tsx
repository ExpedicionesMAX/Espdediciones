"use client";

import { logoutAction } from "@/server/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-stone-500 hover:text-ink"
      >
        Salir
      </button>
    </form>
  );
}
