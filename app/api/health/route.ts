export const dynamic = "force-dynamic";

let hits = 0;

/** Lightweight URL for uptime monitors, the keep-alive workflow and the server's own keep-alive timer. No database access. */
export function GET() {
  hits += 1;
  return Response.json({ ok: true, time: new Date().toISOString(), hits }, { headers: { "Cache-Control": "no-store" } });
}
