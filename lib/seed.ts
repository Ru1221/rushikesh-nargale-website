import type { Item, Kind, Status } from "./types";

type Seed = Omit<Item, "id" | "updated_at">;
const out: Seed[] = [];
const add = (kind: Kind, slug: string, data: Record<string, any>, sort = 0, featured = false, status: Status = "published") =>
  out.push({ kind, slug, status, sort, featured, data });

/* ---------- Categories ---------- */
const cats: [string, string][] = [
  ["ai", "AI Automation"],
  ["estimation", "Estimation & Tender"],
  ["accounts", "Accounts & Finance"],
  ["hrsales", "HR & Sales"],
  ["software", "Software & Data"],
];
cats.forEach(([slug, name], i) => add("category", slug, { name }, i));

/* ---------- Services ---------- */
const stdProcess = [
  { title: "Discovery", text: "We review your current workflow, tools and the manual steps that slow your team down." },
  { title: "Solution design", text: "We propose a practical approach and agree scope, integrations and success criteria with you." },
  { title: "Build & integrate", text: "We build the automation or software and connect it to the tools you already use." },
  { title: "Test & handover", text: "We test with your real scenarios, document the solution and walk your team through it." },
];
const stdBenefits = [
  "Less repetitive manual work for your team",
  "More consistent, repeatable processes",
  "Better visibility into progress and data",
  "Solutions fitted to your own tools and workflow",
];
type S = [string, string, string, string, string, string[], string[], string, string[]];
const services: S[] = [
  ["ai-automation", "AI Automation Solutions", "ai", "Practical AI solutions that take repetitive work off your team.",
    "AI Automation Solutions combine language models, document understanding and workflow tools to handle repetitive, rule-based or text-heavy work. We start with a clear business problem and build only what is needed.",
    ["AI Business Assistants", "AI Workflow Automation", "AI Document Processing", "PDF Question Answering", "Data Analytics", "Machine Learning Solutions", "Computer Vision Solutions"],
    ["Python", "n8n", "LLM APIs", "REST APIs"],
    "Teams spend hours on repetitive reading, copying, sorting and replying that software can assist with.", ["ai-agents", "ai-chatbots", "document-ai"]],
  ["business-automation", "Business Process Automation", "software", "Automate repeatable business processes across your existing tools.",
    "We map a process end to end, find the manual hand-offs and automate them, connecting spreadsheets, email, forms and business software so work moves without constant manual effort.",
    ["Workflow automation", "Google Sheets Automation", "n8n Workflows", "Zapier Workflows", "Automated reports and notifications"],
    ["n8n", "Zapier", "Google Sheets", "Python"],
    "Processes that depend on manual copying between tools are slow and error-prone.", ["workflow-automation", "software-integration", "custom-software"]],
  ["custom-software", "Custom Software Development", "software", "Web applications and internal tools built around the way you work.",
    "When off-the-shelf software does not fit, we design and build custom web applications, dashboards and internal tools with a clean interface and a reliable database behind them.",
    ["Custom Web Applications", "Business Dashboards", "Internal Business Tools", "Dynamic Website Development"],
    ["Next.js", "TypeScript", "PostgreSQL", "Python"],
    "Generic software forces teams to work around it instead of working with it.", ["software-integration", "business-automation"]],
  ["ai-agents", "AI Agents", "ai", "Goal-driven AI agents that use your tools to complete multi-step tasks.",
    "AI agents can read inputs, decide on next steps and call your systems through APIs to complete tasks such as research, data collection, drafting and routing, with human review where it matters.",
    ["Task and research agents", "Agents connected to business tools via APIs", "Human-in-the-loop approvals"],
    ["LLM APIs", "Python", "n8n", "REST APIs"],
    "Multi-step knowledge work is hard to automate with fixed rules alone.", ["ai-automation", "ai-chatbots", "workflow-automation"]],
  ["ai-chatbots", "AI Chatbots", "ai", "Chatbots that answer questions from your own information.",
    "We build chatbots for websites and messaging channels that answer common questions from your documents and FAQs, capture leads and hand over to your team when needed.",
    ["Website chatbots", "Knowledge-base question answering", "Lead capture", "Hand-off to a human"],
    ["LLM APIs", "Next.js", "Python"],
    "Repeated customer or staff questions take time away from higher-value work.", ["ai-agents", "ai-voice-agents", "document-ai"]],
  ["ai-voice-agents", "AI Voice Agents", "ai", "Voice assistants that can handle routine calls and capture details.",
    "AI voice agents can take or place routine calls such as enquiries and appointment requests, capture the details and pass them to your systems or your team.",
    ["Inbound enquiry handling", "Appointment requests by voice", "Call details sent to your systems"],
    ["Speech APIs", "LLM APIs", "Python"],
    "Missed or repetitive phone enquiries are hard to staff consistently.", ["ai-chatbots", "appointment-automation"]],
  ["software-integration", "Software and API Integration", "software", "Connect your tools so data flows without re-entry.",
    "We connect applications through their APIs and webhooks so that information entered once is available wherever it is needed.",
    ["API Integration", "Data Import and Export", "Webhooks and sync", "n8n Workflows", "Zapier Workflows"],
    ["REST APIs", "Webhooks", "n8n", "Python"],
    "Disconnected tools lead to duplicate data entry and inconsistent records.", ["business-automation", "tally-integration", "zoho-automation"]],
  ["ai-estimation", "AI Estimation and BOQ Agent", "estimation", "Assistance with BOQ filling, quantity calculations and quotations.",
    "We build assistants that help estimators fill BOQ sheets, check quantities and prepare quotations faster. Outputs are meant to be reviewed by your estimator before use.",
    ["BOQ Filling", "Quantity Calculations", "Estimation Assistance", "Quotation Preparation"],
    ["Python", "Excel / Google Sheets", "LLM APIs"],
    "Manual BOQ and quotation work is time-consuming and easy to get inconsistent.", ["ai-tender-agent", "document-ai"]],
  ["ai-tender-agent", "AI Tender Search Agent", "estimation", "Find, filter and track tenders that fit your business.",
    "A tender agent can search tender sources you specify, filter by your criteria, track deadlines and notify your team.",
    ["Tender Discovery", "Tender Filtering", "Tender Deadline Monitoring", "Tender Notifications"],
    ["Python", "n8n", "Email / messaging APIs"],
    "Relevant tenders are easy to miss and deadlines are hard to track by hand.", ["ai-estimation", "workflow-automation"]],
  ["accounts-automation", "Accounts Automation", "accounts", "Reduce manual data entry and prepare accounting data faster.",
    "We automate routine accounts work such as data entry, reconciliation assistance and report preparation, always leaving final review and filing to your accountants.",
    ["Accounts Data Entry Automation", "Reconciliation Assistance", "GST-Related Data Preparation", "Financial Reporting Workflows"],
    ["Python", "Google Sheets", "Tally / Zoho APIs"],
    "Manual accounts entry and reporting take time and invite mistakes.", ["tally-integration", "zoho-automation"]],
  ["tally-integration", "Tally Integration", "accounts", "Move data between Tally and your other systems.",
    "We build integrations that import data into Tally and export data from it so your accounting data stays in step with the rest of your tools.",
    ["Data Import and Export", "Voucher data preparation", "Reports from Tally data"],
    ["Tally", "Python", "XML / ODBC"],
    "Re-typing data into Tally is slow and error-prone.", ["accounts-automation", "software-integration"]],
  ["zoho-automation", "Zoho Automation", "accounts", "Automate workflows across Zoho applications.",
    "We automate and integrate Zoho applications such as Zoho Expense, Zoho CRM and Zoho People with each other and with your other tools.",
    ["Zoho Expense Workflows", "Zoho CRM automation", "Zoho People workflows"],
    ["Zoho APIs", "n8n", "Zapier"],
    "Approvals and data hand-offs between Zoho apps and other tools are often manual.", ["accounts-automation", "hr-automation", "sales-automation"]],
  ["hr-automation", "HR Automation", "hrsales", "Streamline onboarding, HR reporting and attendance workflows.",
    "We automate HR tasks such as employee onboarding steps, HR reports and attendance-related workflows, integrating with the HR tools you use.",
    ["Employee Onboarding", "HR Reports", "Attendance Workflow Integrations"],
    ["Zoho People", "Google Workspace", "Python", "n8n"],
    "HR teams repeat the same onboarding and reporting steps for every employee.", ["zoho-automation", "workflow-automation"]],
  ["sales-automation", "Sales and CRM Automation", "hrsales", "Capture leads, follow up on time and report on your pipeline.",
    "We connect lead sources to your CRM, automate follow-ups and build sales reports so your team spends time selling.",
    ["Lead Management", "CRM Integration", "Automated Follow-ups", "Sales Reporting"],
    ["CRM APIs", "n8n", "Google Sheets", "Email APIs"],
    "Leads get lost and follow-ups are late when tracking is manual.", ["zoho-automation", "appointment-automation"]],
  ["workflow-automation", "Workflow Automation", "software", "Build reliable automated workflows with n8n, Zapier and code.",
    "We design workflows that trigger on events, move data between systems, apply rules and notify people, using n8n, Zapier or custom code depending on what fits.",
    ["n8n Workflows", "Zapier Workflows", "Google Sheets Automation", "Event-driven workflows"],
    ["n8n", "Zapier", "Python", "Webhooks"],
    "Day-to-day processes depend on people remembering to do the next step.", ["business-automation", "software-integration"]],
  ["appointment-automation", "Appointment Booking Automation", "hrsales", "Let customers book and get reminders without back-and-forth.",
    "We set up appointment scheduling flows with calendar integration, confirmations and reminders. Bookings are confirmed only when the calendar integration succeeds.",
    ["Appointment Scheduling", "Calendar integration", "Reminders and follow-ups"],
    ["Google Calendar", "n8n", "Email / SMS APIs"],
    "Scheduling by phone or message takes time and leads to no-shows.", ["ai-voice-agents", "sales-automation"]],
  ["document-ai", "AI Document and PDF Solutions", "ai", "Extract, search and ask questions across your documents.",
    "We build tools that read PDFs and documents, extract structured data and let your team ask questions of them, with sources shown so answers can be checked.",
    ["AI Document Processing", "PDF Question Answering", "Data extraction to spreadsheets"],
    ["Python", "LLM APIs", "OCR"],
    "Important information is buried in long PDFs and scanned documents.", ["ai-estimation", "ai-chatbots", "ai-automation"]],
];
const featuredSet = new Set(["ai-automation", "business-automation", "custom-software", "ai-agents", "ai-chatbots", "software-integration"]);
services.forEach(([slug, title, cat, short, full, items, tech, problem, related], i) =>
  add(
    "service",
    slug,
    {
      title, category: cat, short, full, problem, items,
      features: items, benefits: stdBenefits, process: stdProcess, tech,
      hero: `/img/${slug}.svg`, images: [], video: "",
      faqs: [
        { q: "Can this be adapted to our tools?", a: "Yes. We build around the software and workflow you already use. We confirm what is feasible during discovery." },
        { q: "Do you guarantee specific savings?", a: "No. Results depend on your processes and systems, so we agree measurable goals with you rather than promise outcomes." },
      ],
      related, ctaLabel: "Discuss this service", ctaHref: "/contact",
      seoTitle: `${title} | RushiTech.AI`, metaDescription: short,
    },
    i,
    featuredSet.has(slug)
  )
);

