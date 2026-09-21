import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Ingresar al panel" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center font-display text-2xl font-semibold text-white"
        >
          Cumbre
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="font-display text-xl font-semibold text-ink">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Ingresá con tu cuenta.
          </p>
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
