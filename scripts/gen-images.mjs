// Generates the original SVG illustrations in public/img. Run: node scripts/gen-images.mjs
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "public", "img");
fs.mkdirSync(OUT, { recursive: true });

const C = { brand: "#2f80ff", cyan: "#22d3ee", ink: "#081226", panel: "#0f2144", panel2: "#12295a", line: "rgba(255,255,255,.14)", text: "#e6eefc", muted: "#6f8ab8", green: "#34d399", amber: "#fbbf24", pink: "#f472b6" };

/* ---------- primitives ---------- */
const panel = (x, y, w, h, r = 18, fill = C.panel) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${C.line}"/>`;
const circle = (cx, cy, r, fill = C.brand, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const text = (x, y, s, size = 22, fill = C.text, w = 600, anchor = "start") => `<text x="${x}" y="${y}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const bar = (x, y, w, h = 10, fill = C.muted, o = 0.5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" opacity="${o}"/>`;
const flow = (d, color = C.cyan, delay = 0) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 12" class="flow" style="animation-delay:${delay}s"/>`;
const link = (d) => `<path d="${d}" fill="none" stroke="${C.line}" stroke-width="3"/>`;
const node = (cx, cy, r, label, fill = C.brand) => `<g class="pulse" style="animation-delay:${(cx % 7) / 3}s">${circle(cx, cy, r + 10, fill, 'opacity=".18"')}${circle(cx, cy, r, fill)}${label ? text(cx, cy + 7, label, 20, "#fff", 700, "middle") : ""}</g>`;
const check = (cx, cy, r = 16, fill = C.green) => `${circle(cx, cy, r, fill)}<path d="M${cx - r / 2.2} ${cy} l${r / 2.6} ${r / 2.4} l${r / 1.6} -${r / 1.5}" fill="none" stroke="#04210f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const win = (x, y, w, h, title = "") => `${panel(x, y, w, h, 16)}<path d="M${x} ${y + 34}H${x + w}" stroke="${C.line}"/>${circle(x + 22, y + 17, 5, "#ff6b6b")}${circle(x + 40, y + 17, 5, C.amber)}${circle(x + 58, y + 17, 5, C.green)}${title ? text(x + w / 2, y + 23, title, 14, C.muted, 600, "middle") : ""}`;
const doc = (x, y, w, h, lines = 4, accent = C.brand) => `<g>${panel(x, y, w, h, 12, "#16305f")}<path d="M${x + w - 28} ${y}v28h28" fill="${C.panel}" stroke="${C.line}"/>${Array.from({ length: lines }, (_, i) => bar(x + 16, y + 40 + i * 20, i % 3 === 2 ? w * 0.4 : w - 52, 8, i === 0 ? accent : C.muted, i === 0 ? 0.9 : 0.5)).join("")}</g>`;
const bars = (x, y, w, h, vals, fill = C.cyan) => { const bw = w / vals.length; return vals.map((v, i) => `<rect x="${x + i * bw + 6}" y="${y + h - v * h}" width="${bw - 12}" height="${v * h}" rx="6" fill="${i % 2 ? C.brand : fill}" class="grow" style="animation-delay:${i * 0.15}s"/>`).join(""); };
const person = (cx, cy, s = 1, fill = C.brand) => `<g transform="translate(${cx} ${cy}) scale(${s})">${circle(0, -22, 18, fill)}<path d="M-34 36c0-24 15-38 34-38s34 14 34 38z" fill="${fill}" opacity=".85"/></g>`;
const chat = (x, y, w, h, fill = C.brand, tail = "l", lines = 2) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}"/><path d="${tail === "l" ? `M${x + 22} ${y + h - 2}l-12 18l30 -18z` : `M${x + w - 22} ${y + h - 2}l12 18l-30 -18z`}" fill="${fill}"/>${Array.from({ length: lines }, (_, i) => bar(x + 20, y + 22 + i * 20, w - 40 - i * 36, 8, "#fff", 0.85)).join("")}</g>`;
const cal = (x, y, w, h) => `<g>${panel(x, y, w, h, 16)}<rect x="${x}" y="${y}" width="${w}" height="38" rx="16" fill="${C.brand}"/>${Array.from({ length: 12 }, (_, i) => circle(x + 30 + (i % 4) * ((w - 60) / 3), y + 74 + Math.floor(i / 4) * 40, 11, i === 6 ? C.cyan : C.panel2)).join("")}</g>`;
const magnifier = (cx, cy, r) => `<g>${circle(cx, cy, r, "none", `stroke="${C.cyan}" stroke-width="8"`)}<path d="M${cx + r * 0.72} ${cy + r * 0.72}l${r * 0.7} ${r * 0.7}" stroke="${C.cyan}" stroke-width="10" stroke-linecap="round"/></g>`;
const mic = (cx, cy) => `<g><rect x="${cx - 22}" y="${cy - 52}" width="44" height="76" rx="22" fill="${C.cyan}"/><path d="M${cx - 38} ${cy - 6}a38 38 0 0 0 76 0M${cx} ${cy + 34}v26M${cx - 22} ${cy + 60}h44" fill="none" stroke="${C.text}" stroke-width="6" stroke-linecap="round"/></g>`;
const wave = (x, y, n = 18, h = 80) => Array.from({ length: n }, (_, i) => `<rect x="${x + i * 16}" y="${y - (Math.abs(Math.sin(i * 0.9)) * h) / 2 - 6}" width="8" height="${Math.abs(Math.sin(i * 0.9)) * h + 12}" rx="4" fill="${i % 3 ? C.brand : C.cyan}" class="wv" style="animation-delay:${i * 0.07}s"/>`).join("");
const funnel = (cx, y, w, h) => `<path d="M${cx - w / 2} ${y}h${w}l-${w * 0.34} ${h * 0.5}v${h * 0.5}l-${w * 0.32} -${h * 0.12}v-${h * 0.38}z" fill="${C.brand}" opacity=".9"/>`;
const gear = (cx, cy, r, fill = C.brand) => { const teeth = 8; let d = ""; for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2; d += `<rect x="${cx - 9}" y="${cy - r - 10}" width="18" height="22" rx="4" fill="${fill}" transform="rotate(${(a * 180) / Math.PI} ${cx} ${cy})"/>`; } return `<g class="spin" style="transform-origin:${cx}px ${cy}px">${d}${circle(cx, cy, r, fill)}${circle(cx, cy, r * 0.42, C.ink)}</g>`; };
const arrow = (x1, y1, x2, y2, color = C.cyan) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
const chip = (cx, cy, s = 70) => `<g>${panel(cx - s / 2, cy - s / 2, s, s, 14, C.brand)}${Array.from({ length: 4 }, (_, i) => `<path d="M${cx - s / 2 - 12} ${cy - s / 3 + i * 16}h12M${cx + s / 2} ${cy - s / 3 + i * 16}h12" stroke="${C.cyan}" stroke-width="4" stroke-linecap="round"/>`).join("")}${text(cx, cy + 9, "AI", 28, "#fff", 800, "middle")}</g>`;
const tag = (x, y, s, fill = C.panel2) => `<g>${panel(x, y, s.length * 11 + 28, 36, 18, fill)}${text(x + 14, y + 24, s, 16, C.text, 600)}</g>`;