/* ---------- Industries ---------- */
const inds: [string, string, string, string[]][] = [
  ["construction", "Construction & Contracting", "Estimation, BOQ preparation and tender tracking support.", ["ai-estimation", "ai-tender-agent"]],
  ["accounting", "Accounting & Finance", "Accounts data preparation and integrations with Tally and Zoho.", ["accounts-automation", "tally-integration", "zoho-automation"]],
  ["services", "Professional Services", "Lead handling, appointments and client communication.", ["sales-automation", "appointment-automation", "ai-chatbots"]],
  ["hr", "HR & Staffing", "Onboarding, attendance workflows and HR reporting.", ["hr-automation", "zoho-automation"]],
  ["smb", "Small & Medium Businesses", "Workflow automation and custom internal tools.", ["business-automation", "custom-software", "workflow-automation"]],
  ["media", "Media & Content", "AI-assisted content collection and publishing workflows.", ["ai-automation", "workflow-automation"]],
];
const INDUSTRY_IMG: Record<string, string> = { construction: "/img/industry-construction.svg", accounting: "/img/industry-accounting.svg", services: "/img/industry-services.svg", hr: "/img/industry-hr.svg", smb: "/img/industry-smb.svg", media: "/img/industry-media.svg" };
inds.forEach(([slug, name, description, svc], i) => add("industry", slug, { name, description, services: svc, image: INDUSTRY_IMG[slug] || "" }, i));

