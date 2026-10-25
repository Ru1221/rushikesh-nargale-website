import { NextRequest } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

// Spreadsheet apps execute cells beginning with = + - @ ; neutralise them.
const cell = (v: any) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await currentAdmin())) return new Response("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const where: string[] = []; const p: any[] = [];
  const add = (c: string, v: any) => { p.push(v); where.push(c.replace("?", `$${p.length}`)); };
  if (sp.q) add("(lower(full_name||' '||email||' '||company||' '||reference) like ?)", `%${sp.q.toLowerCase()}%`);
  if (sp.status) add("status = ?", sp.status);
  if (sp.service) add("service = ?", sp.service);
  if (sp.from) add("created_at >= ?", sp.from);
  if (sp.to) add("created_at < (?::date + 1)", sp.to);
  if (!sp.status) where.push("not archived");
  const rows = await q<any>(`select reference,type,full_name,email,phone,company,job_title,service,other_service,message,current_tools,budget,timeline,contact_method,team_contact,preferred_time,status,priority,assigned_to,created_at from inquiries ${where.length ? "where " + where.join(" and ") : ""} order by created_at desc`, p);
  const cols = rows[0] ? Object.keys(rows[0]) : ["reference"];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