/* ---------- frame ---------- */
function svg(name, label, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${label}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1632"/><stop offset="1" stop-color="#12295a"/></linearGradient>
<radialGradient id="g1" cx="85%" cy="10%" r="55%"><stop offset="0" stop-color="${C.brand}" stop-opacity=".45"/><stop offset="1" stop-color="${C.brand}" stop-opacity="0"/></radialGradient>
<radialGradient id="g2" cx="8%" cy="95%" r="45%"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".25"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" opacity=".07"/></pattern>
<style>
.flow{animation:flow 1.6s linear infinite}@keyframes flow{to{stroke-dashoffset:-30}}
.pulse{animation:pulse 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pulse{50%{transform:scale(1.07)}}
.float{animation:float 5s ease-in-out infinite}@keyframes float{50%{transform:translateY(-10px)}}
.spin{animation:spin 14s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.grow{animation:grow 3s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom}@keyframes grow{50%{transform:scaleY(.82)}}
.wv{animation:wv 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes wv{50%{transform:scaleY(.45)}}
@media (prefers-reduced-motion:reduce){.flow,.pulse,.float,.spin,.grow,.wv{animation:none}}
</style>
</defs>
<rect width="1200" height="675" fill="url(#bg)"/><rect width="1200" height="675" fill="url(#dots)"/><rect width="1200" height="675" fill="url(#g1)"/><rect width="1200" height="675" fill="url(#g2)"/>
${inner}
</svg>`;
}
const save = (name, label, inner) => fs.writeFileSync(path.join(OUT, name + ".svg"), svg(name, label, inner));

/* ---------- scenes ---------- */
// AI automation: central chip with satellite nodes
save("ai-automation", "AI automation connecting documents, chat, data and workflows",
  [[260, 170], [260, 505], [940, 170], [940, 505], [600, 90], [600, 585]].map(([x, y], i) => flow(`M600 337 L${x} ${y}`, i % 2 ? C.brand : C.cyan, i * 0.2)).join("") +
  `<g class="float">${chip(600, 337, 150)}</g>` +
  node(260, 170, 38, "", C.brand) + node(260, 505, 38, "", C.cyan) + node(940, 170, 38, "", C.cyan) + node(940, 505, 38, "", C.brand) + node(600, 90, 34, "", C.brand) + node(600, 585, 34, "", C.cyan) +
  doc(222, 140, 76, 60, 2).replace(/<rect/, "<rect") + chat(910, 142, 62, 44, C.panel2, "l", 1) + `<g transform="translate(228 478)">${bars(0, 0, 64, 52, [0.5, 0.9, 0.7])}</g>` + gear(940, 505, 20, C.ink) +
  text(600, 650, "AI that works across your tools", 22, C.muted, 600, "middle"));

// Business automation: trigger → steps → done
save("business-automation", "A business process flowing from trigger through automated steps to done",
  panel(70, 230, 220, 210) + text(180, 290, "Trigger", 24, C.cyan, 700, "middle") + doc(130, 310, 100, 100, 3) +
  panel(490, 160, 220, 130) + text(600, 215, "Validate", 22, C.text, 700, "middle") + check(600, 255, 16, C.green) +
  panel(490, 380, 220, 130) + text(600, 435, "Update records", 22, C.text, 700, "middle") + bars(560, 450, 80, 40, [0.5, 0.8, 0.6]) +
  panel(910, 230, 220, 210) + text(1020, 290, "Done", 24, C.green, 700, "middle") + check(1020, 365, 40) +
  link("M290 335 C390 335 390 225 490 225") + link("M290 335 C390 335 390 445 490 445") + link("M710 225 C810 225 810 335 910 335") + link("M710 445 C810 445 810 335 910 335") +
  flow("M290 335 C390 335 390 225 490 225") + flow("M290 335 C390 335 390 445 490 445", C.brand, .4) + flow("M710 225 C810 225 810 335 910 335", C.cyan, .8) + flow("M710 445 C810 445 810 335 910 335", C.brand, 1.2) +
  text(600, 600, "Repeatable steps, no manual copying", 22, C.muted, 600, "middle"));

// Custom software: dashboard window
save("custom-software", "A custom business dashboard application",
  win(150, 90, 900, 500, "Business dashboard") +
  panel(180, 150, 190, 120, 14, C.panel2) + text(200, 195, "Orders", 18, C.muted) + text(200, 245, "128", 44, "#fff", 800) +
  panel(390, 150, 190, 120, 14, C.panel2) + text(410, 195, "Tasks", 18, C.muted) + text(410, 245, "42", 44, C.cyan, 800) +
  panel(600, 150, 190, 120, 14, C.panel2) + text(620, 195, "Reports", 18, C.muted) + text(620, 245, "16", 44, "#fff", 800) +
  panel(810, 150, 210, 120, 14, C.panel2) + `<g transform="translate(830 170)">${bars(0, 0, 170, 80, [0.4, 0.7, 0.5, 0.9, 0.6])}</g>` +
  panel(180, 295, 520, 260, 14, C.panel2) + Array.from({ length: 5 }, (_, i) => bar(205, 330 + i * 44, 470, 12, i === 0 ? C.cyan : C.muted, i === 0 ? 0.9 : 0.45)).join("") +
  panel(720, 295, 300, 260, 14, C.panel2) + `<g class="float">${circle(870, 425, 70, "none", `stroke="${C.brand}" stroke-width="22" stroke-dasharray="260 180"`)}${circle(870, 425, 70, "none", `stroke="${C.cyan}" stroke-width="22" stroke-dasharray="100 340" stroke-dashoffset="-260"`)}</g>`);

// AI agents: hub with tool nodes
save("ai-agents", "An AI agent using several business tools to complete a task",
  [[250, 200], [250, 475], [950, 200], [950, 475]].map(([x, y], i) => link(`M600 337 L${x} ${y}`) + flow(`M600 337 L${x} ${y}`, i % 2 ? C.brand : C.cyan, i * 0.3)).join("") +
  `<g class="float">${circle(600, 337, 96, C.panel2)}${circle(600, 320, 36, C.cyan)}<path d="M545 395c0-30 25-48 55-48s55 18 55 48z" fill="${C.cyan}"/>${circle(586, 316, 5, C.ink)}${circle(614, 316, 5, C.ink)}</g>` +
  panel(130, 160, 240, 80) + text(250, 210, "Email", 24, C.text, 700, "middle") + panel(130, 435, 240, 80) + text(250, 485, "Calendar", 24, C.text, 700, "middle") +
  panel(830, 160, 240, 80) + text(950, 210, "CRM", 24, C.text, 700, "middle") + panel(830, 435, 240, 80) + text(950, 485, "Sheets", 24, C.text, 700, "middle") +
  tag(480, 560, "Plan  →  Act  →  Review"));

// Chatbots
save("ai-chatbots", "A chatbot answering a customer question",
  win(300, 80, 600, 520, "Website chat") +
  chat(340, 150, 300, 70, C.panel2, "l", 2) + chat(560, 250, 300, 70, C.brand, "r", 2) + chat(340, 350, 330, 90, C.panel2, "l", 3) +
  `<g class="float">${chat(580, 470, 260, 60, C.cyan, "r", 1)}</g>` + panel(330, 540, 540, 40, 20, C.ink) + bar(350, 556, 200, 8) + circle(845, 560, 14, C.brand));

// Voice agents
save("ai-voice-agents", "An AI voice agent handling a phone call",
  `<g class="float">${mic(600, 270)}</g>` + wave(300, 470, 38, 90) +
  panel(140, 120, 260, 90) + text(270, 175, "Incoming call", 22, C.text, 700, "middle") + circle(190, 165, 14, C.green) +
  panel(800, 120, 260, 90) + text(930, 175, "Details saved", 22, C.text, 700, "middle") + check(850, 165, 14) +
  flow("M400 165 C520 165 520 215 570 230", C.cyan) + flow("M630 230 C700 215 720 165 800 165", C.brand, .5));

// Software integration: apps around API hub
save("software-integration", "Different business applications connected through an API hub",
  [[200, 160], [200, 515], [1000, 160], [1000, 515], [600, 100]].map(([x, y], i) => link(`M600 337 L${x} ${y}`) + flow(`M600 337 L${x} ${y}`, i % 2 ? C.brand : C.cyan, i * 0.25)).join("") +
  `<g class="pulse">${panel(500, 267, 200, 140, 24, C.brand)}${text(600, 345, "API", 56, "#fff", 800, "middle")}</g>` +
  panel(90, 120, 220, 80) + text(200, 170, "Accounts", 22, C.text, 700, "middle") + panel(90, 475, 220, 80) + text(200, 525, "CRM", 22, C.text, 700, "middle") +
  panel(890, 120, 220, 80) + text(1000, 170, "HR", 22, C.text, 700, "middle") + panel(890, 475, 220, 80) + text(1000, 525, "Sheets", 22, C.text, 700, "middle") +
  panel(490, 40, 220, 70) + text(600, 85, "Website", 22, C.text, 700, "middle"));

// Estimation / BOQ
save("ai-estimation", "A bill of quantities table being filled and totalled automatically",
  win(120, 90, 700, 500, "BOQ") +
  ["Item", "Qty", "Rate", "Amount"].map((h, i) => text(160 + i * 160, 160, h, 18, C.muted, 700)).join("") +
  Array.from({ length: 5 }, (_, r) => [0, 1, 2, 3].map((c) => bar(160 + c * 160, 195 + r * 52, c === 0 ? 110 : 80, 12, r === 1 ? C.cyan : C.muted, r === 1 ? 0.9 : 0.45)).join("")).join("") +
  panel(160, 480, 620, 70, 14, C.panel2) + text(190, 525, "Total", 24, C.muted, 700) + text(750, 528, "Estimate ready", 26, C.cyan, 800, "end") +
  `<g class="float" transform="translate(880 150)">${panel(0, 0, 220, 330, 20, C.panel2)}${panel(20, 24, 180, 60, 10, C.ink)}${Array.from({ length: 12 }, (_, i) => circle(50 + (i % 3) * 60, 130 + Math.floor(i / 3) * 52, 19, i === 11 ? C.cyan : C.panel)).join("")}</g>`);

// Tender agent
save("ai-tender-agent", "An agent searching tenders and tracking deadlines",
  panel(100, 110, 600, 460) + magnifier(210, 220, 56) +
  Array.from({ length: 4 }, (_, i) => `${panel(290, 150 + i * 100, 380, 80, 14, C.panel2)}${bar(310, 175 + i * 100, 240, 10, i === 0 ? C.cyan : C.muted, i === 0 ? 0.95 : 0.5)}${bar(310, 200 + i * 100, 160, 8)}${i === 0 ? check(640, 190, 14) : ""}`).join("") +
  `<g class="float">${cal(780, 140, 330, 250)}</g>` + panel(780, 420, 330, 110, 18, C.panel2) + text(945, 468, "Deadline alert", 22, C.amber, 700, "middle") + text(945, 504, "3 days left", 18, C.muted, 600, "middle"));

// Accounts automation
save("accounts-automation", "Accounts data entry and reporting automated",
  panel(90, 120, 380, 440) + text(120, 175, "Invoices", 24, C.text, 700) + Array.from({ length: 5 }, (_, i) => `${bar(120, 210 + i * 62, 220, 10, i === 2 ? C.cyan : C.muted, i === 2 ? .95 : .5)}${bar(120, 232 + i * 62, 140, 8)}${text(440, 232 + i * 62, "₹", 22, C.muted, 700, "end")}`).join("") +
  flow("M470 340 C540 340 560 340 630 340", C.cyan) + `<path d="M620 322l24 18l-24 18" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
  panel(660, 120, 450, 440) + text(690, 175, "Report", 24, C.text, 700) + `<g class="float">${bars(700, 215, 370, 200, [0.4, 0.55, 0.45, 0.7, 0.6, 0.9])}</g>` + bar(700, 450, 300, 10, C.cyan, .8) + bar(700, 480, 200, 8));

// Tally integration
save("tally-integration", "Data syncing between an accounting system and other tools",
  panel(110, 190, 360, 300, 24) + text(290, 270, "Accounting", 30, "#fff", 800, "middle") + Array.from({ length: 4 }, (_, i) => bar(160, 310 + i * 40, i % 2 ? 190 : 250, 10, C.muted, .5)).join("") +
  panel(730, 190, 360, 300, 24) + text(910, 270, "Other tools", 30, "#fff", 800, "middle") + `<g transform="translate(790 300)">${bars(0, 0, 240, 150, [0.4, 0.8, 0.6, 0.95])}</g>` +
  flow("M470 300 H730", C.cyan) + flow("M730 380 H470", C.brand, .6) + `<path d="M700 288l30 12l-30 12M500 368l-30 12l30 12" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` + tag(525, 520, "Import  ·  Export"));

// Zoho automation
save("zoho-automation", "Expense and CRM workflows connected across applications",
  [[240, 220], [600, 140], [960, 220], [420, 480], [780, 480]].map(([x, y], i) => `${panel(x - 100, y - 55, 200, 110, 18, i % 2 ? C.panel2 : C.panel)}${bar(x - 70, y - 22, 120, 10, i === 1 ? C.cyan : C.muted, .8)}${bar(x - 70, y + 4, 80, 8)}${check(x + 66, y + 30, 12)}`).join("") +
  flow("M340 200 L500 160") + flow("M700 160 L860 200", C.brand, .3) + flow("M300 270 L350 430", C.cyan, .6) + flow("M900 270 L860 430", C.brand, .9) + flow("M520 480 H680", C.cyan, 1.2) + tag(490, 585, "Approvals  ·  Reports  ·  CRM"));

// HR automation
save("hr-automation", "Employee onboarding steps automated",
  [[250, 240], [600, 240], [950, 240]].map(([x, y], i) => `${panel(x - 130, y - 110, 260, 220, 24)}${person(x, y - 10, 1.2, [C.brand, C.cyan, C.green][i])}${bar(x - 80, y + 70, 160, 10, C.muted, .6)}`).join("") +
  flow("M385 240 H465") + flow("M735 240 H815", C.brand, .5) +
  panel(200, 420, 800, 180, 24, C.panel2) + ["Offer accepted", "Accounts created", "Documents signed"].map((s, i) => `${check(260 + i * 270, 510, 14)}${text(284 + i * 270, 517, s, 20, C.text, 600)}`).join(""));

// Sales automation
save("sales-automation", "Leads moving through a sales pipeline with automated follow-ups",
  `<g class="float">${funnel(360, 110, 420, 380)}</g>` + [0, 1, 2].map((i) => person(250 + i * 110, 90, .7, [C.cyan, C.brand, C.green][i])).join("") +
  panel(700, 150, 400, 360, 22) + text(730, 205, "Pipeline", 24, C.text, 700) +
  ["New", "Contacted", "Proposal", "Won"].map((s, i) => `${bar(730, 240 + i * 58, 80 + (3 - i) * 70, 14, [C.muted, C.brand, C.cyan, C.green][i], .9)}${text(730 + 100 + (3 - i) * 70, 253 + i * 58, s, 16, C.muted, 600)}`).join("") +
  chat(300, 540, 230, 56, C.brand, "l", 1) + tag(580, 548, "Auto follow-up"));

// Workflow automation (n8n-like)
save("workflow-automation", "A workflow of connected automation nodes",
  [[170, 337], [440, 200], [440, 474], [760, 337], [1030, 337]].map(([x, y], i) => `${panel(x - 95, y - 55, 190, 110, 20, i === 0 ? C.brand : i === 4 ? C.green : C.panel2)}${text(x, y + 8, ["Webhook", "AI step", "Sheets", "Condition", "Notify"][i], 22, i === 4 ? C.ink : "#fff", 700, "middle")}`).join("") +
  link("M265 337 C340 337 340 200 345 200") + link("M265 337 C340 337 340 474 345 474") + link("M535 200 C640 200 650 337 665 337") + link("M535 474 C640 474 650 337 665 337") + link("M855 337 H935") +
  flow("M265 337 C340 337 340 200 345 200") + flow("M265 337 C340 337 340 474 345 474", C.brand, .4) + flow("M535 200 C640 200 650 337 665 337", C.cyan, .8) + flow("M535 474 C640 474 650 337 665 337", C.brand, 1.1) + flow("M855 337 H935", C.cyan, 1.4) +
  text(600, 620, "n8n  ·  Zapier  ·  Make  ·  Python", 22, C.muted, 600, "middle"));

// Appointment
save("appointment-automation", "Appointment booking with calendar and reminders",
  `<g class="float">${cal(130, 110, 440, 440)}</g>` +
  panel(640, 130, 430, 120, 20, C.panel2) + circle(700, 190, 30, C.brand) + text(700, 199, "10", 26, "#fff", 800, "middle") + text(750, 185, "Booking confirmed", 24, C.text, 700) + bar(750, 205, 200, 8) +
  panel(640, 280, 430, 120, 20) + `${circle(700, 340, 30, C.cyan)}<path d="M700 322v20l14 8" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>` + text(750, 335, "Reminder sent", 24, C.text, 700) + bar(750, 355, 180, 8) +
  panel(640, 430, 430, 120, 20, C.panel2) + check(700, 490, 28) + text(750, 485, "Added to calendar", 24, C.text, 700) + bar(750, 505, 160, 8));

// Document AI
save("document-ai", "Documents read by AI and key fields extracted",
  `<g class="float">${doc(110, 130, 250, 340, 8)}${doc(190, 170, 250, 340, 8, C.cyan)}</g>` +
  flow("M470 340 H620", C.cyan) + `<path d="M610 322l26 18l-26 18" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
  panel(680, 130, 420, 400, 22) + text(710, 185, "Extracted", 24, C.text, 700) + ["Invoice no.", "Date", "Total", "Vendor"].map((s, i) => `${text(710, 245 + i * 64, s, 17, C.muted, 600)}${bar(710, 255 + i * 64, 200 + (i % 2) * 60, 12, i === 2 ? C.cyan : "#fff", i === 2 ? .95 : .55)}`).join("") + tag(710, 470, "Ask: “What is the total?”", C.brand));

/* ---------- section / page art ---------- */
save("about", "A team collaborating on automation projects",
  [[300, 340], [600, 300], [900, 340]].map(([x, y], i) => `${circle(x, y, 120, [C.panel2, C.panel, C.panel2][i])}${person(x, y + 6, 1.8, [C.brand, C.cyan, C.green][i])}`).join("") +
  flow("M420 330 C480 300 480 300 480 300", C.cyan) + panel(420, 500, 360, 70, 20, C.brand) + text(600, 546, "Practical AI. Honest scoping.", 22, "#fff", 700, "middle"));

save("services", "A catalogue of automation services",
  [[210, 190], [600, 190], [990, 190], [210, 430], [600, 430], [990, 430]].map(([x, y], i) => `${panel(x - 150, y - 90, 300, 180, 22, i % 2 ? C.panel2 : C.panel)}${[() => chip(x, y - 6, 80), () => chat(x - 60, y - 40, 120, 70, C.brand, "l", 2), () => gear(x, y, 36), () => `<g transform="translate(${x - 50} ${y - 50})">${bars(0, 0, 100, 90, [0.4, 0.8, 0.6])}</g>`, () => doc(x - 45, y - 60, 90, 120, 3), () => calIcon(x, y)][i]()}`).join(""));
function calIcon(x, y) { return `<g>${panel(x - 55, y - 50, 110, 100, 12)}<rect x="${x - 55}" y="${y - 50}" width="110" height="26" rx="12" fill="${C.brand}"/>${Array.from({ length: 6 }, (_, i) => circle(x - 32 + (i % 3) * 32, y - 4 + Math.floor(i / 3) * 30, 8, i === 4 ? C.cyan : C.panel2)).join("")}</g>`; }

save("problems", "Manual, disconnected work being replaced by automation",
  panel(90, 150, 430, 380, 24) + text(305, 205, "Before", 26, C.muted, 700, "middle") + Array.from({ length: 5 }, (_, i) => `${doc(130 + (i % 3) * 110 + (i > 2 ? 40 : 0), 240 + Math.floor(i / 3) * 130, 80, 100, 2, C.amber)}`).join("") +
  flow("M540 340 H660", C.cyan) + `<path d="M650 322l26 18l-26 18" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
  panel(680, 150, 430, 380, 24, C.panel2) + text(895, 205, "After", 26, C.cyan, 700, "middle") + node(780, 330, 36, "", C.brand) + node(895, 400, 36, "", C.cyan) + node(1010, 330, 36, "", C.brand) + link("M780 330L895 400L1010 330") + flow("M780 330L895 400L1010 330", C.cyan) + check(895, 270, 24));

save("industries", "Solutions for different industries",
  [[220, 250], [600, 250], [980, 250]].map(([x, y], i) => `${panel(x - 140, y - 150, 280, 300, 24, i === 1 ? C.panel2 : C.panel)}`).join("") +
  `<g transform="translate(130 130)">${panel(40, 130, 60, 140, 6, C.brand)}${panel(110, 90, 60, 180, 6, C.cyan)}${panel(180, 150, 60, 120, 6, C.brand)}</g>` +
  `<g transform="translate(500 140)">${bars(0, 20, 200, 200, [0.4, 0.7, 0.55, 0.9])}</g>` + `<g transform="translate(940 200)">${person(0, 40, 1.6, C.green)}${person(70, 60, 1.2, C.cyan)}</g>` +
  text(220, 480, "Construction", 22, C.text, 700, "middle") + text(600, 480, "Finance", 22, C.text, 700, "middle") + text(980, 480, "Services & HR", 22, C.text, 700, "middle"));

save("how-it-works", "Four steps from discovery to handover",
  ["Discovery", "Design", "Build", "Handover"].map((s, i) => `${panel(70 + i * 280, 210, 240, 250, 24, i === 2 ? C.panel2 : C.panel)}${circle(190 + i * 280, 275, 32, [C.brand, C.cyan, C.brand, C.green][i])}${text(190 + i * 280, 287, String(i + 1), 32, C.ink, 800, "middle")}${text(190 + i * 280, 360, s, 26, C.text, 700, "middle")}${bar(120 + i * 280, 395, 140, 8)}${bar(120 + i * 280, 420, 100, 8)}`).join("") +
  [0, 1, 2].map((i) => flow(`M${310 + i * 280} 335 H${350 + i * 280}`, C.cyan, i * 0.3)).join(""));

save("portfolio", "Selected automation projects",
  win(110, 110, 460, 330, "n8n workflow") + node(210, 280, 30, "", C.brand) + node(340, 230, 30, "", C.cyan) + node(340, 340, 30, "", C.brand) + node(470, 285, 30, "", C.green) + link("M210 280L340 230L470 285M210 280L340 340L470 285") + flow("M210 280L340 230L470 285") + flow("M210 280L340 340L470 285", C.brand, .5) +
  win(640, 170, 450, 330, "Booking assistant") + chat(670, 230, 220, 60, C.panel2, "l", 2) + chat(840, 320, 220, 60, C.brand, "r", 2) + check(1040, 450, 20) +
  `<g class="float">${panel(300, 470, 300, 100, 20, C.panel2)}${text(450, 530, "Diabetes risk model", 22, C.text, 700, "middle")}</g>`);

save("technologies", "Technologies and integrations",
  ["Python", "n8n", "OpenAI", "APIs", "Sheets", "Tally", "Zoho", "Next.js"].map((s, i) => `<g class="float" style="animation-delay:${i * 0.3}s">${panel(100 + (i % 4) * 265, 150 + Math.floor(i / 4) * 200, 220, 140, 22, i % 3 === 0 ? C.panel2 : C.panel)}${circle(210 + (i % 4) * 265, 205 + Math.floor(i / 4) * 200, 24, [C.brand, C.cyan, C.green][i % 3])}${text(210 + (i % 4) * 265, 268 + Math.floor(i / 4) * 200, s, 24, C.text, 700, "middle")}</g>`).join(""));

save("team", "A small team working together",
  `${circle(380, 340, 150, C.panel2)}${person(380, 345, 2.4, C.brand)}${circle(820, 340, 150, C.panel2)}${person(820, 345, 2.4, C.cyan)}` + flow("M530 330 H670", C.cyan) + tag(480, 520, "One team, one point of contact"));

save("faq", "Questions and answers",
  chat(150, 120, 480, 120, C.panel2, "l", 3) + text(210, 190, "?", 56, C.cyan, 800) + chat(570, 290, 480, 120, C.brand, "r", 3) + check(990, 350, 22, "#fff") + chat(150, 460, 380, 100, C.panel2, "l", 2));

save("pricing", "Scoped engagements",
  ["Project", "Time-based", "Support"].map((s, i) => `${panel(110 + i * 340, 170 + (i === 1 ? -30 : 0), 300, 340, 26, i === 1 ? C.panel2 : C.panel)}${text(260 + i * 340, 250 + (i === 1 ? -30 : 0), s, 28, C.text, 800, "middle")}${[0, 1, 2].map((j) => `${check(160 + i * 340, 310 + j * 56 + (i === 1 ? -30 : 0), 12)}${bar(190 + i * 340, 306 + j * 56 + (i === 1 ? -30 : 0), 150, 10, C.muted, .6)}`).join("")}`).join(""));

save("contact", "Get in touch",
  `<g class="float">${panel(300, 150, 600, 380, 28)}<path d="M300 190 L600 360 L900 190" fill="none" stroke="${C.cyan}" stroke-width="6" stroke-linejoin="round"/></g>` + circle(900, 150, 36, C.green) + check(900, 150, 20, C.ink) + tag(470, 575, "We reply to every enquiry"));

save("blog", "Articles and insights",
  [0, 1, 2].map((i) => `${panel(110 + i * 360, 160 + (i % 2) * 40, 320, 340, 22, i === 1 ? C.panel2 : C.panel)}${panel(130 + i * 360, 180 + (i % 2) * 40, 280, 130, 14, [C.brand, C.cyan, C.green][i])}${bar(135 + i * 360, 340 + (i % 2) * 40, 240, 12, "#fff", .8)}${bar(135 + i * 360, 372 + (i % 2) * 40, 200, 9)}${bar(135 + i * 360, 396 + (i % 2) * 40, 160, 9)}`).join(""));

/* ---------- blog covers (each unique) ---------- */
save("blog-process", "Mapping a business process before automating it",
  [0, 1, 2, 3].map((i) => `${panel(90 + i * 275, 220, 230, 200, 22, i % 2 ? C.panel2 : C.panel)}${circle(205 + i * 275, 285, 28, [C.brand, C.cyan, C.amber, C.green][i])}${text(205 + i * 275, 296, String(i + 1), 28, C.ink, 800, "middle")}${bar(130 + i * 275, 340, 150, 10)}${bar(130 + i * 275, 366, 110, 8)}`).join("") +
  [0, 1, 2].map((i) => flow(`M${320 + i * 275} 320 H${365 + i * 275}`, C.cyan, i * 0.3)).join("") + tag(420, 500, "Map it first, automate second"));

save("blog-tools", "Comparing workflow automation tools",
  [["n8n", C.brand], ["Zapier", C.amber], ["Make", C.pink]].map(([s, c], i) => `<g class="float" style="animation-delay:${i * 0.5}s">${panel(100 + i * 365, 150, 320, 360, 26)}${circle(260 + i * 365, 245, 46, c)}${text(260 + i * 365, 346, s, 34, C.text, 800, "middle")}${[0, 1, 2].map((j) => `${check(150 + i * 365, 400 + j * 34, 10)}${bar(172 + i * 365, 395 + j * 34, 150, 9, C.muted, .6)}`).join("")}</g>`).join(""));

save("blog-chatbot", "A chatbot answering from company documents",
  doc(110, 160, 220, 300, 6) + doc(160, 200, 220, 300, 6, C.cyan) + flow("M420 340 H560", C.cyan) +
  win(600, 130, 500, 420, "Assistant") + chat(630, 190, 300, 70, C.panel2, "l", 2) + chat(780, 290, 290, 70, C.brand, "r", 2) + `<g class="float">${tag(640, 420, "Source: policy.pdf p.4", C.panel2)}</g>`);

save("blog-boq", "Automating bill of quantities and quotations",
  panel(100, 120, 520, 430, 22) + Array.from({ length: 6 }, (_, r) => [0, 1, 2].map((c) => bar(130 + c * 160, 160 + r * 60, c === 0 ? 120 : 80, 12, r === 2 ? C.cyan : C.muted, r === 2 ? .9 : .45)).join("")).join("") +
  `<g class="float">${panel(700, 140, 400, 180, 22, C.panel2)}${text(900, 210, "Quotation", 30, C.text, 800, "middle")}${bar(750, 240, 300, 10, C.cyan, .8)}${bar(750, 266, 220, 8)}</g>` + `${panel(700, 350, 400, 180, 22)}${check(760, 440, 26)}${text(810, 435, "Reviewed by estimator", 22, C.text, 700)}${bar(810, 455, 200, 8)}`);

save("blog-integration", "Connecting accounting and CRM systems",
  `${panel(110, 130, 300, 190, 22)}${text(260, 240, "Accounting", 28, C.text, 800, "middle")}${panel(790, 130, 300, 190, 22)}${text(940, 240, "CRM", 28, C.text, 800, "middle")}${panel(110, 380, 300, 190, 22)}${text(260, 490, "Sheets", 28, C.text, 800, "middle")}${panel(790, 380, 300, 190, 22)}${text(940, 490, "HR", 28, C.text, 800, "middle")}` +
  `<g class="pulse">${circle(600, 345, 90, C.brand)}${text(600, 362, "API", 48, "#fff", 800, "middle")}</g>` + [["M410 225 L520 310"], ["M790 225 L680 310"], ["M410 475 L520 380"], ["M790 475 L680 380"]].map((p, i) => flow(p[0], i % 2 ? C.brand : C.cyan, i * 0.3)).join(""));

save("blog-checklist", "A checklist to review before automating",
  panel(280, 90, 640, 500, 28) + ["Clear goal", "Owner named", "Data cleaned", "Tested with real cases", "Fallback to a person"].map((s, i) => `${check(340, 180 + i * 76, 20, i < 4 ? C.green : C.amber)}${text(380, 188 + i * 76, s, 26, C.text, 600)}${bar(380, 205 + i * 76, 220 - i * 10, 6, C.muted, .4)}`).join(""));

/* ---------- FAQ group art ---------- */
save("faq-general", "General questions",
  `<g class="float">${circle(600, 337, 170, C.panel2)}${text(600, 395, "?", 230, C.cyan, 800, "middle")}</g>` + [[250, 200], [950, 200], [250, 480], [950, 480]].map(([x, y], i) => node(x, y, 36, "", [C.brand, C.cyan, C.green, C.amber][i])).join(""));
save("faq-services", "Questions about services",
  [0, 1, 2].map((i) => `${panel(130 + i * 340, 170, 300, 320, 24, i === 1 ? C.panel2 : C.panel)}${[() => chip(280, 290, 90), () => gear(620, 290, 46), () => `<g transform="translate(920 245)">${bars(0, 0, 100, 90, [0.4, 0.8, 0.6])}</g>`][i]()}${bar(180 + i * 340, 400, 200, 10)}${bar(180 + i * 340, 426, 140, 8)}`).join(""));
save("faq-pricing", "Questions about pricing and timelines",
  `${cal(130, 120, 420, 430)}` + `<g class="float">${panel(640, 150, 430, 150, 22, C.panel2)}${text(855, 235, "Scoped to your needs", 28, C.text, 800, "middle")}</g>` + panel(640, 340, 430, 150, 22) + `${text(855, 425, "Written proposal", 28, C.cyan, 800, "middle")}`);
save("faq-technical", "Questions about integrations and security",
  `${panel(380, 130, 440, 400, 30)}<g class="float"><path d="M600 190l110 40v90c0 80-50 130-110 160-60-30-110-80-110-160v-90z" fill="${C.brand}"/>${check(600, 330, 38, "#fff")}</g>` + flow("M200 337 H370", C.cyan) + flow("M830 337 H1000", C.brand, .5) + tag(110, 380, "APIs") + tag(960, 380, "Webhooks"));

/* ---------- parametric scenes: every placement on the site gets its own image ---------- */
const mail = () => `<g>${panel(-90, -60, 180, 120, 14)}<path d="M-90 -50L0 14L90 -50" fill="none" stroke="${C.cyan}" stroke-width="6" stroke-linejoin="round"/></g>`;
const shield = () => `<g><path d="M0 -100l80 30v62c0 56-36 92-80 112-44-20-80-56-80-112v-62z" fill="${C.brand}"/>${check(0, -4, 34, "#fff")}</g>`;
const clock = () => `<g>${circle(0, 0, 80, C.panel2)}${circle(0, 0, 80, "none", `stroke="${C.cyan}" stroke-width="8"`)}<path d="M0 -44V0l30 20" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const pie = () => `<g class="float">${circle(0, 0, 72, "none", `stroke="${C.brand}" stroke-width="32" stroke-dasharray="190 262"`)}${circle(0, 0, 72, "none", `stroke="${C.cyan}" stroke-width="32" stroke-dasharray="120 332" stroke-dashoffset="-190"`)}${circle(0, 0, 72, "none", `stroke="${C.green}" stroke-width="32" stroke-dasharray="60 392" stroke-dashoffset="-310"`)}</g>`;
const chain = () => `<g>${circle(-50, 0, 44, "none", `stroke="${C.cyan}" stroke-width="14"`)}${circle(50, 0, 44, "none", `stroke="${C.brand}" stroke-width="14"`)}</g>`;
const netw = () => `${link("M-90 -40L0 50L90 -40M-90 -40L0 -90L90 -40")}${flow("M-90 -40L0 50L90 -40", C.cyan)}${flow("M-90 -40L0 -90L90 -40", C.brand, .5)}${node(-90, -40, 22, "", C.brand)}${node(0, 50, 22, "", C.cyan)}${node(90, -40, 22, "", C.green)}${node(0, -90, 22, "", C.amber)}`;
const MOTIF = {
  chip: () => chip(0, 0, 130),
  chat: () => chat(-120, -70, 190, 90, C.brand, "l", 2) + chat(-10, 24, 190, 80, C.cyan, "r", 2),
  doc: () => doc(-80, -105, 160, 210, 5),
  bars: () => bars(-100, -90, 200, 170, [0.4, 0.8, 0.55, 0.95, 0.7]),
  gear: () => gear(-34, 10, 52) + gear(58, -34, 32, C.cyan),
  cal: () => cal(-110, -100, 220, 200),
  mag: () => magnifier(-24, -24, 62),
  funnel: () => funnel(0, -110, 220, 210),
  person: () => person(-56, 10, 1.8) + person(62, 24, 1.4, C.cyan),
  mic: () => mic(0, -20) + wave(-130, 90, 17, 60),
  check: () => check(0, 0, 66),
  net: netw,
  win: () => win(-150, -105, 300, 210, ""),
  mail, shield, clock, pie, link: chain,
};
const PAL = [["#2f80ff", "#22d3ee"], ["#14b8a6", "#34d399"], ["#8b5cf6", "#22d3ee"], ["#10b981", "#2f80ff"], ["#f59e0b", "#2f80ff"], ["#ec4899", "#22d3ee"]];
const LAYOUT = [
  [[600, 320, 1.5], [230, 170, 0.7], [970, 500, 0.7]],
  [[250, 330, 1.05], [600, 330, 1.05], [950, 330, 1.05]],
  [[340, 340, 1.6], [860, 200, 0.95], [860, 480, 0.95]],
  [[250, 200, 0.85], [600, 350, 1.4], [950, 500, 0.85]],
  [[860, 340, 1.6], [320, 200, 0.95], [320, 480, 0.95]],
  [[600, 330, 1.7], [190, 500, 0.65], [1010, 170, 0.65]],
];
function art(name, label, motifs, caption, i) {
  const [a, b] = PAL[i % 6];
  const lay = LAYOUT[(i * 5 + 1) % 6];
  let inner = "";
  lay.forEach(([x, y, s], k) => { inner += panel(x - 160 * s, y - 135 * s, 320 * s, 270 * s, 24, k === 0 ? C.panel2 : C.panel); });
  inner += flow(`M${lay[0][0]} ${lay[0][1]} L${lay[1][0]} ${lay[1][1]}`, C.cyan) + flow(`M${lay[0][0]} ${lay[0][1]} L${lay[2][0]} ${lay[2][1]}`, C.brand, 0.5);
  lay.forEach(([x, y, s], k) => { inner += `<g transform="translate(${x} ${y}) scale(${s})" class="${k === 0 ? "float" : ""}">${MOTIF[motifs[k]]()}</g>`; });
  if (caption) inner += tag(600 - (caption.length * 11 + 28) / 2, 612, caption);
  let out = svg(name, label, inner);
  out = out.replaceAll("#2f80ff", "@A@").replaceAll("#22d3ee", "@B@").replaceAll("@A@", a).replaceAll("@B@", b);
  fs.writeFileSync(path.join(OUT, name + ".svg"), out);
}
const ART = `
slide-automate|Automated business processes|net,doc,check|Business process automation
slide-chatbot|AI chatbot conversations|chat,doc,chip|AI chatbots
slide-voice|AI voice agent|mic,cal,check|AI voice agents
slide-agents|AI agents using tools|chip,mail,cal|AI agents
slide-estimation|Estimation and BOQ|doc,bars,mag|Estimation and tenders
slide-accounts|Accounts and integrations|bars,link,doc|Tally, Zoho and Sheets
slide-software|Custom software|win,bars,gear|Custom software
slide-documents|Document AI|doc,mag,chat|Document AI
industry-construction|Construction|win,doc,clock|Construction and contracting
industry-accounting|Accounting|bars,pie,doc|Accounting and finance
industry-services|Professional services|person,cal,chat|Professional services
industry-hr|HR and staffing|person,check,doc|HR and staffing
industry-smb|Small business|gear,bars,mail|Small and medium business
industry-media|Media and content|doc,net,mail|Media and content
project-news|News automation|net,doc,mail|News automation
project-n8n|n8n and AI workflows|net,chip,gear|n8n and AI workflows
project-remote|Remote access platform|win,shield,link|Remote access platform
project-booking|Booking assistant|mic,cal,mail|Booking assistant
project-leads|Lead management|funnel,mail,bars|Lead management
project-diabetes|Prediction model|pie,bars,chip|Prediction model
project-receptionist|AI receptionist|chat,mic,check|AI receptionist
home-about|About us|person,gear,check|About RushiTech.AI
home-services|Services|chip,chat,bars|Our services
home-problems|Problems we solve|doc,clock,link|Problems we solve
home-industries|Industries|win,person,bars|Industries
home-process|Our process|check,gear,cal|How we work
home-portfolio|Projects|win,net,pie|Our projects
home-tech|Technologies|chip,link,net|Technologies
home-team|Team|person,chat,check|Our team
home-faq|FAQ|chat,mag,check|Common questions
about-hero|About|person,net,chip|About us
about-who|Who we are|person,doc,gear|Who we are
about-values|Values|shield,check,person|Our values
about-problems|Problems|clock,doc,funnel|What we solve
about-process|Delivery process|cal,gear,check|Delivery process
about-team|Team|person,mail,cal|The team
hiw-hero|How it works|net,cal,check|How it works
hiw-process|Process steps|doc,gear,check|Four clear steps
hiw-faq|Common questions|chat,mag,doc|Good to know
pricing-hero|Pricing|bars,doc,check|Pricing
pricing-models|Engagement models|clock,cal,shield|Engagement models
legal-privacy|Privacy|shield,check,doc|Your privacy
legal-terms|Terms|doc,check,shield|Terms
hero-services|Services|gear,chat,chip|Services
hero-industries|Industries|win,person,gear|Industries
hero-team|Team|person,chat,mail|Team
hero-contact|Contact|mail,chat,cal|Contact us
hero-faq|FAQ|mag,chat,doc|FAQ
hero-blog|Blog|doc,mag,bars|Blog and insights
hero-portfolio|Portfolio|win,net,check|Portfolio
hero-casestudies|Case studies|doc,bars,check|Case studies
hero-consult|Consultation|cal,mic,check|Book a consultation
apps-hero|Custom business apps|win,person,gear|Custom business apps
apps-portal|One secure portal|win,link,shield|One secure portal
apps-more|More apps we can build|gear,doc,cal|More apps we can build
home-apps|Custom business apps|win,bars,person|Custom business apps
case-policy|Policy assistant|chat,doc,shield|Policy assistant
case-procurement|Procurement workflow|doc,check,clock|Procurement workflow
case-field|Daily field reporting|person,cal,bars|Daily field reports
case-assets|Asset tracking|win,mag,link|Asset tracking
case-hr|HR management|person,doc,check|HR management
case-workstatus|Employee work status|bars,person,clock|Work status
case-people|Staff directory|person,mail,net|Staff directory
case-invoice|Invoice dashboard|bars,doc,pie|Invoice dashboard
case-zoho-crm|Zoho CRM dashboard|funnel,bars,pie|Zoho CRM dashboard
case-zoho-people|Zoho People dashboard|person,bars,cal|Zoho People dashboard
about-trust|Work you can look at|win,bars,check|Work you can look at
accounting-tally-services|Accounting and Tally support|doc,bars,check|Accounting and Tally support
mis-reports|MIS reports and dashboards|bars,pie,chat|MIS reports and dashboards
website-development|Static and dynamic websites|win,gear,doc|Static and dynamic websites
hiw-plan|Delivery plan|cal,gear,check|Typical delivery plan
hiw-support|After go-live|shield,clock,check|Warranty and support
pricing-included|Included and excluded|doc,check,shield|What is included
terms-hero|Terms|doc,shield,check|Clear terms
`.trim().split("\n");
ART.forEach((line, i) => { const [n, l, m, c] = line.split("|"); art(n, l, m.split(","), c, i); });

/* drop retired scenes */
for (const n of ["about","blog","contact","faq","how-it-works","industries","legal-terms","portfolio","pricing","problems","services","team","technologies"]) fs.rmSync(path.join(OUT, n + ".svg"), { force: true });
console.log("generated", fs.readdirSync(OUT).length, "images in", OUT);