/* ---------- Team ---------- */
add("team", "rushikesh-nargale", {
  name: "Rushikesh Nargale",
  title: "AI Automation Specialist | Business Automation | Software Integration",
  bio: "Rushikesh builds AI automation, workflow automation and software integrations for businesses. His work includes automation with n8n and AI services, Python automation and API integrations, and custom business software.",
  photo: "/team/rushikesh.jpg", email: "rushikeshnargale11@gmail.com", phone: "+91 8668379629",
  linkedin: "https://www.linkedin.com/in/rushikesh-nargale-945586288/",
  portfolio: "https://ru1221.github.io/Portfolio/", social: [],
  education: [{ title: "B.Tech in Artificial Intelligence", place: "Terna Engineering College", period: "2022–2026" }],
  experience: [
    { title: "AI Engineer Intern", place: "Aveosoft Pvt Ltd", period: "Sep 2025 – Nov 2025" },
    { title: "Full Stack Java Trainee", place: "Symbiosis Skills & Professional University", period: "Mar 2025 – Jul 2025" },
    { title: "Data Science Intern", place: "Anyatam-Adhyayan Education Services Pvt. Ltd.", period: "Jul 2024 – Dec 2024" },
    { title: "AI Automation Developer", place: "Worship Earth Foundation", period: "" },
  ],
  skills: ["AI automation", "n8n workflows", "Python", "OpenAI API", "Gemini API", "Vapi", "Retell AI", "Make", "Zapier", "REST APIs & webhooks", "Google Workspace", "SQL", "Java", "JavaScript", "Scikit-learn", "TensorFlow"],
  responsibilities: ["Solution design", "Automation and integration development"],
  projects: ["AI-powered Maharashtra News Automation System", "Workflow automation using n8n and AI services", "Appointment booking AI voice assistant", "Automated lead management system", "Diabetes prediction model", "AI receptionist and customer support workflows", "Remote Access Platform"],
  contactKey: "rushikesh",
}, 0, true);
add("team", "rutuja-nargale", {
  name: "Rutuja Nargale", title: "Team Member", bio: "",
  photo: "/team/rutuja.jpg", email: "rutujanargale2@gmail.com", phone: "+91 7841030309",
  linkedin: "https://www.linkedin.com/in/rutuja-nargale-74b904363", portfolio: "", social: [], education: [], experience: [], skills: [], responsibilities: [], projects: [],
  contactKey: "rutuja",
}, 1, true);

