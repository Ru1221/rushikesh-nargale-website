import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { currentAdmin } from "@/lib/auth";
import { hasDb, q } from "@/lib/db";
import { embedUrl } from "@/components/Video";

export const dynamic = "force-dynamic";

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 40 * 1024 * 1024;

function sniff(buf: Buffer): { kind: "image" | "video"; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: "image", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { kind: "image", mime: "image/png" };
  if (buf.subarray(0, 4).toString() === "GIF8") return { kind: "image", mime: "image/gif" };
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return { kind: "image", mime: "image/webp" };
  if (buf.subarray(4, 8).toString() === "ftyp") return { kind: "video", mime: buf.subarray(8, 12).toString().startsWith("qt") ? "video/quicktime" : "video/mp4" };
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return { kind: "video", mime: "video/webm" };
  return null;
}

const row = (r: any) => ({
  id: r.id, kind: r.kind, filename: r.filename, mime: r.mime, size: r.size, title: r.title, alt: r.alt, caption: r.caption,
  description: r.description, category: r.category, status: r.status, created_at: r.created_at,
  external: r.mime === "external/url",
  url: r.mime === "external/url" ? r.ext_url : `/media/${r.id}`,
  thumb: r.thumb_id ? `/media/${r.thumb_id}` : "",
});

const COLS = "m.id, m.kind, m.filename, m.mime, m.size, m.title, m.alt, m.caption, m.description, m.category, m.status, m.created_at, m.thumb_id, case when m.mime='external/url' then convert_from(m.data,'UTF8') end as ext_url";

function guard() {
  if (!currentAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  return null;
}
const refresh = () => { revalidateTag("content"); revalidatePath("/", "layout"); };

export async function GET(req: NextRequest) {
  const g = guard(); if (g) return g;
  const u = req.nextUrl.searchParams;
  if (u.get("usage")) {
    const id = Number(u.get("usage"));
    const r = await q<{ n: number }>("select count(*)::int n from content where status='published' and (data::text like $1 or data::text like $2)", [`%/media/${id}"%`, `%/media/${id}\\n%`]);
    return NextResponse.json({ usedBy: r[0].n });
  }
  const kind = u.get("kind") || "";
  const search = `%${(u.get("q") || "").toLowerCase()}%`;
  const category = u.get("category") || "";
  const rows = await q(`select ${COLS} from media m where ($1='' or m.kind=$1) and (lower(m.filename||' '||m.title||' '||m.alt||' '||m.category) like $2) and ($3='' or m.category=$3) and not exists (select 1 from media p where p.thumb_id=m.id and false) order by m.created_at desc limit 300`, [kind, search, category]);
  // thumbnails are stored as images; hide those that belong to a video from the image library
  const thumbs = new Set((await q<{ thumb_id: number }>("select thumb_id from media where thumb_id is not null")).map((t) => t.thumb_id));
  const items = rows.filter((r: any) => !(kind === "image" && thumbs.has(r.id))).map(row);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const g = guard(); if (g) return g;
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    // Add an external YouTube/Vimeo video.
    const b = await req.json();
    const url = String(b.url || "").trim();
    if (!embedUrl(url)) return NextResponse.json({ error: "Only YouTube or Vimeo links are supported." }, { status: 400 });
    const r = await q("insert into media (kind, filename, mime, size, data, title, status) values ('video',$1,'external/url',$2,$3,$4,'published') returning id", [url.slice(0, 200), url.length, Buffer.from(url), String(b.title || "External video").slice(0, 200)]);
    refresh();
    return NextResponse.json({ id: (r[0] as any).id });
  }

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const t = sniff(buf);
  if (!t) return NextResponse.json({ error: "Unsupported or invalid file. Use JPEG, PNG, WebP, GIF, MP4, WebM or MOV." }, { status: 400 });
  if (t.kind === "image" && buf.length > MAX_IMAGE) return NextResponse.json({ error: "Image is larger than 8 MB." }, { status: 413 });
  if (t.kind === "video" && buf.length > MAX_VIDEO) return NextResponse.json({ error: "Video is larger than 40 MB. Upload it to YouTube/Vimeo and add the link instead." }, { status: 413 });
  const want = String(fd.get("kind") || "");
  if (want && want !== t.kind) return NextResponse.json({ error: `Expected a ${want} file.` }, { status: 400 });

  const filename = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 150);
  const replace = Number(fd.get("replace") || 0);
  const thumbFor = Number(fd.get("thumbFor") || 0);

  if (replace) {
    const cur = (await q<{ kind: string }>("select kind from media where id=$1", [replace]))[0];
    if (!cur || cur.kind !== t.kind) return NextResponse.json({ error: "Replacement must be the same type of file." }, { status: 400 });
    await q("update media set filename=$1, mime=$2, size=$3, data=$4 where id=$5", [filename, t.mime, buf.length, buf, replace]);
    refresh();
    return NextResponse.json({ id: replace });
  }
  const r = await q("insert into media (kind, filename, mime, size, data, title) values ($1,$2,$3,$4,$5,$6) returning id", [t.kind, filename, t.mime, buf.length, buf, filename.replace(/\.[^.]+$/, "")]);
  const id = (r[0] as any).id;
  if (thumbFor && t.kind === "image") {
    await q("update media set thumb_id=$1 where id=$2 and kind='video'", [id, thumbFor]);
    await q("update media set category='thumbnail' where id=$1", [id]);
  }
  refresh();
  return NextResponse.json({ id });
}

export async function PATCH(req: NextRequest) {
  const g = guard(); if (g) return g;
  const b = await req.json();
  const s = (v: any, n: number) => String(v ?? "").slice(0, n);
  const status = ["published", "draft", "archived"].includes(b.status) ? b.status : "published";
  await q("update media set title=$1, alt=$2, caption=$3, description=$4, category=$5, status=$6 where id=$7", [s(b.title, 200), s(b.alt, 300), s(b.caption, 500), s(b.description, 2000), s(b.category, 80), status, Number(b.id)]);
  refresh();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const g = guard(); if (g) return g;
  const id = Number(req.nextUrl.searchParams.get("id"));
  await q("update media set thumb_id=null where thumb_id=$1", [id]);
  await q("delete from media where id=$1", [id]);
  refresh();
  return NextResponse.json({ ok: true });
}
