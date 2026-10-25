import Link from "next/link";
import { hasDb, q } from "@/lib/db";

export const metadata = { title: "Inquiries" };
const STATUSES = ["New", "Contacted", "Discussion Scheduled", "Proposal Sent", "Won", "Lost", "Archived"];

export default async function Inquiries({ searchParams: sp }: { searchParams: Record<string, string> }) {
  if (!hasDb) return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Connect the database to receive inquiries.</p>;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: string[] = []; const p: any[] = [];
  const add = (cond: string, v: any) => { p.push(v); where.push(cond.replace("?", `$${p.length}`)); };
  if (sp.q) add("(lower(full_name||' '||email||' '||company||' '||reference) like ?)", `%${sp.q.toLowerCase()}%`);
  if (sp.status) add("status = ?", sp.status);
  if (sp.service) add("service = ?", sp.service);
  if (sp.from) add("created_at >= ?", sp.from);
  if (sp.to) add("created_at < (?::date + 1)", sp.to);
  if (!sp.status) where.push("not archived");
  const w = where.length ? `where ${where.join(" and ")}` : "";
  const total = (await q<{ n: number }>(`select count(*)::int n from inquiries ${w}`, p))[0].n;
  const rows = await q<any>(`select id, reference, type, full_name, email, company, service, status, priority, created_at from inquiries ${w} order by created_at desc limit 25 offset ${(page - 1) * 25}`, p);
  const services = (await q<{ service: string }>("select distinct service from inquiries where service<>'' order by 1")).map((r) => r.service);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page")).toString();
  const exportHref = `/admin/inquiries/export?${qs}`;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">Inquiries</h1>
      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div><label className="label" htmlFor="q">Search</label><input id="q" name="q" defaultValue={sp.q} className="input" placeholder="Name, email, company, reference" /></div>
        <div><label className="label" htmlFor="status">Status</label><select id="status" name="status" defaultValue={sp.status || ""} className="input"><option value="">Active</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="label" htmlFor="service">Service</label><select id="service" name="service" defaultValue={sp.service || ""} className="input"><option value="">All</option>{services.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="label" htmlFor="from">From</label><input id="from" type="date" name="from" defaultValue={sp.from} className="input" /></div>
        <div><label className="label" htmlFor="to">To</label><input id="to" type="date" name="to" defaultValue={sp.to} className="input" /></div>
        <button className="btn btn-primary">Filter</button>
        <a href={exportHref} className="btn btn-outline-dark">Export CSV</a>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Reference</th><th className="p-3">Name</th><th className="p-3">Service</th><th className="p-3">Status</th><th className="p-3">Priority</th><th className="p-3">Received</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No inquiries found.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td className="p-3"><Link className="text-brand hover:underline" href={`/admin/inquiries/${r.id}`}>{r.reference}</Link></td>
                <td className="p-3">{r.full_name}<br /><span className="text-xs text-slate-500">{r.company || r.email}</span></td>
                <td className="p-3">{r.service || "—"} <span className="text-xs text-slate-400">({r.type})</span></td>
                <td className="p-3">{r.status}</td><td className="p-3">{r.priority}</td>
                <td className="p-3 text-slate-500">{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-4 text-sm">
        {total} total
        {page > 1 && <Link className="text-brand" href={`/admin/inquiries?${qs}&page=${page - 1}`}>← Previous</Link>}
        {page * 25 < total && <Link className="text-brand" href={`/admin/inquiries?${qs}&page=${page + 1}`}>Next →</Link>}
      </p>
    </div>
  );
}
