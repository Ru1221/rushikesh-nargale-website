"use server";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { hasDb, q } from "@/lib/db";
import { checkCredentials, endSession, rateLimit, requireAdmin, startSession } from "@/lib/auth";
import { RESOURCES, SECTION_DEFS, safeUrl, type Field } from "@/lib/admin-config";
import { headers } from "next/headers";

export interface LoginState { error?: string }

export async function login(_p: LoginState, fd: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: "Too many attempts. Try again later." };
  const email = String(fd.get("email") || "");
  if (!checkCredentials(email, String(fd.get("password") || ""))) return { error: "Invalid email or password." };
  await startSession(email);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function refresh() {
  revalidateTag("content", { expire: 0 });
  revalidatePath("/", "layout");
}

const RESERVED = new Set(["admin", "api", "services", "team", "contact", "book-consultation", "faq", "industries", "portfolio", "case-studies", "blog", "media", "sitemap.xml", "robots.txt", "home", "_next"]);

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
}

function parse(fields: Field[], get: (n: string) => FormDataEntryValue | null): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const raw = get(f.name);
    const str = typeof raw === "string" ? raw.trim().slice(0, 50000) : "";
    switch (f.type) {
      case "bool": out[f.name] = raw === "on" || raw === "true"; break;
      case "number": out[f.name] = Number(str) || 0; break;
      case "url": case "media": out[f.name] = safeUrl(str); break;
      case "lines": {
        let lines = str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (["images", "urls"].includes(f.name)) lines = lines.map(safeUrl).filter(Boolean);
        out[f.name] = lines;
        break;
      }
      case "items": {
        let rows: any[] = [];
        try { rows = JSON.parse(str || "[]"); } catch {}
        out[f.name] = (Array.isArray(rows) ? rows : []).slice(0, 100).map((r) => {
          const o: Record<string, any> = {};
          for (const sf of f.fields || []) {
            const v = String(r?.[sf.name] ?? "").trim().slice(0, 5000);
            o[sf.name] = sf.type === "url" || sf.type === "media" ? safeUrl(v) : v;
          }
          return o;
        }).filter((o) => Object.values(o).some(Boolean));
        break;
      }
      default: out[f.name] = str;
    }
  }
  return out;
}

async function uniqueSlug(kind: string, base: string, ignoreId?: number) {
  let slug = base, n = 2;
  while (true) {
    const r = await q("select id from content where kind=$1 and slug=$2 and id<>$3", [kind, slug, ignoreId ?? 0]);
    if (!r.length && !(["service", "page"].includes(kind) && RESERVED.has(slug))) return slug;
    slug = `${base}-${n++}`;
  }
}

function need() {
  if (!hasDb) redirect("/admin?error=nodb");
}

export async function saveItem(resKey: string, id: string, fd: FormData) {
  await requireAdmin();
  need();
  const res = RESOURCES[resKey];
  if (!res) redirect("/admin");
  const data = parse(res.fields, (n) => fd.get(n));
  if (res.kind === "block") {
    try { data.sections = JSON.parse(String(data.sections || "[]")); } catch { data.sections = []; }
  }
  const status = ["draft", "published", "archived"].includes(String(fd.get("status"))) ? String(fd.get("status")) : "draft";
  const featured = fd.get("featured") === "on";
  const sort = Number(fd.get("sort")) || 0;
  let slug = String(fd.get("slug") || "").trim().toLowerCase();
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) slug = slugify(slug);
  if (!slug) slug = slugify(String(data[res.slugFrom] || res.singular));

  if (id === "new") {
    slug = await uniqueSlug(res.kind, slug);
    const maxSort = (await q<{ m: number }>("select coalesce(max(sort),-1)+1 as m from content where kind=$1", [res.kind]))[0].m;
    await q("insert into content (kind,slug,status,sort,featured,data) values ($1,$2,$3,$4,$5,$6)", [res.kind, slug, status, fd.get("sort") ? sort : maxSort, featured, JSON.stringify({ ...data, ...(res.defaults || {}) })]);
  } else {
    const old = (await q<{ data: any }>("select data from content where id=$1 and kind=$2", [Number(id), res.kind]))[0];
    if (!old) redirect(`/admin/${resKey}`);
    slug = await uniqueSlug(res.kind, slug, Number(id));
    await q("update content set slug=$1,status=$2,sort=$3,featured=$4,data=$5,updated_at=now() where id=$6", [slug, status, sort, featured, JSON.stringify({ ...old.data, ...data, ...(res.defaults || {}) }), Number(id)]);
  }
  refresh();
  redirect(`/admin/${resKey}?saved=1`);
}

