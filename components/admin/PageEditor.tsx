"use client";
import { useState } from "react";
import Link from "next/link";
import { SECTION_DEFS } from "@/lib/admin-config";
import { FieldInput } from "./FieldInputs";

type Sec = { id: string; type: string; hidden?: boolean; [k: string]: any };
const uid = () => "s" + Math.random().toString(36).slice(2, 9);

export default function PageEditor({
  action, initial, isNew, previewHref, isHome,
}: {
  action: (fd: FormData) => Promise<void>;
  initial: { title: string; slug: string; status: string; seoTitle: string; metaDescription: string; ogImage: string; showInNav: boolean; sections: Sec[] };
  isNew: boolean; previewHref?: string; isHome?: boolean;
}) {
  const [secs, setSecs] = useState<Sec[]>(initial.sections);
  const [open, setOpen] = useState<string | null>(null);
  const [add, setAdd] = useState("rich_text");

  // The section form fields are uncontrolled; values are gathered from the DOM on submit.
  function collect(form: HTMLFormElement): Sec[] {
    return secs.map((s) => {
      const def = SECTION_DEFS[s.type];
      if (!def || open === null && false) return s;
      const o: Sec = { ...s };
      for (const f of def.fields) {
        const el = form.elements.namedItem(`${s.id}__${f.name}`) as any;
        if (!el) continue;
        if (f.type === "bool") o[f.name] = el.checked;
        else if (f.type === "lines") o[f.name] = String(el.value).split("\n").map((x: string) => x.trim()).filter(Boolean);
        else if (f.type === "items") { try { o[f.name] = JSON.parse(el.value || "[]"); } catch { o[f.name] = []; } }
        else if (f.type === "number") o[f.name] = Number(el.value) || 0;
        else o[f.name] = el.value;
      }
      return o;
    });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    (form.elements.namedItem("sections") as HTMLInputElement).value = JSON.stringify(collect(form));
  }

  const syncFromDom = (form: HTMLFormElement | null) => { if (form) setSecs(collect(form)); };
  const move = (form: HTMLFormElement | null, i: number, d: number) => {
    const a = form ? collect(form) : [...secs];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setSecs(a);
  };

  return (
    <form action={action} onSubmit={submit} className="space-y-6">
      <input type="hidden" name="sections" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="title" className="label">Title</label><input id="title" name="title" className="input" defaultValue={initial.title} required /></div>
        <div><label htmlFor="slug" className="label">Slug (URL)</label><input id="slug" name="slug" className="input" defaultValue={initial.slug} readOnly={isHome} placeholder="auto from title" /></div>
        <div><label htmlFor="seoTitle" className="label">SEO title</label><input id="seoTitle" name="seoTitle" className="input" defaultValue={initial.seoTitle} /></div>
        <div><label htmlFor="ogImage" className="label">Social-sharing image</label><input id="ogImage" name="ogImage" className="input" defaultValue={initial.ogImage} placeholder="/media/12 or https://…" /></div>
        <div className="sm:col-span-2"><label htmlFor="metaDescription" className="label">Meta description</label><textarea id="metaDescription" name="metaDescription" rows={2} className="input" defaultValue={initial.metaDescription} /></div>
        <div><label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="input" defaultValue={initial.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
        {!isHome && <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="showInNav" defaultChecked={initial.showInNav} className="h-4 w-4" />Show in header navigation</label>}
      </div>

      <section aria-labelledby="secs">
        <h2 id="secs" className="mb-3 text-lg font-semibold">Sections</h2>
        <ol className="space-y-3">
          {secs.map((s, i) => {
            const def = SECTION_DEFS[s.type];
            if (!def) return null;
            const isOpen = open === s.id;
            return (
              <li key={s.id} className={`rounded-xl border bg-white ${s.hidden ? "border-dashed opacity-70" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <button type="button" className="flex-1 text-left font-medium" aria-expanded={isOpen} onClick={(e) => { syncFromDom(e.currentTarget.form); setOpen(isOpen ? null : s.id); }}>
                    {i + 1}. {def.label} {s.hidden && <span className="text-xs text-slate-500">(hidden)</span>}
                    <span className="ml-2 text-sm font-normal text-slate-500">{s.heading || s.title || ""}</span>
                  </button>
                  <button type="button" className="btn btn-outline-dark !px-2 !py-1" aria-label="Move up" disabled={i === 0} onClick={(e) => move(e.currentTarget.form, i, -1)}>↑</button>
                  <button type="button" className="btn btn-outline-dark !px-2 !py-1" aria-label="Move down" disabled={i === secs.length - 1} onClick={(e) => move(e.currentTarget.form, i, 1)}>↓</button>
                  <button type="button" className="btn btn-outline-dark !px-2 !py-1" onClick={(e) => { const a = collect(e.currentTarget.form!); a[i] = { ...a[i], hidden: !a[i].hidden }; setSecs(a); }}>{s.hidden ? "Show" : "Hide"}</button>
                  <button type="button" className="btn btn-outline-dark !px-2 !py-1" onClick={(e) => { const a = collect(e.currentTarget.form!); a.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(a[i])), id: uid() }); setSecs(a); }}>Duplicate</button>
                  <button type="button" className="btn !px-2 !py-1 text-red-600 hover:bg-red-50" onClick={(e) => { if (confirm("Delete this section?")) { const a = collect(e.currentTarget.form!); a.splice(i, 1); setSecs(a); } }}>Delete</button>
                </div>
                <div className={isOpen ? "space-y-4 border-t border-slate-200 p-4" : "hidden"}>
                  {def.fields.map((f) => {
                    const nm = `${s.id}__${f.name}`;
                    return (
                      <div key={nm}>
                        {f.type === "bool" ? (
                          <label className="flex items-center gap-2 text-sm font-medium"><FieldInput f={f} name={nm} value={s[f.name]} />{f.label}</label>
                        ) : (
                          <><label htmlFor={nm} className="label">{f.label}</label><FieldInput f={f} name={nm} value={s[f.name]} /></>
                        )}
                        {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
        {secs.length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">No sections yet. Add one below.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="addtype" className="sr-only">Section type</label>
          <select id="addtype" className="input !w-auto" value={add} onChange={(e) => setAdd(e.target.value)}>
            {Object.entries(SECTION_DEFS).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}
          </select>
          <button type="button" className="btn btn-outline-dark" onClick={(e) => {
            const a = collect(e.currentTarget.form!);
            const id = uid();
            a.push({ id, type: add, ...JSON.parse(JSON.stringify(SECTION_DEFS[add].defaults)) });
            setSecs(a); setOpen(id);
          }}>+ Add section</button>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-5">
        <button className="btn btn-primary">Save page</button>
        <Link href="/admin/pages" className="btn btn-outline-dark">Back to pages</Link>
        {previewHref && !isNew && <a href={previewHref} target="_blank" className="btn btn-outline-dark">Preview ↗</a>}
      </div>
    </form>
  );
}
