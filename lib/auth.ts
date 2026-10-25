import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.SESSION_SECRET || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEq(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured() {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret().length >= 16);
}

export function checkCredentials(email: string, password: string) {
  if (!adminConfigured()) return false;
  const okE = safeEq(email.trim().toLowerCase(), process.env.ADMIN_EMAIL!.trim().toLowerCase());
  const okP = safeEq(password, process.env.ADMIN_PASSWORD!);
  return okE && okP;
}

export function startSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  cookies().set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  cookies().delete(COOKIE);
}

/** Returns the admin email if the request has a valid session, otherwise null. */
export function currentAdmin(): string | null {
  if (!adminConfigured()) return null;
  const v = cookies().get(COOKIE)?.value;
  if (!v) return null;
  const [payload, sig] = v.split(".");
  if (!payload || !sig || !safeEq(sig, sign(payload))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.x > Date.now() ? (d.e as string) : null;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and server action. */
export function requireAdmin(): string {
  const a = currentAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

/* Tiny in-memory rate limiter (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}
