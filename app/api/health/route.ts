export const dynamic = "force-dynamic";

/** Lightweight URL for uptime monitors and the keep-alive workflow. No database access. */
export function GET() {
  return Response.json({ ok: true, time: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
