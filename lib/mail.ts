/** Sends email through Resend when RESEND_API_KEY is set. Returns a status string; never throws. */
export async function sendMail(opts: { to: string | string[]; subject: string; text: string; replyTo?: string }): Promise<"sent" | "not_configured" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return "not_configured";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text, reply_to: opts.replyTo }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
