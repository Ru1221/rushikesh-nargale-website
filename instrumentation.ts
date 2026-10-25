/**
 * Keeps a free Render web service awake.
 * Render puts a free service to sleep after ~15 minutes without inbound traffic. Requests sent to the
 * service's own public URL come in through Render's proxy, so they count as traffic. Once the server is up,
 * it pings /api/health every few minutes. (A paid instance does not need this; set KEEP_ALIVE=off to disable.)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production" || process.env.KEEP_ALIVE === "off") return;
  const base = (process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
  if (!base) return;

  const g = globalThis as unknown as { __keepAlive?: boolean };
  if (g.__keepAlive) return;
  g.__keepAlive = true;

  const every = Math.max(5, Number(process.env.KEEP_ALIVE_SECONDS) || 8 * 60) * 1000;
  const ping = () => {
    fetch(`${base}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(30_000) }).catch(() => {});
  };
  setInterval(ping, every);
  console.log(`[keep-alive] pinging ${base}/api/health every ${Math.round(every / 1000)}s`);
}
