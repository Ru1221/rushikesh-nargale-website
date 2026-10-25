import { NextRequest } from "next/server";
import { hasDb, q } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Serves uploaded media from Postgres, with HTTP Range support so videos can seek. */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  if (!hasDb || !Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const meta = (await q<{ mime: string; size: number; status: string }>("select mime, size, status from media where id=$1", [id]))[0];
  if (!meta || meta.status === "archived") return new Response("Not found", { status: 404 });
  if (meta.mime === "external/url") {
    const u = (await q<{ d: string }>("select convert_from(data,'UTF8') as d from media where id=$1", [id]))[0]?.d;
    return u && /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(u) ? Response.redirect(u, 302) : new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": meta.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = Math.min(range[2] ? Number(range[2]) : start + 2_000_000 - 1, meta.size - 1);
    if (start > end || start >= meta.size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${meta.size}` } });
    const row = (await q<{ chunk: Buffer }>("select substring(data from $2 for $3) as chunk from media where id=$1", [id, start + 1, end - start + 1]))[0];
    return new Response(new Uint8Array(row.chunk), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${meta.size}`, "Content-Length": String(end - start + 1) },
    });
  }
  const row = (await q<{ data: Buffer }>("select data from media where id=$1", [id]))[0];
  return new Response(new Uint8Array(row.data), { headers: { ...headers, "Content-Length": String(meta.size) } });
}
