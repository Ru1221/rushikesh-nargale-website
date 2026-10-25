import Link from "next/link";
import { hasDb, q } from "@/lib/db";

export const metadata = { title: "Dashboard" };

export default async function Dashboard(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  if (!hasDb) {
    return (
      <div className="max-w-2xl rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-xl font-bold">Database not connected</h1>
        <p className="mt-2 text-sm">The site is showing built-in sample content. Set the <code>DATABASE_URL</code> environment variable to a PostgreSQL connection string and restart. Tables and sample content are created automatically on first start.</p>
      </div>
    );
  }
  const [c] = await q<any>(`select
    (select count(*)::int from content where kind='page' and status='published') pages,
    (select count(*)::int from content where kind='service') services,
    (select count(*)::int from content where kind='project') projects,
    (select count(*)::int from content where kind='team') team,
    (select count(*)::int from inquiries where status='New' and not archived) new_inq,
    (select coalesce(sum(size),0)::bigint from media) storage`);
  const inq = await q<any>("select id, reference, full_name, service, status, created_at from inquiries where not archived order by created_at desc limit 5");
  const upd = await q<any>("select id, kind, slug, data, updated_at from content order by updated_at desc limit 6");
  const stats: [string, string | number][] = [
    ["Published pages", c.pages], ["Services", c.services], ["Portfolio & case studies", c.projects], ["Team members", c.team],
    ["New inquiries", c.new_inq], ["Media storage", `${(Number(c.storage) / 1048576).toFixed(1)} MB`],
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
      {searchParams.error === "nodb" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">The database is not connected.</p>}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([l, v]) => <div key={l} className="rounded-xl bg-white p-5 shadow-sm"><dt className="text-sm text-slate-500">{l}</dt><dd className="text-2xl font-bold text-navy-900">{v}</dd></div>)}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Recent inquiries</h2>
          {inq.length === 0 && <p className="text-sm text-slate-500">No inquiries yet.</p>}
          <ul className="divide-y divide-slate-100 text-sm">
            {inq.map((i: any) => <li key={i.id} className="flex justify-between py-2"><Link className="text-brand hover:underline" href={`/admin/inquiries/${i.id}`}>{i.full_name} · {i.reference}</Link><span className="text-slate-500">{i.status}</span></li>)}
          </ul>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Recent content updates</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {upd.map((u: any) => <li key={u.id} className="flex justify-between py-2"><span>{u.data.title || u.data.name || u.data.label || u.data.q || u.slug} <span className="text-slate-400">({u.kind})</span></span><span className="text-slate-500">{new Date(u.updated_at).toLocaleDateString("en-IN")}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
