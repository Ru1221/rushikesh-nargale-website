import Link from "next/link";
import type { Item } from "@/lib/types";
import { deleteItem, duplicateItem, moveItem, setStatus } from "@/app/admin/actions";

const badge: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-200 text-slate-700",
};

export default function ResourceList({
  kind, base, titleField, items, publicHref, newHref, newLabel, notice,
}: {
  kind: string; base: string; titleField: string; items: Item[];
  publicHref?: (i: Item) => string | undefined; newHref: string; newLabel: string;
  notice?: { saved?: string; deleted?: string; error?: string };
}) {
  return (
    <div>
      {notice?.saved && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">Saved. Published changes are live on the site.</p>}
      {notice?.deleted && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">Deleted.</p>}
      {notice?.error === "home" && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">The home page cannot be deleted.</p>}
      <div className="mb-4 flex justify-end"><Link href={newHref} className="btn btn-primary">+ {newLabel}</Link></div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Title</th><th className="p-3">Slug</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nothing here yet.</td></tr>}
            {items.map((it, idx) => {
              const href = publicHref?.(it);
              return (
                <tr key={it.id}>
                  <td className="p-3 font-medium">
                    <Link href={`${base}/${it.id}`} className="text-brand hover:underline">{String(it.data[titleField] || it.slug).slice(0, 80)}</Link>
                    {it.featured && <span className="ml-2 text-xs text-amber-600">★ featured</span>}
                  </td>
                  <td className="p-3 text-slate-500">{it.slug}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge[it.status]}`}>{it.status}</span></td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <form action={moveItem.bind(null, kind, it.id, "up", base)}><button className="btn btn-outline-dark !px-2 !py-1" aria-label="Move up" disabled={idx === 0}>↑</button></form>
                      <form action={moveItem.bind(null, kind, it.id, "down", base)}><button className="btn btn-outline-dark !px-2 !py-1" aria-label="Move down" disabled={idx === items.length - 1}>↓</button></form>
                      <form action={setStatus.bind(null, kind, it.id, it.status === "published" ? "draft" : "published", base)}>
                        <button className="btn btn-outline-dark !px-2 !py-1">{it.status === "published" ? "Unpublish" : "Publish"}</button>
                      </form>
                      <form action={duplicateItem.bind(null, kind, it.id, base)}><button className="btn btn-outline-dark !px-2 !py-1">Duplicate</button></form>
                      {it.status !== "archived" && <form action={setStatus.bind(null, kind, it.id, "archived", base)}><button className="btn btn-outline-dark !px-2 !py-1">Archive</button></form>}
                      {href && <a href={href} target="_blank" className="btn btn-outline-dark !px-2 !py-1">View</a>}
                      <form action={deleteItem.bind(null, kind, it.id, base)}>
                        <button className="btn !px-2 !py-1 text-red-600 hover:bg-red-50" data-confirm="Delete permanently?">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
