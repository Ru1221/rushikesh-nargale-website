import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth";
import { aiAnswer, localAnswer } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`chat:${ip}`, 25, 10 * 60 * 1000)) {
    return NextResponse.json({ text: "You are sending messages very quickly. Please wait a few minutes or use the contact form.", links: [{ label: "Contact us", href: "/contact" }], source: "site" }, { status: 429 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const history = raw
    .slice(-8)
    .map((m: any) => ({ role: m?.role === "user" ? "user" : "bot", text: String(m?.text || "").slice(0, 500) }))
    .filter((m: { text: string }) => m.text.trim());
  const last = history[history.length - 1];
  if (!last || last.role !== "user") return NextResponse.json({ error: "No question" }, { status: 400 });

  const reply = (await aiAnswer(history)) ?? (await localAnswer(last.text));
  // Only same-site paths are ever returned as links.
  reply.links = reply.links.filter((l) => /^\/[\w\-/]*$/.test(l.href));
  return NextResponse.json(reply);
}
