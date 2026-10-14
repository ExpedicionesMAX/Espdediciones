import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guard";
import { getSiteSettings } from "@/lib/site";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Ingresar al panel" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  // Verificado contra la base: un usuario desactivado no vuelve a entrar al panel.
  const [user, settings, sp] = await Promise.all([getCurrentUser(), getSiteSettings(), searchParams]);
  if (user) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center font-display text-2xl font-semibold text-white"
        >
          {settings.siteName}
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="font-display text-xl font-semibold text-ink">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Ingresá con tu cuenta.
          </p>
          {sp.sesion === "vencida" && (
            <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Tu sesión ya no es válida. Volvé a ingresar.
            </p>
          )}
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-stone-400">
          <Link href="/" className="hover:text-white">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