/* ---------- Projects (descriptions kept to verified facts only) ---------- */
const PROJ_IMG: Record<string, string> = { "maharashtra-news-automation": "/img/project-news.svg", "n8n-ai-workflows": "/img/project-n8n.svg", "remote-access-platform": "/img/project-remote.svg", "appointment-voice-assistant": "/img/project-booking.svg", "lead-management-system": "/img/project-leads.svg", "diabetes-prediction-model": "/img/project-diabetes.svg", "ai-receptionist-support": "/img/project-receptionist.svg" };
const proj = (slug: string, title: string, description: string, tech: string[], services: string[], sort: number, featured: boolean) =>
  add("project", slug, {
    kind: "portfolio", title, description, problem: "", solution: "", tech, images: PROJ_IMG[slug] ? [PROJ_IMG[slug]] : [], video: "",
    features: [], outcomes: [], url: "", services, seoTitle: "", metaDescription: "",
  }, sort, featured);
proj("maharashtra-news-automation", "AI-powered Maharashtra News Automation System",
  "An automation system that uses AI services to collect and process Maharashtra news.", ["n8n", "AI services", "Python"], ["workflow-automation", "ai-automation"], 0, true);
proj("n8n-ai-workflows", "Workflow automation with n8n and AI services",
  "Automated workflows built with n8n and connected AI services.", ["n8n", "AI services"], ["workflow-automation"], 1, true);
proj("appointment-voice-assistant", "Appointment booking AI voice assistant",
  "An AI-powered booking workflow that handles scheduling requests, creates calendar events, stores bookings in Google Sheets and sends confirmation emails automatically.", ["n8n", "OpenAI API", "JavaScript", "Google Calendar", "Google Sheets"], ["appointment-automation", "ai-voice-agents"], 3, true);
proj("lead-management-system", "Automated lead management system",
  "An automation system for lead capture, API-based enrichment, spreadsheet tracking, automated email sequences and AI voice follow-up support.", ["n8n", "API integration", "Google Sheets", "Retell AI", "Vapi"], ["sales-automation"], 4, false);
proj("diabetes-prediction-model", "Diabetes prediction model",
  "A machine learning classifier that predicts diabetes risk from features such as BMI, glucose, blood pressure and age, evaluated at roughly 85% accuracy.", ["Python", "Scikit-learn", "EDA"], ["ai-automation"], 5, false);
proj("ai-receptionist-support", "AI receptionist and customer support workflows",
  "Workflows for AI reception and customer query handling: answering routine questions, supporting chat and voice flows, and escalating complex cases to a person.", ["Voice AI", "OpenAI", "WhatsApp"], ["ai-chatbots", "ai-voice-agents"], 6, false);
proj("remote-access-platform", "Remote Access Platform",
  "A remote access platform project. Detailed capabilities will be added once confirmed.", [], ["custom-software"], 2, false);

/* ---------- FAQs ---------- */
const FAQS: [string, string, string][] = [
 [
  "General",
  "What kinds of businesses do you work with?",
  "We work with small and medium businesses and teams that want to reduce repetitive work, connect their software or build custom tools."
 ],
 [
  "General",
  "Who will I be working with?",
  "You work directly with Rushikesh Nargale and Rutuja Nargale. You choose a preferred contact when you send an enquiry, and that person stays your main point of contact."
 ],
 [
  "General",
  "How does a project start?",
  "Send an enquiry or book a consultation. We discuss your workflow, agree on scope and propose an approach before any work starts."
 ],
 [
  "General",
  "Do you guarantee results or savings?",
  "No. Outcomes depend on your processes and systems. We agree clear goals and test the solution with your real scenarios."
 ],
 [
  "Services",
  "What can you automate?",
  "Typically repetitive, rule-based or text-heavy work: data entry, document reading, lead follow-ups, reports, appointment booking, approvals and notifications."
 ],
 [
  "Services",
  "Do you build chatbots and voice agents?",
  "Yes. We build AI chatbots and voice agents that answer from your own information, capture details and hand over to a person when needed."
 ],
 [
  "Services",
  "Can you help with Tally, Zoho or Google Sheets?",
  "Yes. We build integrations and automations around Tally, Zoho applications and Google Workspace. Final review and filing stay with your accountants."
 ],
 [
  "Services",
  "Can you build a custom web application or dashboard?",
  "Yes. We build custom web applications, dashboards and internal tools with a database behind them, designed around how your team works."
 ],
 [
  "Pricing & timelines",
  "How is a project priced?",
  "Every project is scoped individually. After an initial conversation we send a written proposal with scope, timeline and cost."
 ],
 [
  "Pricing & timelines",
  "How long does a project take?",
  "Small automations can take days to a couple of weeks; larger systems take longer. We give a timeline in the proposal once the scope is clear."
 ],
 [
  "Pricing & timelines",
  "Are there other costs besides your fees?",
  "Third-party tools and APIs (for example AI usage, hosting or software subscriptions) are billed by those providers. We explain them up front."
 ],
 [
  "Pricing & timelines",
  "Do you offer support after delivery?",
  "Support and maintenance can be agreed separately after handover, based on the needs of the project."
 ],
 [
  "Technical & security",
  "Can you work with the software we already use?",
  "In most cases yes, if the software has an API, webhook, export or integration option. We confirm feasibility during discovery."
 ],
 [
  "Technical & security",
  "How do you handle our data?",
  "We only access the data needed for the project, agree on how it is stored and who can see it, and use secure connections. Details are confirmed in writing for each project."
 ],
 [
  "Technical & security",
  "Will a person stay in control of important decisions?",
  "Yes. We design review and approval steps where they matter, and automations can escalate unusual cases to a person."
 ],
 [
  "Technical & security",
  "Who owns the finished solution?",
  "Ownership and support terms are agreed in writing at the start of each project."
 ]
];
FAQS.forEach(([category, q, a], i) => add("faq", `faq-${i + 1}`, { q, a, category }, i));

