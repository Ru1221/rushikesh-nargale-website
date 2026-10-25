import { notFound } from "next/navigation";
import Link from "next/link";
import { q } from "@/lib/db";
import { deleteInquiry, updateInquiry } from "@/app/admin/actions";

export const metadata = { title: "Inquiry" };
const STATUSES = ["New", "Contacted", "Discussion Scheduled", "Proposal Sent", "Won", "Lost", "Archived"];

export default async function Inquiry({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const r = (await q<any>("select * from inquiries where id=$1", [id]))[0];
  if (!r) notFound();
  const notes = await q<any>("select * from inquiry_notes where inquiry_id=$1 order by created_at desc", [id]);
  const rows: [string, string][] = [
    ["Reference", r.reference], ["Type", r.type], ["Name", r.full_name], ["Email", r.email], ["Phone", r.phone], ["Company", r.company], ["Job title", r.job_title],
    ["Service", r.service], ["Other service", r.other_service], ["Current tools", r.current_tools], ["Budget", r.budget], ["Timeline", r.timeline],
    ["Preferred contact method", r.contact_method], ["Preferred team contact", r.team_contact], ["Preferred time", r.preferred_time],
    ["Consent to contact", r.consent ? "Yes" : "No"], ["Email notification", r.email_status], ["Received", new Date(r.created_at).toLocaleString("en-IN")],
  ];
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/inquiries" className="text-sm text-brand">← All inquiries</Link>
      <h1 className="text-2xl font-bold text-navy-900">{r.full_name} <span className="text-base font-normal text-slate-500">{r.reference}</span></h1>
      {searchParams.saved && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Saved.</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <dl className="space-y-2 text-sm">
            {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-slate-500">{k}</dt><dd className="col-span-2 break-words">{k === "Email" ? <a className="text-brand" href={`mailto:${v}`}>{v}</a> : k === "Phone" ? <a className="text-brand" href={`tel:${v.replace(/[^\d+]/g, "")}`}>{v}</a> : v}</dd></div>)}
          </dl>
          <h2 className="mb-1 mt-5 text-sm font-semibold">Message</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{r.message}</p>
        </section>
        <section className="space-y-4">
          <form action={updateInquiry.bind(null, id)} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
            <div><label className="label" htmlFor="status">Status</label><select id="status" name="status" defaultValue={r.status} className="input">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="priority">Priority</label><select id="priority" name="priority" defaultValue={r.priority} className="input"><option>Low</option><option>Normal</option><option>High</option></select></div>
              <div><label className="label" htmlFor="assigned_to">Assigned to</label><select id="assigned_to" name="assigned_to" defaultValue={r.assigned_to} className="input"><option value="">Unassigned</option><option>Rushikesh</option><option>Rutuja</option></select></div>
            </div>
            <div><label className="label" htmlFor="note">Add internal note</label><textarea id="note" name="note" rows={3} className="input" /></div>
            <button className="btn btn-primary">Save</button>
          </form>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold">Internal notes</h2>
            {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
            <ul className="space-y-3 text-sm">{notes.map((n: any) => <li key={n.id}><p className="whitespace-pre-wrap">{n.note}</p><p className="text-xs text-slate-500">{n.author} · {new Date(n.created_at).toLocaleString("en-IN")}</p></li>)}</ul>
          </div>
          {r.archived && (
            <form action={deleteInquiry.bind(null, id)}><button data-confirm="Permanently delete this archived inquiry?" className="btn btn-outline-dark text-red-600">Delete permanently</button></form>
          )}
        </section>
      </div>
    </div>
  );
}
