import Link from "next/link";
import type { ActivityType, ExpeditionStatus, Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  formatDateRange,
} from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendario" };

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ACTIVITIES = Object.keys(ACTIVITY_LABELS) as ActivityType[];
const STATUSES = Object.keys(STATUS_LABELS) as ExpeditionStatus[];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function atMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function eachDay(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const d = atMidnight(start);
  const last = atMidnight(end);
  while (d <= last) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

type CalExp = {
  id: string;
  name: string;
  status: ExpeditionStatus;
  startDate: Date | null;
  endDate: Date | null;
  capacity: number | null;
  spotsTaken: number;
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; actividad?: string; estado?: string }>;
}) {
  await requirePermission(PERMISSIONS.EXPEDITION_READ);
  const sp = await searchParams;

  const now = new Date();
  const year = Number(sp.y) || now.getFullYear();
  const month = sp.m ? Number(sp.m) - 1 : now.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEndInclusive = new Date(year, month + 1, 0, 23, 59, 59);
  const startWeekday = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startWeekday);
  const cells = Array.from({ length: 42 }, (_, i) =>
    new Date(year, month, 1 - startWeekday + i),
  );
  const gridEndInclusive = new Date(year, month, 1 - startWeekday + 41, 23, 59, 59);

  // Filtros
  const activity =
    sp.actividad && ACTIVITIES.includes(sp.actividad as ActivityType)
      ? (sp.actividad as ActivityType)
      : undefined;
  const status =
    sp.estado && STATUSES.includes(sp.estado as ExpeditionStatus)
      ? (sp.estado as ExpeditionStatus)
      : undefined;

  const filters: Prisma.ExpeditionWhereInput = {};
  if (activity) filters.activityType = activity;
  if (status) filters.status = status;

  const expeditions: CalExp[] = await prisma.expedition.findMany({
    where: {
      AND: [
        { startDate: { not: null, lte: gridEndInclusive } },
        {
          OR: [
            { endDate: { gte: gridStart } },
            { AND: [{ endDate: null }, { startDate: { gte: gridStart } }] },
          ],
        },
        filters,
      ],
    },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      capacity: true,
      spotsTaken: true,
    },
  });

  // Mapa día -> {exp, isStart}
  const byDay = new Map<string, { exp: CalExp; isStart: boolean }[]>();
  for (const e of expeditions) {
    if (!e.startDate) continue;
    const start = e.startDate;
    const end = e.endDate ?? e.startDate;
    for (const d of eachDay(start, end)) {
      if (d < gridStart || d > gridEndInclusive) continue;
      const k = dayKey(d);
      const arr = byDay.get(k) ?? [];
      arr.push({ exp: e, isStart: dayKey(d) === dayKey(start) });
      byDay.set(k, arr);
    }
  }

  // Agenda del mes (por fecha de inicio dentro del mes)
  const agenda = expeditions.filter(
    (e) => e.startDate && e.startDate >= monthStart && e.startDate <= monthEndInclusive,
  );

  const rawMonthLabel = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(monthStart);
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);

  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  const qp = (extra: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (activity) params.set("actividad", activity);
    if (status) params.set("estado", status);
    for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v);
    const s = params.toString();
    return `/admin/calendario${s ? `?${s}` : ""}`;
  };
  const monthHref = (d: Date) =>
    qp({ y: String(d.getFullYear()), m: String(d.getMonth() + 1) });
  const todayKey = dayKey(now);
  const selectCls =
    "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Calendario</h1>
          <p className="mt-1 text-stone-500">Tus expediciones y sus fechas, mes a mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={monthHref(prevDate)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" aria-label="Mes anterior">←</Link>
          <Link href={qp({ y: String(now.getFullYear()), m: String(now.getMonth() + 1) })} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100">Hoy</Link>
          <Link href={monthHref(nextDate)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" aria-label="Mes siguiente">→</Link>
        </div>
      </div>

      {/* Filtros */}
      <form method="get" className="mt-5 flex flex-wrap items-center gap-2">
        <input type="hidden" name="y" value={year} />
        <input type="hidden" name="m" value={month + 1} />
        <select name="actividad" defaultValue={activity ?? ""} className={selectCls}>
          <option value="">Toda actividad</option>
          {ACTIVITIES.map((a) => (
            <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
          ))}
        </select>
        <select name="estado" defaultValue={status ?? ""} className={selectCls}>
          <option value="">Todo estado</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark">Filtrar</button>
        {(activity || status) && (
          <Link href={`/admin/calendario?y=${year}&m=${month + 1}`} className="px-2 text-sm text-stone-500 hover:text-ink">Limpiar</Link>
        )}
      </form>

      <p className="mt-5 font-display text-xl font-semibold text-ink">{monthLabel}</p>

      {/* Grilla */}
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
              <div key={i} className={`min-h-[96px] border-b border-r border-stone-100 p-1.5 ${inMonth ? "bg-white" : "bg-stone-50/60"}`}>
                <div className="flex justify-end">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-accent font-semibold text-white" : inMonth ? "text-stone-600" : "text-stone-300"}`}>
                    {d.getDate()}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {items.map(({ exp, isStart }, j) =>
                    isStart ? (
                      <Link
                        key={`${exp.id}-${j}`}
                        href={`/admin/expediciones/${exp.id}`}
                        title={`${exp.name} — ${STATUS_LABELS[exp.status]}`}
                        className={`block truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[exp.status]}`}
                      >
                        {exp.name}
                      </Link>
                    ) : (
                      <div
                        key={`${exp.id}-${j}`}
                        title={`${exp.name} (continúa)`}
                        className={`h-1.5 rounded ${STATUS_STYLES[exp.status]}`}
                      />
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
        {STATUSES.filter((s) => s !== "ARCHIVED").map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ${STATUS_STYLES[s]}`} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Agenda del mes */}
      <h2 className="mt-10 font-display text-xl font-semibold text-ink">Agenda de {monthLabel}</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {agenda.length === 0 ? (
          <p className="p-5 text-sm text-stone-500">No hay salidas este mes con los filtros actuales.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {agenda.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/expediciones/${e.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-stone-50">
                  <div>
                    <p className="font-medium text-ink">{e.name}</p>
                    <p className="text-xs text-stone-500">{formatDateRange(e.startDate, e.endDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-500">{e.capacity ? `${e.spotsTaken}/${e.capacity}` : "—"}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[e.status]}`}>{STATUS_LABELS[e.status]}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
