"use client";
import { useEffect, useState } from "react";
import type { Field } from "@/lib/admin-config";

interface MediaRow { id: number; kind: string; filename: string; title: string; alt: string; url: string; thumb: string; size: number }

export function MediaPicker({ kind, onPick, onClose }: { kind: "image" | "video" | "any"; onPick: (url: string) => void; onClose: () => void }) {
  const [rows, setRows] = useState<MediaRow[] | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch(`/api/admin/media?kind=${kind === "any" ? "" : kind}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json()).then((d) => setRows(d.items || [])).catch(() => setRows([]));
  }, [q, kind]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Choose media" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          <input autoFocus className="input" placeholder="Search media…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
          <button type="button" className="btn btn-outline-dark" onClick={onClose}>Close</button>
        </div>
        {rows === null && <p className="text-sm text-slate-500">Loading…</p>}
        {rows?.length === 0 && <p className="text-sm text-slate-500">No media found. Upload files under Media first, or paste a URL directly.</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows?.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onPick(m.url)} className="w-full rounded-lg border border-slate-200 p-2 text-left hover:border-brand">
                {m.kind === "image" || m.thumb ? <img src={m.thumb || m.url} alt={m.alt} className="aspect-video w-full rounded object-cover" /> : <div className="grid aspect-video place-items-center rounded bg-slate-100 text-2xl" aria-hidden>▶</div>}
                <p className="mt-1 truncate text-xs">{m.title || m.filename}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MediaInput({ name, defaultValue, kind = "any" }: { name: string; defaultValue?: string; kind?: "image" | "video" | "any" }) {
  const [v, setV] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <input id={name} name={name} className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder="/media/12 or https://…" />
        <button type="button" className="btn btn-outline-dark whitespace-nowrap" onClick={() => setOpen(true)}>Pick media</button>
      </div>
      {v && /^\/media\/\d+$/.test(v) && <img src={v} alt="" className="mt-2 h-16 rounded border" onError={(e) => ((e.target as HTMLElement).style.display = "none")} />}
      {open && <MediaPicker kind={kind} onPick={(u) => { setV(u); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function ItemsEditor({ name, fields, defaultValue }: { name: string; fields: Field[]; defaultValue?: any[] }) {
  const [rows, setRows] = useState<Record<string, string>[]>(defaultValue || []);
  const set = (i: number, k: string, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((r, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <label className="label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea className="input" rows={2} value={r[f.name] || ""} onChange={(e) => set(i, f.name, e.target.value)} />
                ) : (
                  <input className="input" value={r[f.name] || ""} onChange={(e) => set(i, f.name, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 text-sm">
            <button type="button" className="text-slate-600 hover:underline" disabled={i === 0} onClick={() => { const a = [...rows]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setRows(a); }}>↑ Up</button>
            <button type="button" className="text-slate-600 hover:underline" disabled={i === rows.length - 1} onClick={() => { const a = [...rows]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; setRows(a); }}>↓ Down</button>
            <button type="button" className="text-red-600 hover:underline" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline-dark" onClick={() => setRows([...rows, {}])}>+ Add row</button>
    </div>
  );
}

/** Renders one admin field. `value` is the stored value; `idPrefix` keeps ids unique inside the page builder. */
export function FieldInput({ f, value, name }: { f: Field; value: any; name?: string }) {
  const n = name || f.name;
  const common = { id: n, name: n, className: "input" };
  switch (f.type) {
    case "textarea": return <textarea {...common} rows={f.rows || 3} defaultValue={value ?? ""} />;
    case "lines": return <textarea {...common} rows={4} defaultValue={Array.isArray(value) ? value.join("\n") : ""} />;
    case "select": return <select {...common} defaultValue={value ?? f.options?.[0]}>{f.options?.map((o) => <option key={o} value={o}>{o || "(none)"}</option>)}</select>;
    case "bool": return <input type="checkbox" id={n} name={n} defaultChecked={!!value} className="h-4 w-4" />;
    case "date": return <input {...common} type="date" defaultValue={value ? String(value).slice(0, 10) : ""} />;
    case "number": return <input {...common} type="number" defaultValue={value ?? ""} />;
    case "media": return <MediaInput name={n} defaultValue={value} />;
    case "items": return <ItemsEditor name={n} fields={f.fields || []} defaultValue={Array.isArray(value) ? value : []} />;
    default: return <input {...common} type="text" defaultValue={value ?? ""} />;
  }
}
