"use client";
import Link from "next/link";
import type { Field } from "@/lib/admin-config";
import { FieldInput } from "./FieldInputs";

export default function ItemForm({
  action, fields, initial, back, hasFeatured, isNew, publicHref,
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Field[];
  initial: { data: Record<string, any>; slug: string; status: string; sort: number; featured: boolean };
  back: string; hasFeatured?: boolean; isNew: boolean; publicHref?: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === "bool" ? (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><FieldInput f={f} value={initial.data[f.name] ?? (isNew && f.name === "visible")} />{f.label}</label>
          ) : (
            <>
              <label htmlFor={f.name} className="label">{f.label}</label>
              <FieldInput f={f} value={initial.data[f.name]} />
            </>
          )}
          {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
        </div>
      ))}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold">Publishing</legend>
        <div><label htmlFor="slug" className="label">Slug</label><input id="slug" name="slug" className="input" defaultValue={initial.slug} placeholder="auto from title" /></div>
        <div><label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="input" defaultValue={initial.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
        <div><label htmlFor="sort" className="label">Display order</label><input id="sort" name="sort" type="number" className="input" defaultValue={isNew ? "" : initial.sort} placeholder="last" /></div>
        {hasFeatured && <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4" />Featured</label>}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary">Save</button>
        <Link href={back} className="btn btn-outline-dark">Cancel</Link>
        {publicHref && !isNew && <a href={publicHref} target="_blank" className="btn btn-outline-dark">View on site ↗</a>}
      </div>
    </form>
  );
}