/* ---------- Blog posts ---------- */
const POSTS: [string, string, string, string, string, string[], string, string][] = [
 [
  "what-is-business-process-automation",
  "What is business process automation, and where should you start?",
  "Process automation replaces repeated manual steps with reliable software. Here is how to choose the first process.",
  "/img/blog-process.svg",
  "Automation",
  [
   "automation",
   "getting started"
  ],
  "2026-09-02",
  "Business process automation means using software to carry out repeated steps that people otherwise do by hand, such as copying data between tools, sending reminders or preparing reports.\n\n## Start with one process\nPick a process that is frequent, rule-based and annoying. Good first candidates are lead follow-ups, invoice data entry, appointment reminders and weekly reports.\n\n## Map it before you automate it\nWrite down each step, who does it, which tools are used and what can go wrong. Many problems are fixed just by simplifying the steps.\n\n## Decide what stays with a person\n- Approvals and exceptions\n- Anything involving judgement or sensitive decisions\n- Cases the automation is not sure about\n\n## Measure honestly\nTrack time spent and error rates before and after. Results depend on your process, so set goals from your own numbers rather than from promises.\n\n## Next step\nIf you would like help choosing and building your first automation, send us an enquiry and we will talk through your workflow."
 ],
 [
  "n8n-vs-zapier-vs-make",
  "n8n, Zapier or Make: choosing a workflow automation tool",
  "A practical comparison of three popular tools and how to choose between them.",
  "/img/blog-tools.svg",
  "Tools",
  [
   "n8n",
   "zapier",
   "make"
  ],
  "2026-09-09",
  "All three tools connect apps and run workflows when something happens. The best choice depends on your team, your budget and how custom your logic needs to be.\n\n## Zapier\nVery easy to start, with a large catalogue of ready-made app connections. Pricing is usually based on the number of tasks, so costs can grow with volume.\n\n## Make\nA visual builder that handles branching and data transformation well, at a lower entry cost for many use cases.\n\n## n8n\nFlexible and developer friendly. It supports custom code and can be self-hosted, which gives control over data and cost, but it needs more technical care.\n\n## How we choose\n- How many workflows and how often they run\n- Whether custom logic or code is needed\n- Where data must be stored\n- Who will maintain the workflows\n\nPricing and features change, so always check each provider's current plans before deciding."
 ],
 [
  "ai-chatbots-from-your-documents",
  "How an AI chatbot answers from your own documents",
  "Chatbots are most useful when they answer from your information and show their sources.",
  "/img/blog-chatbot.svg",
  "AI",
  [
   "chatbots",
   "documents",
   "AI"
  ],
  "2026-09-16",
  "A generic chatbot knows a lot about the world but nothing about your business. A document-based chatbot looks up the relevant parts of your own files first, then writes an answer from them.\n\n## The basic idea\n- Your documents are split into small passages and indexed\n- When someone asks a question, the most relevant passages are found\n- The AI writes an answer using only those passages and shows where they came from\n\n## What makes it reliable\n- Clean, current source documents\n- Showing sources so answers can be checked\n- A clear fallback: when the answer is not found, say so and offer a person\n\n## What to avoid\nDo not let a chatbot invent policies or prices. Limit it to approved content and review conversations regularly.\n\nWe build chatbots for websites and messaging channels. Tell us what questions your team answers most often and we will suggest an approach."
 ],
 [
  "automating-boq-and-quotations",
  "Automating BOQ filling and quotations: what AI can and cannot do",
  "AI can speed up the repetitive parts of estimation, but an estimator should always review the result.",
  "/img/blog-boq.svg",
  "Estimation",
  [
   "BOQ",
   "estimation",
   "quotations"
  ],
  "2026-09-23",
  "Preparing a bill of quantities and quotation involves a lot of repetitive work: reading drawings and specifications, matching items, applying rates and totalling.\n\n## Where automation helps\n- Matching BOQ items to your rate library\n- Checking quantity calculations for arithmetic mistakes\n- Producing a consistent quotation from approved rates\n- Keeping a history of past estimates\n\n## Where a person is still needed\n- Judging site conditions and special requirements\n- Approving rates and margins\n- Reviewing anything the system flags as uncertain\n\n## A sensible workflow\nThe system prepares a draft, highlights items it is unsure about, and the estimator reviews and approves before anything is sent.\n\nIf you spend many hours on BOQs, we can look at your sheets and suggest what is realistic to automate."
 ],
 [
  "connecting-tally-zoho-and-sheets",
  "Connecting Tally, Zoho and Google Sheets without double entry",
  "Practical patterns for keeping accounting, expense and spreadsheet data in step.",
  "/img/blog-integration.svg",
  "Integration",
  [
   "tally",
   "zoho",
   "integration"
  ],
  "2026-10-01",
  "Many finance teams enter the same data in two or three places. Integration removes that repetition and the mistakes that come with it.\n\n## Common patterns\n- Export from one system on a schedule and import into another\n- Trigger an update when a record changes, using webhooks or APIs\n- Use a spreadsheet as a simple review step before data is posted\n\n## Things to plan for\n- A single source of truth for each type of data\n- Clear rules for duplicates and corrections\n- A log of what was imported and when\n- Final review by your accountant before filing\n\nEvery setup is different, so we start by looking at your current process and the options each system provides."
 ],
 [
  "checklist-before-automating-a-workflow",
  "A checklist to run through before you automate a workflow",
  "Seven questions that save time and money before any automation is built.",
  "/img/blog-checklist.svg",
  "Planning",
  [
   "checklist",
   "planning"
  ],
  "2026-10-12",
  "Before building anything, answer these questions.\n\n## The checklist\n- What is the goal, in your own words and numbers?\n- Who owns the process and will approve changes?\n- Is the data clean enough to automate on?\n- Which steps must stay with a person?\n- What happens when something fails?\n- How will you test with real cases?\n- Who maintains it after launch?\n\n## Why it matters\nMost failed automations fail because the process was unclear, not because the technology was weak. Ten minutes with this list often changes the plan for the better.\n\nWant a second pair of eyes on your answers? Book a consultation and we will go through them with you."
 ]
];
POSTS.forEach(([slug, title, excerpt, image, category, tags, publishedAt, content], i) =>
  add("post", slug, { title, excerpt, content, image, category, tags, publishedAt, seoTitle: `${title} | RushiTech.AI`, metaDescription: excerpt }, i));

