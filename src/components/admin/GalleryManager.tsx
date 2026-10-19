"use client";

import { useRef, useState } from "react";
import {
  addGalleryPhotos,
  deleteGalleryPhoto,
  reorderGalleryPhotos,
  setGalleryPhotoPublished,
  updateGalleryPhoto,
  type AdminGalleryPhoto,
} from "@/server/actions/gallery";
import { uploadPhoto, type UploadedPhoto } from "@/lib/upload-client";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

type Draft = { title: string; description: string; alt: string };
type Filter = "all" | "published" | "draft";

/** Copia del objeto sin la clave indicada. */
function without<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const next = { ...obj };
  delete next[key];
  return next;
}

const draftOf = (p: AdminGalleryPhoto): Draft => ({
  title: p.title ?? "",
  description: p.description ?? "",
  alt: p.alt ?? "",
});

export function GalleryManager({ initial }: { initial: AdminGalleryPhoto[] }) {
  const [photos, setPhotos] = useState(initial);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirtyIds = Object.keys(drafts).filter((id) => {
    const p = photos.find((x) => x.id === id);
    return p && JSON.stringify(drafts[id]) !== JSON.stringify(draftOf(p));
  });
  useUnsavedChanges(dirtyIds.length > 0 || uploading !== null);

  const publishedCount = photos.filter((p) => p.published).length;
  const visible = photos.filter((p) =>
    filter === "all" ? true : filter === "published" ? p.published : !p.published,
  );
  const say = (kind: "ok" | "error" | "info", text: string) => setStatus({ kind, text });
  const setBusyFor = (id: string, v: boolean) => setBusy((b) => ({ ...b, [id]: v }));

  // ── Subida (varias a la vez) ──
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length === 0) return;
    setStatus(null);
    const ok: UploadedPhoto[] = [];
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploading(`Subiendo ${i + 1} de ${files.length}…`);
      const res = await uploadPhoto(files[i], "galeria");
      if (res.ok) ok.push(res.photo);
      else failed.push(`${files[i].name}: ${res.error}`);
    }
    if (ok.length > 0) {
      setUploading("Guardando…");
      const saved = await addGalleryPhotos(ok);
      if (saved.ok && saved.data) {
        setPhotos((prev) => [...prev, ...saved.data!]);
      } else {
        failed.push(saved.ok ? "No se pudieron registrar las fotos." : saved.error);
      }
    }
    setUploading(null);
    if (failed.length > 0) {
      say("error", `Algunas fotos no se subieron:\n${failed.join("\n")}`);
    } else {
      say("ok", `${ok.length} foto(s) subida(s) como borrador. Completá sus datos y publicalas cuando quieras.`);
    }
  }

  // ── Textos ──
  async function saveTexts(p: AdminGalleryPhoto) {
    const d = drafts[p.id];
    if (!d) return;
    setBusyFor(p.id, true);
    const res = await updateGalleryPhoto({ id: p.id, ...d });
    setBusyFor(p.id, false);
    if (res.ok && res.data) {
      setPhotos((prev) => prev.map((x) => (x.id === p.id ? res.data! : x)));
      setDrafts((x) => without(x, p.id));
      say("ok", "Datos de la foto guardados.");
    } else {
      say("error", res.ok ? "No se pudo guardar." : res.error);
    }
  }

  // ── Publicar / borrador ──
  async function togglePublished(p: AdminGalleryPhoto) {
    setBusyFor(p.id, true);
    const res = await setGalleryPhotoPublished(p.id, !p.published);
    setBusyFor(p.id, false);
    if (res.ok && res.data) {
      setPhotos((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: res.data!.published } : x)));
      say("ok", res.data.published ? "Foto publicada: ya se ve en la galería." : "Foto pasada a borrador: ya no se ve en el sitio.");
    } else {
      say("error", res.ok ? "No se pudo cambiar el estado." : res.error);
    }
  }

  // ── Eliminar ──
  async function remove(p: AdminGalleryPhoto) {
    const name = p.title ? `«${p.title}»` : "esta foto";
    if (!window.confirm(`¿Eliminar ${name} de la galería?\n\nEsta acción no se puede deshacer.`)) return;
    setBusyFor(p.id, true);
    const res = await deleteGalleryPhoto(p.id);
    setBusyFor(p.id, false);
    if (res.ok) {
      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
      setDrafts((x) => without(x, p.id));
      say("ok", "Foto eliminada.");
    } else {
      say("error", res.error);
    }
  }

  // ── Orden (flechas o arrastrar) ──
  async function applyOrder(next: AdminGalleryPhoto[]) {
    const prev = photos;
    setPhotos(next); // optimista; se revierte si el servidor falla
    const res = await reorderGalleryPhotos(next.map((p) => p.id));
    if (!res.ok) {
      setPhotos(prev);
      say("error", res.error);
    } else {
      say("ok", "Orden guardado.");
    }
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = photos.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    void applyOrder(next);
  };
  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = photos.filter((p) => p.id !== dragId);
    const dragged = photos.find((p) => p.id === dragId)!;
    next.splice(next.findIndex((p) => p.id === targetId), 0, dragged);
    setDragId(null);
    void applyOrder(next);
  };
  const canReorder = filter === "all";

  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <div>
          <p className="text-sm text-stone-600">
            <strong className="text-ink">{photos.length}</strong> fotos ·{" "}
            <span className="text-emerald-700">{publishedCount} publicadas</span> ·{" "}
            <span className="text-amber-700">{photos.length - publishedCount} en borrador</span>
          </p>
          <div className="mt-3 flex gap-2" role="group" aria-label="Filtrar fotos">
            {(
              [
                ["all", "Todas"],
                ["published", "Publicadas"],
                ["draft", "Borradores"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === key ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={onFiles} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading !== null}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {uploading ?? "+ Subir fotos"}
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {status && (
          <p
            role={status.kind === "error" ? "alert" : undefined}
            className={`whitespace-pre-line rounded-lg px-4 py-3 text-sm ${status.kind === "error" ? "bg-red-50 text-red-700" : status.kind === "ok" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"}`}
          >
            {status.text}
          </p>
        )}
      </div>

      {!canReorder && photos.length > 1 && (
        <p className="text-xs text-stone-500">Para cambiar el orden, elegí el filtro «Todas».</p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-500">
          {photos.length === 0
            ? "Todavía no hay fotos. Subí las primeras con el botón «Subir fotos»."
            : "No hay fotos con este filtro."}
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const d = drafts[p.id] ?? draftOf(p);
            const dirty = dirtyIds.includes(p.id);
            const index = photos.findIndex((x) => x.id === p.id);
            return (
              <li
                key={p.id}
                draggable={canReorder}
                onDragStart={() => setDragId(p.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => canReorder && e.preventDefault()}
                onDrop={() => canReorder && dropOn(p.id)}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${dragId === p.id ? "border-accent opacity-60" : "border-stone-200"}`}
              >
                <div className="relative aspect-[4/3] bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.alt ?? ""} loading="lazy" className="h-full w-full object-cover" />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${p.published ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"}`}
                  >
                    {p.published ? "Publicada" : "Borrador"}
                  </span>
                  {canReorder && (
                    <span className="absolute right-3 top-3 cursor-grab rounded-full bg-black/50 px-2 py-1 text-xs text-white" title="Arrastrá para ordenar">
                      ⠿ #{index + 1}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <label className="text-xs font-medium text-stone-500" htmlFor={`t-${p.id}`}>Título (opcional)</label>
                  <input id={`t-${p.id}`} value={d.title} maxLength={150} onChange={(e) => setDrafts((x) => ({ ...x, [p.id]: { ...d, title: e.target.value } }))} className={inputCls} />
                  <label className="text-xs font-medium text-stone-500" htmlFor={`a-${p.id}`}>Texto alternativo (qué se ve en la foto)</label>
                  <input id={`a-${p.id}`} value={d.alt} maxLength={250} onChange={(e) => setDrafts((x) => ({ ...x, [p.id]: { ...d, alt: e.target.value } }))} className={inputCls} placeholder="Ej.: Laguna al amanecer con montañas nevadas" />
                  <label className="text-xs font-medium text-stone-500" htmlFor={`d-${p.id}`}>Descripción (opcional)</label>
                  <textarea id={`d-${p.id}`} value={d.description} maxLength={1500} rows={2} onChange={(e) => setDrafts((x) => ({ ...x, [p.id]: { ...d, description: e.target.value } }))} className={inputCls} />
                  {!d.alt && <p className="text-xs text-amber-700">Recomendado: completá el texto alternativo (accesibilidad y Google).</p>}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => saveTexts(p)}
                      disabled={!dirty || busy[p.id]}
                      className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {busy[p.id] && dirty ? "Guardando…" : dirty ? "Guardar datos" : "Guardado"}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublished(p)}
                      disabled={busy[p.id]}
                      className="rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ring-stone-300 hover:bg-stone-100 disabled:opacity-40"
                    >
                      {p.published ? "Pasar a borrador" : "Publicar"}
                    </button>
                    <span className="ml-auto flex items-center">
                      <button type="button" onClick={() => move(p.id, -1)} disabled={!canReorder || index === 0} className="px-2 text-stone-500 hover:text-ink disabled:opacity-30" aria-label="Mover antes">↑</button>
                      <button type="button" onClick={() => move(p.id, 1)} disabled={!canReorder || index === photos.length - 1} className="px-2 text-stone-500 hover:text-ink disabled:opacity-30" aria-label="Mover después">↓</button>
                      <button type="button" onClick={() => remove(p)} disabled={busy[p.id]} className="px-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40">
                        Eliminar
                      </button>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
