import { list, settings } from "./content";

export interface ChatLink { label: string; href: string }
export interface ChatReply { text: string; links: ChatLink[]; source: "site" | "ai" }

interface Doc { type: "service" | "faq" | "app" | "info"; title: string; href: string; text: string; answer: string; mr?: string }

const STOP = new Set("a an the and or of to in on for with is are was were be been it this that these those your you we our us can do does how what which who when where why i me my about tell please want need have has get give any some more from at as by if so not no yes hi hello hey".split(" "));

// Common Marathi words mapped to the English terms used in the content.
const MR: [string, string][] = [
  ["सेवा", "service"], ["सर्व्हिस", "service"], ["किंमत", "price"], ["खर्च", "cost"], ["दर", "price"], ["संपर्क", "contact"],
  ["फोन", "phone"], ["ईमेल", "email"], ["ॲप", "app"], ["अॅप", "app"], ["अ‍ॅप", "app"], ["कंपनी", "about"], ["माहिती", "about"],
  ["डॅशबोर्ड", "dashboard"], ["चॅटबॉट", "chatbot"], ["टॅली", "tally"], ["झोहो", "zoho"], ["पॉलिसी", "policy"],
  ["भेट", "consultation"], ["मीटिंग", "consultation"], ["मदत", "service"], ["काय", "offer"],
];
const DEV = /[ऀ-ॿ]/;

const tokenize = (s: string) => {
  const out: string[] = [];
  for (const raw of s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s]/g, " ").split(/\s+/)) {
    if (!raw) continue;
    if (DEV.test(raw)) { for (const [k, v] of MR) if (raw.includes(k)) out.push(v); continue; }
    if (STOP.has(raw)) continue;
    out.push(raw.length > 3 ? raw.replace(/(ing|ed|es|s)$/, "") : raw);
  }
  return out;
};

const firstSentences = (t: string, n = 2) => (t.match(/[^.!?]+[.!?]+/g) || [t]).slice(0, n).join(" ").trim();

let cache: { at: number; docs: Doc[]; contact: string } | null = null;