/* ---------- Navigation ---------- */
const nav: [string, string, string][] = [
  ["header", "Home", "/"],
  ["header", "About", "/about"],
  ["header", "Services", "/services"],
  ["header", "Portfolio", "/portfolio"],
  ["header", "Industries", "/industries"],
  ["header", "How It Works", "/how-it-works"],
  ["header", "Blog", "/blog"],
  ["header", "Contact", "/contact"],
  ["footer", "Team", "/team"],
  ["footer", "Case Studies", "/case-studies"],
  ["footer", "Pricing", "/pricing"],
  ["footer", "FAQ", "/faq"],
  ["footer", "Book a Consultation", "/book-consultation"],
  ["footer", "Privacy Policy", "/privacy-policy"],
  ["footer", "Terms", "/terms"],
];
nav.forEach(([location, label, href], i) => add("nav", `nav-${i + 1}`, { location, label, href, parent: "", visible: true }, i));

/* ---------- Pages ---------- */
const HERO_IMG: Record<string, string> = { a1: "/img/about-hero.svg", w1: "/img/hiw-hero.svg", p1: "/img/pricing-hero.svg", pp0: "/img/legal-privacy.svg", t0: "/img/legal-terms.svg" };
const hero = (id: string, eyebrow: string, title: string, subtitle: string, pl = "", ph = "") => ({
  id, type: "hero", eyebrow, title, subtitle, primaryLabel: pl, primaryHref: ph, secondaryLabel: "", secondaryHref: "", image: HERO_IMG[id] || "", video: "", compact: true,
});

