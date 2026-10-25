"use server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { z } from "zod";
import { hasDb, q } from "@/lib/db";
import { rateLimit } from "@/lib/auth";
import { settings } from "@/lib/content";
import { sendMail } from "@/lib/mail";

export interface FormState {
  ok: boolean;
  message: string;
  reference?: string;
  errors?: Record<string, string>;
}

const opt = (n: number) => z.string().trim().max(n).optional().default("");

const schema = z.object({
  type: z.enum(["contact", "consultation"]),
  full_name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: opt(40),
  company: opt(160),
  job_title: opt(120),
  service: opt(160),
  other_service: opt(160),
  message: z.string().trim().min(5, "Please describe your project").max(5000),
  current_tools: opt(500),
  budget: opt(80),
  timeline: opt(80),
  contact_method: opt(40),
  team_contact: opt(40),
  preferred_time: opt(120),
  consent: z.literal("on", { message: "Consent is required so we can contact you" }),
});

export async function submitInquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot + minimum fill time (bots are fast and fill every field).
  if (String(fd.get("website") || "")) return { ok: true, message: "Thank you." };
  const started = Number(fd.get("ts") || 0);
  if (started && Date.now() - started < 2500) return { ok: false, message: "Please take a moment to complete the form, then submit again." };

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`inq:${ip}`, 5, 10 * 60 * 1000)) return { ok: false, message: "Too many submissions. Please try again in a few minutes." };

  const raw = Object.fromEntries(fd.entries());
  if (!raw.message && raw.details) raw.message = raw.details;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  if (!hasDb) return { ok: false, message: "The database is not configured yet, so your enquiry could not be saved. Please email us directly." };

  const d = parsed.data;
  const reference = "RN-" + new Date().getFullYear() + "-" + randomBytes(3).toString("hex").toUpperCase();
  try {
    await q(
      `insert into inquiries (reference,type,full_name,email,phone,company,job_title,service,other_service,message,current_tools,budget,timeline,contact_method,team_contact,preferred_time,consent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true)`,
      [reference, d.type, d.full_name, d.email, d.phone, d.company, d.job_title, d.service, d.other_service, d.message, d.current_tools, d.budget, d.timeline, d.contact_method, d.team_contact, d.preferred_time]
    );
  } catch (e) {
    console.error("Inquiry insert failed", e);
    return { ok: false, message: "Something went wrong while saving your enquiry. Please try again or email us directly." };
  }

  // Email is best-effort: the saved inquiry is never lost if delivery fails.
  try {
    const s = (await settings()).notifications || {};
    const to = new Set<string>();
    if (s.adminEmail) to.add(s.adminEmail);
    if (d.team_contact === "Rushikesh" && s.rushikesh) to.add(s.rushikesh);
    if (d.team_contact === "Rutuja" && s.rutuja) to.add(s.rutuja);
    const body = `New ${d.type} enquiry ${reference}\n\nName: ${d.full_name}\nEmail: ${d.email}\nPhone: ${d.phone}\nCompany: ${d.company}\nService: ${d.service || d.other_service}\nPreferred contact: ${d.team_contact}\n\n${d.message}`;
    const status = to.size ? await sendMail({ to: [...to], subject: `New enquiry ${reference}`, text: body, replyTo: d.email }) : "not_configured";
    if (s.sendConfirmation && status === "sent") {
      await sendMail({ to: d.email, subject: `We received your enquiry (${reference})`, text: `Hi ${d.full_name},\n\nThank you for contacting us. Your reference is ${reference}. We will get back to you soon.\n\nRushikesh Nargale` });
    }
    await q("update inquiries set email_status=$1 where reference=$2", [status, reference]);
  } catch {}

  return {
    ok: true,
    reference,
    message: d.type === "consultation"
      ? `Thank you. Your consultation request has been received (reference ${reference}). We will contact you to confirm a time — it is not confirmed until we reply.`
      : `Thank you. Your enquiry has been received (reference ${reference}). We will get back to you soon.`,
  };
}