async function knowledge() {
  if (cache && Date.now() - cache.at < 60_000) return cache;
  const [services, faqs, projects, team, s] = await Promise.all([list("service"), list("faq"), list("project"), list("team"), settings()]);
  const docs: Doc[] = [];
  for (const x of services) {
    const d = x.data;
    docs.push({
      type: "service", title: d.title, href: `/${x.slug}`,
      text: [d.title, d.short, d.full, d.problem, (d.items || []).join(" "), (d.tech || []).join(" ")].join(" "),
      answer: `${d.title}: ${d.short}${(d.items || []).length ? ` We can help with ${(d.items as string[]).slice(0, 5).join(", ")}.` : ""}`,
    });
  }
  for (const x of faqs) docs.push({ type: "faq", title: x.data.q, href: "/faq", text: `${x.data.q} ${x.data.a}`, answer: x.data.a });
  for (const x of projects) {
    const d = x.data;
    const base = d.kind === "case_study" ? "/case-studies" : "/portfolio";
    docs.push({
      type: "app", title: d.title, href: `${base}/${x.slug}`,
      text: [d.title, d.description, d.problem, d.solution, (d.features || []).join(" ")].join(" "),
      answer: `${d.title}: ${d.description}${(d.features || []).length ? ` It includes ${(d.features as string[]).slice(0, 4).join(", ")}.` : ""}`,
    });
  }
  const people = team.map((t) => `${t.data.name}: ${t.data.email}, ${t.data.phone}`).join("; ");
  const where = ((s.contact as any).locations || []).join(" and ");
  const contact = `You can reach the team directly: ${people}.${where ? ` We are based in ${where}.` : ""} Or send an enquiry through the contact form.`;
  const cats = await list("category");
  const overview = cats
    .map((c) => {
      const t = services.filter((x) => x.data.category === c.slug).map((x) => x.data.title);
      return t.length ? `${c.data.name}: ${t.join(", ")}` : "";
    })
    .filter(Boolean)
    .join(". ");
  docs.push(
    {
      type: "info", title: "Our services", href: "/services",
      text: "our services service offer offered provide provided what do you do build list catalog solutions help areas",
      answer: `We offer ${overview}. We also build custom apps and dashboards.`,
      mr: "आम्ही AI ऑटोमेशन, बिझनेस आणि वर्कफ्लो ऑटोमेशन, सॉफ्टवेअर व API इंटिग्रेशन, अंदाजपत्रक (BOQ) व टेंडर साधने, अकाउंट्स (Tally, Zoho), HR व सेल्स ऑटोमेशन आणि कस्टम ॲप्स व डॅशबोर्ड्स बनवतो.",
    },
    {
      type: "info", title: "Websites and web apps", href: "/website-development",
      text: "website websites web site webpage web app webapp development develop design build wordpress ecommerce portal admin",
      answer: "Yes. We build static websites (fast, simple, ideal for company profiles and landing pages) and dynamic websites with a database and an admin area, so you can edit your own content without a developer.",
      mr: "हो. आम्ही डायनॅमिक वेबसाइट्स आणि कस्टम वेब ॲप्लिकेशन्स बनवतो, ज्यात डेटाबेस आणि ॲडमिन पॅनल असतं, त्यामुळे तुम्ही स्वतः मजकूर बदलू शकता.",
    },
    { type: "info", title: "Contact", href: "/contact", text: "contact email phone call reach talk speak whatsapp linkedin address location located where pune tuljapur office visit", answer: contact, mr: `आमच्याशी थेट संपर्क साधा: ${people}. किंवा संपर्क फॉर्म भरा.` },
    { type: "info", title: "Pricing", href: "/pricing", text: "price pricing cost quote quotation charges fee budget how much expensive cheap rate", answer: "Every project is scoped to your needs, so we do not publish fixed prices. After a short conversation we send a written proposal with scope, timeline and cost. Third-party tool and API costs are billed separately and explained up front.", mr: "प्रत्येक प्रकल्पाची किंमत गरजेनुसार ठरते, म्हणून आम्ही ठराविक दर जाहीर करत नाही. थोड्या चर्चेनंतर आम्ही व्याप्ती, वेळ आणि खर्चासह लेखी प्रस्ताव पाठवतो." },
    { type: "info", title: "Book a consultation", href: "/book-consultation", text: "consultation book appointment meeting call demo walkthrough schedule discuss", answer: "You can request a consultation and tell us a preferred time. A request is not a confirmed booking until we reply to you.", mr: "तुम्ही कन्सल्टेशनची विनंती करून सोयीची वेळ सांगू शकता. आम्ही उत्तर देईपर्यंत ती विनंती पक्की भेट नसते." },
    { type: "info", title: "Custom apps", href: "/custom-apps", text: "custom app apps application software portal dashboard internal tool build develop website web", answer: "We build custom internal business apps and dashboards: an AI policy assistant, procurement and requisition tracking, daily field reporting, asset tracking, HR tools, work status, staff directory, Zoho CRM and People dashboards, and a Tally dashboard for the director.", mr: "आम्ही कस्टम अंतर्गत बिझनेस ॲप्स व डॅशबोर्ड्स बनवतो: AI पॉलिसी असिस्टंट, प्रोक्युअरमेंट ट्रॅकिंग, दैनिक फील्ड रिपोर्टिंग, ॲसेट ट्रॅकिंग, HR टूल्स, Zoho CRM व People डॅशबोर्ड आणि डायरेक्टरसाठी Tally डॅशबोर्ड." },
    { type: "info", title: "About us", href: "/about", text: "about who team founder company experience rushikesh rutuja nargale", answer: `RushiTech.AI is run by Rushikesh Nargale (AI Automation Specialist) and Rutuja Nargale. Both have working knowledge of AI tools such as ChatGPT, Claude and Grok. ${s.footer?.text || ""}` },
  );
  cache = { at: Date.now(), docs, contact };
  return cache;
}

