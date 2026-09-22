import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/actions/notifications";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notificaciones" };

const TYPE_META: Record<string, { label: string; style: string }> = {
  inquiry: { label: "Consulta", style: "bg-sky-100 text-sky-800" },
  reservation: { label: "Inscripción", style: "bg-emerald-100 text-emerald-800" },
  testimonial: { label: "Testimonio", style: "bg-amber-100 text-amber-900" },
};

export default async function NotificationsPage() {
  await requireUser();

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Notificaciones
          </h1>
          <p className="mt-1 text-stone-500">
            Todo lo que entra desde el sitio queda acá adentro. No depende de
            ningún correo externo.
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
              Marcar todas como leídas ({unread})
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
            No hay notificaciones todavía.
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? {
              label: n.type,
              style: "bg-stone-200 text-stone-700",
            };
            return (
              <div
                key={n.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  n.read
                    ? "border-stone-200 bg-white"
                    : "border-accent/30 bg-accent/5"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.style}`}
                      >
                        {meta.label}
                      </span>
                      {!n.read && (
                        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                      )}
                    </div>
                    <p className="mt-2 font-medium text-ink">{n.title}</p>
                    {n.message && (
                      <p className="text-sm text-stone-600">{n.message}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">
                    {formatDate(n.createdAt, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      Ver detalle →
                    </Link>
                  )}
                  {!n.read && (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="text-sm text-stone-500 hover:text-ink">
                        Marcar como leída
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