add("page", "home", {
  title: "Home", seoTitle: "Smart Business Automation | RushiTech.AI",
  metaDescription: "AI automation, business automation and software integration. Automate. Integrate. Innovate.", ogImage: "", showInNav: false,
  sections: [
    { id: "h1", type: "hero", items: [{"title":"Automate repetitive work","text":"Business processes that run themselves: data moves between your tools, reports build themselves and reminders go out on time.","image":"/img/slide-automate.svg","href":"/business-automation"},{"title":"AI chatbots","text":"Chatbots that answer questions from your own documents and hand over to your team when needed.","image":"/img/slide-chatbot.svg","href":"/ai-chatbots"},{"title":"AI voice agents","text":"Voice assistants that take routine calls, capture the details and pass them to your systems.","image":"/img/slide-voice.svg","href":"/ai-voice-agents"},{"title":"AI agents","text":"Agents that use your email, calendar, CRM and sheets to complete multi-step tasks, with a person in control.","image":"/img/slide-agents.svg","href":"/ai-agents"},{"title":"Estimation and tenders","text":"Help with BOQ filling, quantity checks, quotations and finding and tracking the right tenders.","image":"/img/slide-estimation.svg","href":"/ai-estimation"},{"title":"Accounts, Tally and Zoho","text":"Less double entry between Tally, Zoho and spreadsheets, with your accountants reviewing the results.","image":"/img/slide-accounts.svg","href":"/tally-integration"},{"title":"Custom software and dashboards","text":"Web applications, internal tools and dashboards built around how your team works.","image":"/img/slide-software.svg","href":"/custom-software"},{"title":"Document AI","text":"Read, extract and search your PDFs and documents, and ask questions with sources shown.","image":"/img/slide-documents.svg","href":"/document-ai"}], eyebrow: "Automate. Integrate. Innovate.", title: "SMART BUSINESS AUTOMATION",
      subtitle: "Automate business processes, reduce repetitive work, and improve operational efficiency with practical AI solutions.",
      primaryLabel: "Explore Services", primaryHref: "/services", secondaryLabel: "Contact Us", secondaryHref: "/contact", image: "", video: "" },
    { id: "h2", type: "text_image", heading: "About RushiTech.AI",
      body: "Rushikesh Nargale is an AI automation specialist focused on business automation and software integration. We design practical solutions that remove repetitive work and connect the tools your business already uses.\n\nFrom AI chatbots and voice agents to Tally and Zoho integrations, estimation tools and custom dashboards, we build around the way your team already works.",
      image: "/img/home-about.svg", imageSide: "right", ctaLabel: "More about us", ctaHref: "/about" },
    { id: "h3", type: "service_cards", image: "/img/home-services.svg", heading: "Featured services", intro: "Practical automation and software solutions for your business.", mode: "featured", limit: 6 },
    { id: "h4", type: "feature_list", intro: "The everyday problems we are usually asked to fix.", image: "/img/home-problems.svg", heading: "Problems we solve", items: [
      { title: "Repetitive manual work", text: "Copying data between tools, sorting documents and sending routine messages." },
      { title: "Disconnected software", text: "Tools that do not talk to each other, causing duplicate entry and inconsistent data." },
      { title: "Slow estimation and reporting", text: "Spreadsheets and reports that take hours to prepare by hand." },
      { title: "Missed follow-ups", text: "Leads, tenders and appointments that slip through without reminders." },
    ] },
    { id: "h5", type: "industry_cards", intro: "Where our automation and software solutions fit best.", image: "/img/home-industries.svg", heading: "Industry solutions" },
    { id: "h6", type: "process_steps", intro: "A simple, transparent process from first conversation to handover.", image: "/img/home-process.svg", heading: "How it works", items: stdProcess },
    { id: "h7", type: "portfolio_cards", intro: "A selection of automation and machine learning work.", image: "/img/home-portfolio.svg", heading: "Featured projects", kind: "portfolio", limit: 3 },
    { id: "h8", type: "feature_list", intro: "The tools and platforms we use to build and connect your systems.", image: "/img/home-tech.svg", heading: "Technologies and integrations", items: [
      { title: "Automation", text: "n8n, Zapier, Python, webhooks" },
      { title: "AI", text: "Language model APIs, document processing, chatbots" },
      { title: "Business software", text: "Tally, Zoho, Google Workspace, CRMs" },
      { title: "Web", text: "Next.js, TypeScript, PostgreSQL" },
    ] },
    { id: "h9", type: "team_cards", intro: "The people you will work with on your project.", image: "/img/home-team.svg", heading: "Meet the team", limit: 4 },
    { id: "h10", type: "video", heading: "Video showcase", url: "", poster: "", caption: "", hidden: true },
    { id: "h11", type: "faq", intro: "Quick answers to the questions we hear most often.", image: "/img/home-faq.svg", heading: "Frequently asked questions", source: "all", limit: 5, items: [] },
    { id: "h12", type: "cta_banner", heading: "Ready to automate your workflow?", text: "Tell us what slows your team down and we will suggest a practical approach.", label: "Contact Us", href: "/contact" },
  ],
}, 0);

add("page", "about", {
  title: "About Us", seoTitle: "About | RushiTech.AI", metaDescription: "AI automation and software integration for businesses.", ogImage: "", showInNav: true,
  sections: [
    hero("a1", "About", "About Rushikesh Nargale", "AI automation, business automation and software integration.", "Contact Us", "/contact"),
    { id: "a2", type: "text_image", imageSide: "right", image: "/img/about-who.svg", imageAlt: "Team collaborating on automation projects", heading: "Who we are", body: "Rushikesh Nargale is an AI Automation Specialist working across business automation and software integration. He holds a B.Tech in Artificial Intelligence from Terna Engineering College (2022–2026) and has worked as an AI Automation Developer associated with Worship Earth Foundation.\n\nWith Rutuja Nargale, the team helps businesses build practical automation and software solutions." },
    { id: "a3", type: "feature_list", intro: "What guides the way we work.", image: "/img/about-values.svg", heading: "Mission, vision and values", items: [
      { title: "Mission", text: "Help businesses reduce repetitive work with practical, reliable automation." },
      { title: "Vision", text: "Business software that works together and lets people focus on higher-value work." },
      { title: "Values", text: "Clear communication, honest scoping, and solutions that fit how you actually work." },
    ] },
    { id: "a4", type: "feature_list", intro: "The kinds of problems we are most often asked to solve.", image: "/img/about-problems.svg", heading: "Business problems we solve", items: [
      { title: "Manual, repetitive tasks", text: "Data entry, copying and routine communication." },
      { title: "Disconnected tools", text: "Systems that need integrating through APIs and workflows." },
      { title: "Document-heavy work", text: "Reading, extracting and searching PDFs and spreadsheets." },
    ] },
    { id: "a5", type: "rich_text", heading: "Our approach to software integration", body: "We start from the workflow, not the tool. We map how information moves today, decide what to automate or connect, and build in small, testable steps so your team can see progress and give feedback." },
    { id: "a6", type: "process_steps", intro: "How a project moves from first conversation to handover.", image: "/img/about-process.svg", heading: "Project delivery process", items: stdProcess },
    { id: "a7", type: "team_cards", image: "/img/about-team.svg", heading: "The team", limit: 4 },
    { id: "a8", type: "cta_banner", heading: "Let's talk about your project", text: "", label: "Contact Us", href: "/contact" },
  ],
}, 1);

