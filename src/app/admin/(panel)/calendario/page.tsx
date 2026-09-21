import Link from "next/link";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendario" };

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  await requirePermission(PERMISSIONS.EXPEDITION_READ);
  const sp = await searchParams;

  const now = new Date();
  const year = Number(sp.y) || now.getFullYear();
  const month = sp.m ? Number(sp.m) - 1 : now.getMonth(); // 0-based

  const monthStart = new Date(year, month, 1);
  const startWeekday = (monthStart.getDay() + 6) % 7; // 0 = lunes
  const gridStart = new Date(year, month, 1 - startWeekday);
  const cells = Array.from({ length: 42 }, (_, i) =>
    new Date(year, month, 1 - startWeekday + i),
  );
  const gridEndInclusive = new Date(
    year,
    month,
    1 - startWeekday + 41,
    23,
    59,
    59,
  );

  const [expeditions, undated] = await Promise.all([
    prisma.expedition.findMany({
      where: { startDate: { gte: gridStart, lte: gridEndInclusive } },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, status: true, startDate: true },
    }),
    prisma.expedition.count({
      where: { startDate: null, status: { notIn: ["ARCHIVED", "CANCELLED"] } },
    }),
  ]);

  const byDay = new Map<string, typeof expeditions>();
  for (const e of expeditions) {
    if (!e.startDate) continue;
    const k = dayKey(new Date(e.startDate));
    const arr = byDay.get(k) ?? [];
    arr.push(e);
    byDay.set(k, arr);
  }

  const rawMonthLabel = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(monthStart);
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);

  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  const href = (d: Date) => `/admin/calendario?y=${d.getFullYear()}&m=${d.getMonth() + 1}`;
  const todayKey = dayKey(now);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Calendario</h1>
          <p className="mt-1 text-stone-500">Tus expediciones por fecha de inicio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={href(prevDate)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" aria-label="Mes anterior">←</Link>
          <Link href="/admin/calendario" className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100">Hoy</Link>
          <Link href={href(nextDate)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" aria-label="Mes siguiente">→</Link>
        </div>
      </div>

      <p className="mt-6 font-display text-xl font-semibold text-ink">{monthLabel}</p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50 text-center text-xs font-medium uppercase tracking-wide text-stone-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const inMonth = d.getMonth() === month;
            const isToday = dayKey(d) === todayKey;
            const items = byDay.get(dayKey(d)) ?? [];
            return (
              <div
                key={i}
                className={`min-h-[92px] border-b border-r border-stone-100 p-1.5 ${inMonth ? "bg-white" : "bg-stone-50/60"}`}
              >
                <div className="flex justify-end">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-accent font-semibold text-white" : inMonth ? "text-stone-600" : "text-stone-300"}`}>
                    {d.getDate()}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {items.map((e) => (
                    <Link
                      key={e.id}
                      href={`/admin/expediciones/${e.id}`}
                      title={`${e.name} — ${STATUS_LABELS[e.status]}`}
                      className={`block truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[e.status]}`}
                    >
                      {e.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undated > 0 && (
        <p className="mt-4 text-sm text-stone-500">
          Hay <strong>{undated}</strong> expedición{undated === 1 ? "" : "es"} sin fecha de inicio.{" "}
          <Link href="/admin/expediciones" className="text-accent hover:underline">Verlas</Link>.
        </p>
      )}
    </div>
  );
}