function cleanSections(input: any): any[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 80).flatMap((s, i) => {
    const def = SECTION_DEFS[s?.type];
    if (!def) return [];
    const o: Record<string, any> = { id: String(s.id || `s${Date.now()}${i}`).slice(0, 40), type: s.type, hidden: !!s.hidden };
    const fake = (n: string) => (s[n] === undefined || s[n] === null ? null : Array.isArray(s[n]) && def.fields.find((f) => f.name === n)?.type === "lines" ? s[n].join("\n") : typeof s[n] === "object" ? JSON.stringify(s[n]) : String(s[n]));
    Object.assign(o, parse(def.fields, fake));
    return [o];
  });
}

export async function savePage(id: string, fd: FormData) {
  await requireAdmin();
  need();
  let sections: any[] = [];
  try { sections = cleanSections(JSON.parse(String(fd.get("sections") || "[]"))); } catch {}
  const meta = {
    title: String(fd.get("title") || "Untitled").trim().slice(0, 200),
    seoTitle: String(fd.get("seoTitle") || "").trim().slice(0, 200),
    metaDescription: String(fd.get("metaDescription") || "").trim().slice(0, 400),
    ogImage: safeUrl(String(fd.get("ogImage") || "")),
    showInNav: fd.get("showInNav") === "on",
    sections,
  };
  const status = ["draft", "published", "archived"].includes(String(fd.get("status"))) ? String(fd.get("status")) : "draft";
  let slug = slugify(String(fd.get("slug") || meta.title));
  if (id === "new") {
    if (slug === "home") slug = "home-2";
    slug = await uniqueSlug("page", slug);
    await q("insert into content (kind,slug,status,sort,data) values ('page',$1,$2,(select coalesce(max(sort),0)+1 from content where kind='page'),$3)", [slug, status, JSON.stringify(meta)]);
    const row = (await q<{ id: number }>("select id from content where kind='page' and slug=$1", [slug]))[0];
    id = String(row.id);
  } else {
    const cur = (await q<{ slug: string }>("select slug from content where id=$1 and kind='page'", [Number(id)]))[0];
    if (!cur) redirect("/admin/pages");
    if (cur.slug === "home") slug = "home"; // the home page slug is fixed
    else slug = await uniqueSlug("page", slug === "home" ? "home-2" : slug, Number(id));
    await q("update content set slug=$1,status=$2,data=$3,updated_at=now() where id=$4", [slug, status, JSON.stringify(meta), Number(id)]);
  }
  await syncNav(slug, meta.title, meta.showInNav);
  refresh();
  redirect(`/admin/pages/${id}?saved=1`);
}

async function syncNav(slug: string, title: string, show: boolean) {
  if (slug === "home") return;
  const existing = (await q<{ id: number }>("select id from content where kind='nav' and data->>'href'=$1 and data->>'location'='header'", [`/${slug}`]))[0];
  if (show && !existing) {
    await q("insert into content (kind,slug,status,sort,data) values ('nav',$1,'published',(select coalesce(max(sort),0)+1 from content where kind='nav'),$2) on conflict do nothing",
      [`nav-${slug}`, JSON.stringify({ location: "header", label: title, href: `/${slug}`, parent: "", visible: true })]);
  } else if (!show && existing) {
    await q("delete from content where id=$1 and slug like 'nav-%'", [existing.id]);
  }
}

export async function deleteItem(kind: string, id: number, back: string) {
  await requireAdmin();
  need();
  if (kind === "page") {
    const p = (await q<{ slug: string }>("select slug from content where id=$1 and kind='page'", [id]))[0];
    if (p?.slug === "home") redirect(`${back}?error=home`);
  }
  await q("delete from content where id=$1 and kind=$2", [id, kind]);
  refresh();
  redirect(`${back}?deleted=1`);
}

