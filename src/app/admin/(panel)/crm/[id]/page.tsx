import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { STAGE_LABELS, STAGE_STYLES, STAGE_ORDER } from "@/lib/crm-labels";
import {
  updateContactStage,
  addContactNote,
  updateContactMeta,
} from "@/server/actions/crm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ficha de contacto" };

const ACTIVITY_ICON: Record<string, string> = {
  note: "📝",
  stage: "➡️",
  inquiry: "✉️",
  reservation: "🧗",
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.CRM_READ);
  const { id } = await params;
  const canManage = hasPermission(user, PERMISSIONS.CRM_MANAGE);

  const contact = await prisma.cRMContact.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true } } },
      },
      inquiries: {
        orderBy: { createdAt: "desc" },
        include: { expedition: { select: { name: true, slug: true } } },
      },
      reservations: {
        orderBy: { createdAt: "desc" },
        include: { expedition: { select: { name: true, slug: true } } },
      },
    },
  });
  if (!contact) notFound();

  const inputCls =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/crm" className="text-sm text-stone-500 hover:text-ink">
        ← CRM
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {contact.name ?? contact.email}
        </h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_STYLES[contact.stage]}`}>
          {STAGE_LABELS[contact.stage]}
        </span>
      </div>
      <p className="mt-1 text-stone-500">
        <a href={`mailto:${contact.email}`} className="hover:text-accent">{contact.email}</a>
        {contact.phone ? ` · ${contact.phone}` : ""}
        {contact.city || contact.country ? ` · ${[contact.city, contact.country].filter(Boolean).join(", ")}` : ""}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Columna principal: historial */}
        <div className="space-y-8">
          {/* Inscripciones */}
          {contact.reservations.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-ink">Inscripciones</h2>
              <div className="mt-3 space-y-2">
                {contact.reservations.map((r) => (
                  <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Link href={`/expediciones/${r.expedition.slug}`} target="_blank" className="font-medium text-ink hover:text-accent">
                        {r.expedition.name}
                      </Link>
                      <span className="text-xs text-stone-400">{formatDate(r.createdAt, { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-xs text-stone-500">Estado: {r.status}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Consultas */}
          {contact.inquiries.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-ink">Consultas</h2>
              <div className="mt-3 space-y-2">
                {contact.inquiries.map((q) => (
                  <div key={q.id} className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">
                        {q.expedition ? q.expedition.name : "Consulta general"}
                      </span>
                      <span className="text-xs text-stone-400">{formatDate(q.createdAt, { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-stone-600">{q.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Historial */}
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Historial</h2>
            {canManage && (
              <form action={addContactNote} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={contact.id} />
                <input name="note" placeholder="Agregar una nota…" className={inputCls} />
                <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
                  Nota
                </button>
              </form>
            )}
            <ul className="mt-4 space-y-3 border-l border-stone-200 pl-5">
              {contact.activities.length === 0 ? (
                <li className="text-sm text-stone-500">Sin actividad todavía.</li>
              ) : (
                contact.activities.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[27px] top-1 text-xs">{ACTIVITY_ICON[a.type] ?? "•"}</span>
                    <p className="text-sm text-ink">{a.note ?? a.type}</p>
                    <p className="text-xs text-stone-400">
                      {a.user?.name ? `${a.user.name} · ` : ""}
                      {formatDate(a.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* Sidebar: gestión */}
        <aside className="space-y-6">
          {canManage ? (
            <>
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-ink">Etapa del embudo</h3>
                <form action={updateContactStage} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={contact.id} />
                  <select name="stage" defaultValue={contact.stage} className={inputCls}>
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                  <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
                    Actualizar etapa
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-ink">Etiquetas y notas</h3>
                <form action={updateContactMeta} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={contact.id} />
                  <div>
                    <label className="mb-1 block text-xs text-stone-500">Etiquetas (separadas por coma)</label>
                    <input name="tags" defaultValue={contact.tags.join(", ")} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-stone-500">Notas internas</label>
                    <textarea name="notes" rows={4} defaultValue={contact.notes ?? ""} className={inputCls} />
                  </div>
                  <button className="w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
                    Guardar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500">
              {contact.tags.length > 0 && (
                <p className="mb-2">Etiquetas: {contact.tags.join(", ")}</p>
              )}
              {contact.notes && <p className="whitespace-pre-line">{contact.notes}</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
