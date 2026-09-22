import Link from "next/link";
import { prisma } from "@/lib/prisma";

/** Campana del header: enlaza a /admin/notificaciones y muestra los sin leer. */
export async function NotificationBell() {
  const count = await prisma.notification
    .count({ where: { read: false } })
    .catch(() => 0);

  return (
    <Link
      href="/admin/notificaciones"
      aria-label={`Notificaciones${count > 0 ? `, ${count} sin leer` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