add("page", "how-it-works", {
  title: "How It Works", seoTitle: "How It Works | RushiTech.AI", metaDescription: "Our process from first conversation to handover.", ogImage: "", showInNav: true,
  sections: [
    hero("w1", "Process", "How it works", "A simple, transparent process from first conversation to handover.", "Book a Consultation", "/book-consultation"),
    { id: "w2", type: "process_steps", intro: "Every project follows the same clear steps so you always know what happens next.", image: "/img/hiw-process.svg", heading: "Our process", items: [...stdProcess, { title: "Support", text: "Support and improvements are agreed with you based on the needs of the project." }] },
    { id: "w3", type: "faq", intro: "Quick answers about how we work.", image: "/img/hiw-faq.svg", heading: "Common questions", source: "all", limit: 5, items: [] },
    { id: "w4", type: "cta_banner", heading: "Start with a conversation", text: "", label: "Book a Consultation", href: "/book-consultation" },
  ],
}, 2);

add("page", "pricing", {
  title: "Pricing and Engagement", seoTitle: "Pricing | RushiTech.AI", metaDescription: "How we scope and price automation and software projects.", ogImage: "", showInNav: true,
  sections: [
    hero("p1", "Pricing", "Pricing and engagement", "Every project is scoped to your needs. We do not publish fixed prices because requirements vary widely.", "Request a quote", "/contact"),
    { id: "p2", type: "feature_list", intro: "Three common ways to work with us. We will recommend the one that fits your project.", image: "/img/pricing-models.svg", heading: "Ways to work together", items: [
      { title: "Fixed-scope project", text: "A defined deliverable with an agreed scope and price." },
      { title: "Time-based engagement", text: "Ongoing work billed on time spent, for evolving requirements." },
      { title: "Support and maintenance", text: "Ongoing support agreed separately after delivery." },
    ] },
    { id: "p3", type: "rich_text", heading: "How a quote is prepared", body: "After an initial conversation we review your workflow, list what is in and out of scope, and send a written proposal with timeline and cost. Third-party tool and API costs (for example hosting or AI service usage) are separate and explained up front." },
    { id: "p4", type: "cta_banner", heading: "Tell us about your project", text: "", label: "Contact Us", href: "/contact" },
  ],
}, 3);

add("page", "privacy-policy", {
  title: "Privacy Policy", seoTitle: "Privacy Policy | RushiTech.AI", metaDescription: "How we handle information submitted through this website.", ogImage: "", showInNav: false,
  sections: [
    hero("pp0", "Legal", "Privacy Policy", ""),
    { id: "pp1", type: "rich_text", heading: "", body:
      "This is a starting-point policy and should be reviewed and adapted by the site owner.\n\n## Information we collect\nWhen you submit the contact or consultation form we collect the details you enter, such as your name, email, phone number, company and project description.\n\n## How we use it\nWe use this information only to respond to your enquiry and to discuss your project.\n\n## Storage and sharing\nEnquiries are stored in our database and are visible only to authorised administrators. We do not sell your information.\n\n## Your choices\nYou can ask us to correct or delete your information by emailing rushikeshnargale11@gmail.com.\n\n## Contact\nRushikesh Nargale – rushikeshnargale11@gmail.com" },
  ],
}, 4);

add("page", "terms", {
  title: "Terms and Conditions", seoTitle: "Terms and Conditions | RushiTech.AI", metaDescription: "Terms for using this website.", ogImage: "", showInNav: false,
  sections: [
    hero("t0", "Legal", "Terms and Conditions", ""),
    { id: "t1", type: "rich_text", heading: "", body:
      "This is a starting-point document and should be reviewed and adapted by the site owner.\n\n## Use of this website\nThe content on this site is provided for general information about our services. Submitting an enquiry does not create a contract.\n\n## Services\nScope, pricing, timelines and ownership for any project are agreed in writing before work starts.\n\n## No guarantees\nWe do not guarantee specific business results, savings or return on investment. Outcomes depend on your processes and systems.\n\n## Third-party services\nSolutions may rely on third-party tools and APIs, whose terms and costs apply separately.\n\n## Contact\nRushikesh Nargale – rushikeshnargale11@gmail.com" },
  ],
}, 5);

export const seedContent = out;

export const seedSettings: Record<string, any> = {
  general: { siteName: "RushiTech.AI", tagline: "Smart automation for smarter business", title: "AI Automation | Business Automation | Software Integration", logo: "/logo-mark.svg", favicon: "", ctaPrimary: "Explore Services", ctaSecondary: "Contact Us" },
  contact: { email: "rushikeshnargale11@gmail.com", phone: "+91 8668379629", linkedin: "https://www.linkedin.com/in/rushikesh-nargale-945586288/", portfolio: "https://ru1221.github.io/Portfolio/" },
  footer: { text: "AI automation, custom business applications, software integration, workflow automation, and intelligent business solutions." },
  seo: { title: "RushiTech.AI | AI Automation & Software Integration", description: "AI automation, business automation and software integration for businesses.", ogImage: "" },
  notifications: { adminEmail: "rushikeshnargale11@gmail.com", rushikesh: "rushikeshnargale11@gmail.com", rutuja: "rutujanargale2@gmail.com", sendConfirmation: true },
};
