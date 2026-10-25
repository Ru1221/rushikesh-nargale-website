"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface M { id: number; kind: string; filename: string; mime: string; size: number; title: string; alt: string; caption: string; description: string; category: string; status: string; external: boolean; url: string; thumb: string; created_at: string }

const fmt = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function xhrUpload(fd: FormData, onProgress: (p: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/api/admin/media");
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    x.onload = () => { let d: any = {}; try { d = JSON.parse(x.responseText); } catch {} if (x.status < 300) resolve(d); else reject(new Error(d.error || `Upload failed (${x.status})`)); };
    x.onerror = () => reject(new Error("Network error"));
    x.send(fd);
  });
}

export default function MediaManager({ kind }: { kind: "image" | "video" }) {
  const [items, setItems] = useState<M[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [edit, setEdit] = useState<M | null>(null);
  const [ext, setExt] = useState("");
  const replaceId = useRef<number | null>(null);
  const thumbId = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch(`/api/admin/media?kind=${kind}&q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`).then((r) => r.json()).then((d) => setItems(d.items || []));
  }, [kind, q, cat]);
  useEffect(load, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file); fd.append("kind", kind);
      if (replaceId.current) fd.append("replace", String(replaceId.current));
      if (thumbId.current) { fd.append("thumbFor", String(thumbId.current)); fd.set("kind", "image"); }
      setProgress(0); setMsg(null);
      try { await xhrUpload(fd, setProgress); setMsg({ ok: true, text: `Uploaded ${file.name}` }); }
      catch (e: any) { setMsg({ ok: false, text: e.message }); }
    }
    setProgress(null); replaceId.current = null; thumbId.current = null;
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function save(m: M) {
    await fetch("/api/admin/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) });
    setEdit(null); setMsg({ ok: true, text: "Saved" }); load();
  }

  async function remove(m: M) {
    const { usedBy } = await fetch(`/api/admin/media?usage=${m.id}`).then((r) => r.json());
    const warn = usedBy ? `WARNING: this file is used by ${usedBy} published item(s). Deleting it will break them.\n\n` : "";
    if (!confirm(`${warn}Delete "${m.title || m.filename}" permanently?`)) return;
    await fetch(`/api/admin/media?id=${m.id}`, { method: "DELETE" });
    setEdit(null); load();
  }

  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";
  const pick = (id: number | null, thumb = false) => { replaceId.current = thumb ? null : id; thumbId.current = thumb ? id : null; if (fileRef.current) { fileRef.current.accept = thumb ? "image/*" : accept; fileRef.current.click(); } };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input ref={fileRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => upload(e.target.files)} aria-label="Choose files" />
        <button className="btn btn-primary" onClick={() => pick(null)}>Upload {kind}s</button>
        <input className="input !w-56" placeholder="Search…" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="input !w-40" placeholder="Category" aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)} />
        {kind === "video" && (
          <form className="flex gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const r = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: ext }) });
            const d = await r.json(); setMsg({ ok: r.ok, text: r.ok ? "Embed added" : d.error }); if (r.ok) { setExt(""); load(); }
          }}>
            <input className="input !w-64" placeholder="YouTube or Vimeo URL" aria-label="External video URL" value={ext} onChange={(e) => setExt(e.target.value)} />
            <button className="btn btn-outline-dark">Add embed</button>
          </form>
        )}
        <p className="w-full text-xs text-slate-500">{kind === "image" ? "JPEG, PNG, WebP, GIF · up to 8 MB each." : "MP4, WebM, MOV · up to 40 MB each (stored in the database). For larger videos, add a YouTube/Vimeo link."}</p>
        {progress !== null && <div className="w-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs">Uploading… {progress}%</p></div>}
        {msg && <p role={msg.ok ? "status" : "alert"} className={`w-full text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
      </div>

      {items.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-slate-500">No {kind}s yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m) => (
          <li key={m.id} className="rounded-xl bg-white p-3 shadow-sm">
            {kind === "image" ? <img src={m.url} alt={m.alt} loading="lazy" className="aspect-video w-full rounded object-cover" /> :
              m.thumb ? <img src={m.thumb} alt="" className="aspect-video w-full rounded object-cover" /> : <div className="grid aspect-video place-items-center rounded bg-navy-800 text-3xl text-white" aria-hidden>▶</div>}
            <p className="mt-2 truncate text-sm font-medium">{m.title || m.filename}</p>
            <p className="text-xs text-slate-500">{m.external ? "External embed" : `${m.mime.split("/")[1]} · ${fmt(m.size)}`} · {m.status}</p>
            <p className="mt-1 break-all text-xs text-slate-400">{m.url}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <button className="btn btn-outline-dark !px-2 !py-1" onClick={() => setEdit(m)}>Edit</button>
              {!m.external && <button className="btn btn-outline-dark !px-2 !py-1" onClick={() => pick(m.id)}>Replace</button>}
              <button className="btn !px-2 !py-1 text-red-600 hover:bg-red-50" onClick={() => remove(m)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {edit && (
        <div role="dialog" aria-modal="true" aria-label="Edit media" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-auto rounded-xl bg-white p-5" onSubmit={(e) => { e.preventDefault(); save(edit); }}>
            <h2 className="text-lg font-semibold">Edit {kind}</h2>
            {kind === "video" && !edit.external && (
              <div className="rounded-lg bg-slate-50 p-3">
                <video src={edit.url} controls preload="none" poster={edit.thumb || undefined} className="w-full rounded" />
                <button type="button" className="btn btn-outline-dark mt-2" onClick={() => { setEdit(null); pick(edit.id, true); }}>Upload thumbnail</button>
              </div>
            )}
            {[["title", "Title"], ["alt", "Alt text"], ["caption", "Caption"], ["category", "Category"]].map(([k, l]) => (
              <div key={k}><label className="label" htmlFor={`m-${k}`}>{l}</label><input id={`m-${k}`} className="input" value={(edit as any)[k] || ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>
            ))}
            <div><label className="label" htmlFor="m-desc">Description</label><textarea id="m-desc" rows={3} className="input" value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div><label className="label" htmlFor="m-status">Status</label>
              <select id="m-status" className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option value="published">Published</option><option value="draft">Unpublished</option><option value="archived">Archived</option></select></div>
            <div className="flex gap-2"><button className="btn btn-primary">Save</button><button type="button" className="btn btn-outline-dark" onClick={() => setEdit(null)}>Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