function rank(query: string, docs: Doc[]) {
  const q = tokenize(query);
  if (!q.length) return [];
  const df = new Map<string, number>();
  const toks = docs.map((d) => new Set(tokenize(d.text)));
  toks.forEach((set) => set.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  return docs
    .map((d, i) => {
      let score = 0;
      const title = new Set(tokenize(d.title));
      for (const t of q) {
        if (toks[i].has(t)) score += Math.log(1 + docs.length / (df.get(t) || 1));
        if (title.has(t)) score += 2;
      }
      return { d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

const GREET = /^(hi+|hello+|hey+|namaste|namaskar|नमस्कार|नमस्ते|good (morning|afternoon|evening))\b/i;
const THANKS = /\b(thanks|thank you|thx|dhanyavad|आभार|धन्यवाद)\b/i;

/** Built-in answers from the site's own content. No external service, always available. */
export async function localAnswer(message: string): Promise<ChatReply> {
  const { docs, contact } = await knowledge();
  const m = message.trim();
  if (GREET.test(m) && m.split(/\s+/).length <= 4) {
    return { source: "site", text: "Hello! I can answer questions about our services, custom apps, pricing and how to reach us. What would you like to know?", links: [{ label: "Services", href: "/services" }, { label: "Custom apps", href: "/custom-apps" }] };
  }
  if (THANKS.test(m) && m.split(/\s+/).length <= 5) return { source: "site", text: "You're welcome! If you would like to talk to the team, send us an enquiry any time.", links: [{ label: "Contact us", href: "/contact" }] };
  const ranked = rank(m, docs);
  if (!ranked.length || ranked[0].score < 2.2) {
    return {
      source: "site",
      text: DEV.test(m) ? `मला याचं नक्की उत्तर माहीत नाही, कृपया टीमशी संपर्क करा. ${contact}` : `I'm not sure about that one. ${contact}`,
      links: [{ label: "Contact us", href: "/contact" }, { label: "Book a consultation", href: "/book-consultation" }],
    };
  }
  const best = ranked[0].d;
  const extra = ranked.slice(1, 3).filter((r) => r.score > ranked[0].score * 0.55 && r.d.href !== best.href).map((r) => r.d);
  const marathi = DEV.test(m);
  const text = marathi && best.mr ? best.mr : best.type === "faq" || best.type === "info" ? best.answer : firstSentences(best.answer, 3);
  const links = [best, ...extra].slice(0, 3).map((d) => ({ label: d.title.length > 38 ? d.title.slice(0, 36) + "…" : d.title, href: d.href }));
  if (best.href !== "/contact") links.push({ label: "Talk to us", href: "/contact" });
  return { source: "site", text, links: links.slice(0, 4) };
}

/** Optional: better answers through Gemini when GEMINI_API_KEY is set. Falls back to localAnswer on any problem. */
export async function aiAnswer(history: { role: "user" | "bot"; text: string }[]): Promise<ChatReply | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const { docs, contact } = await knowledge();
  const last = history[history.length - 1]?.text || "";
  const ctx = rank(last, docs).slice(0, 5).map((r) => `## ${r.d.title}\n${r.d.answer}`).join("\n\n");
  const system = [
    "You are the website assistant for RushiTech.AI, an AI automation and custom business software business run by Rushikesh Nargale and Rutuja Nargale.",
    "Answer only from the CONTEXT below. If the answer is not there, say you are not sure and suggest contacting the team. Never invent prices, clients, results or guarantees.",
    "Keep answers under 90 words, friendly and plain. Reply in the same language the visitor uses (English or Marathi).",
    `Contact: ${contact}`,
    `CONTEXT:\n${ctx || "(no matching content)"}`,
  ].join("\n");
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: history.slice(-6).map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text.slice(0, 500) }] })),
        generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const text = String(j?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    if (!text) return null;
    const links = rank(last, docs).slice(0, 2).map((r) => ({ label: r.d.title.slice(0, 38), href: r.d.href }));
    links.push({ label: "Talk to us", href: "/contact" });
    return { source: "ai", text: text.slice(0, 900), links };
  } catch {
    return null;
  }
}