export async function setStatus(kind: string, id: number, status: string, back: string) {
  await requireAdmin();
  need();
  if (!["draft", "published", "archived"].includes(status)) return;
  await q("update content set status=$1, updated_at=now() where id=$2 and kind=$3", [status, id, kind]);
  refresh();
  redirect(back);
}

export async function moveItem(kind: string, id: number, dir: "up" | "down", back: string) {
  await requireAdmin();
  need();
  const rows = await q<{ id: number; sort: number }>("select id, sort from content where kind=$1 order by sort, id", [kind]);
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) redirect(back);
  const ids = rows.map((r) => r.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let n = 0; n < ids.length; n++) await q("update content set sort=$1 where id=$2", [n, ids[n]]);
  refresh();
  redirect(back);
}

export async function duplicateItem(kind: string, id: number, back: string) {
  await requireAdmin();
  need();
  const r = (await q<any>("select * from content where id=$1 and kind=$2", [id, kind]))[0];
  if (!r) redirect(back);
  const slug = await uniqueSlug(kind, `${r.slug}-copy`);
  await q("insert into content (kind,slug,status,sort,featured,data) values ($1,$2,'draft',(select coalesce(max(sort),0)+1 from content where kind=$1),$3,$4)", [kind, slug, r.featured, JSON.stringify(r.data)]);
  refresh();
  redirect(back);
}

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  need();
  const g = (n: string, max = 500) => String(fd.get(n) || "").trim().slice(0, max);
  const email = (n: string) => { const v = g(n, 200); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : ""; };
  const next: Record<string, any> = {
    general: { siteName: g("siteName", 100) || "Rushikesh Nargale", tagline: g("tagline", 200), title: g("title", 300), logo: safeUrl(g("logo")), favicon: safeUrl(g("favicon")), ctaPrimary: g("ctaPrimary", 60), ctaSecondary: g("ctaSecondary", 60) },
    contact: { email: email("contactEmail"), phone: g("contactPhone", 40), linkedin: safeUrl(g("linkedin")), portfolio: safeUrl(g("portfolioUrl")) },
    footer: { text: g("footerText", 800) },
    seo: { title: g("seoTitle", 200), description: g("seoDescription", 400), ogImage: safeUrl(g("ogImage")) },
    notifications: { adminEmail: email("adminEmail"), rushikesh: email("rushikeshEmail"), rutuja: email("rutujaEmail"), sendConfirmation: fd.get("sendConfirmation") === "on" },
  };
  for (const [k, v] of Object.entries(next)) await q("insert into settings (key,value) values ($1,$2) on conflict (key) do update set value=excluded.value", [k, JSON.stringify(v)]);
  refresh();
  redirect("/admin/settings?saved=1");
}

/* ---------- Inquiries ---------- */
const STATUSES = ["New", "Contacted", "Discussion Scheduled", "Proposal Sent", "Won", "Lost", "Archived"];

export async function updateInquiry(id: number, fd: FormData) {
  const admin = await requireAdmin();
  need();
  const status = STATUSES.includes(String(fd.get("status"))) ? String(fd.get("status")) : "New";
  const priority = ["Low", "Normal", "High"].includes(String(fd.get("priority"))) ? String(fd.get("priority")) : "Normal";
  const assigned = ["", "Rushikesh", "Rutuja"].includes(String(fd.get("assigned_to"))) ? String(fd.get("assigned_to")) : "";
  await q("update inquiries set status=$1, priority=$2, assigned_to=$3, archived=$4 where id=$5", [status, priority, assigned, status === "Archived", id]);
  const note = String(fd.get("note") || "").trim().slice(0, 4000);
  if (note) await q("insert into inquiry_notes (inquiry_id, author, note) values ($1,$2,$3)", [id, admin, note]);
  redirect(`/admin/inquiries/${id}?saved=1`);
}

export async function deleteInquiry(id: number) {
  await requireAdmin();
  need();
  // Safe deletion policy: only archived inquiries can be permanently deleted.
  await q("delete from inquiries where id=$1 and archived=true", [id]);
  redirect("/admin/inquiries");
}

export async function mediaUsage(id: number): Promise<number> {
  await requireAdmin();
  const r = await q<{ n: number }>("select count(*)::int as n from content where status='published' and data::text like $1", [`%/media/${id}"%`]);
  return r[0]?.n ?? 0;
}
