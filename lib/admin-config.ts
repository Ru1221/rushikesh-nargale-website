import type { Kind } from "./types";

export type FieldType = "text" | "textarea" | "url" | "media" | "lines" | "select" | "bool" | "items" | "date" | "number";
export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  fields?: Field[]; // for "items": sub-fields of each row
  help?: string;
  rows?: number;
}

export interface Resource {
  key: string; // route segment under /admin
  kind: Kind;
  title: string;
  singular: string;
  titleField: string;
  slugFrom: string;
  fields: Field[];
  defaults?: Record<string, any>; // fixed data values (e.g. project kind)
  match?: (d: Record<string, any>) => boolean;
  public?: (slug: string, d: Record<string, any>) => string;
  seo?: boolean;
  hasFeatured?: boolean;
}

const seoFields: Field[] = [
  { name: "seoTitle", label: "SEO title", type: "text" },
  { name: "metaDescription", label: "Meta description", type: "textarea", rows: 2 },
];
const qa: Field[] = [{ name: "q", label: "Question", type: "text" }, { name: "a", label: "Answer", type: "textarea", rows: 2 }];
const stepFields: Field[] = [{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea", rows: 2 }];

export const RESOURCES: Record<string, Resource> = {
  services: {
    key: "services", kind: "service", title: "Services", singular: "service", titleField: "title", slugFrom: "title", hasFeatured: true, seo: true,
    public: (s) => `/${s}`,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category (slug)", type: "text", help: "e.g. ai, estimation, accounts, hrsales, software — see Categories" },
      { name: "short", label: "Short description", type: "textarea", rows: 2 },
      { name: "full", label: "Full description", type: "textarea", rows: 6, help: "Blank line = new paragraph. Use ## for headings and - for lists." },
      { name: "problem", label: "Business problem", type: "textarea", rows: 3 },
      { name: "features", label: "Features (one per line)", type: "lines" },
      { name: "benefits", label: "Benefits (one per line)", type: "lines" },
      { name: "process", label: "Process steps", type: "items", fields: stepFields },
      { name: "tech", label: "Technologies (one per line)", type: "lines" },
      { name: "hero", label: "Hero image", type: "media" },
      { name: "images", label: "Additional images (one URL per line)", type: "lines" },
      { name: "video", label: "Video (uploaded or YouTube/Vimeo URL)", type: "media" },
      { name: "faqs", label: "FAQs", type: "items", fields: qa },
      { name: "related", label: "Related service slugs (one per line)", type: "lines" },
      { name: "ctaLabel", label: "CTA label", type: "text" },
      { name: "ctaHref", label: "CTA link", type: "url" },
      ...seoFields,
    ],
  },
  categories: {
    key: "categories", kind: "category", title: "Service categories", singular: "category", titleField: "name", slugFrom: "name",
    fields: [{ name: "name", label: "Name", type: "text" }],
  },
  industries: {
    key: "industries", kind: "industry", title: "Industries", singular: "industry", titleField: "name", slugFrom: "name",
    public: (s) => `/industries#${s}`,
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "image", label: "Image", type: "media" },
      { name: "services", label: "Related service slugs (one per line)", type: "lines" },
    ],
  },
  portfolio: {
    key: "portfolio", kind: "project", title: "Portfolio", singular: "project", titleField: "title", slugFrom: "title", hasFeatured: true, seo: true,
    defaults: { kind: "portfolio" }, match: (d) => (d.kind || "portfolio") === "portfolio", public: (s) => `/portfolio/${s}`,
    fields: [
      { name: "title", label: "Project title", type: "text" },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "problem", label: "Business problem", type: "textarea", rows: 3 },
      { name: "solution", label: "Solution", type: "textarea", rows: 3 },
      { name: "tech", label: "Technologies (one per line)", type: "lines" },
      { name: "features", label: "Features (one per line)", type: "lines" },
      { name: "outcomes", label: "Verified outcomes (one per line)", type: "lines", help: "Only add outcomes you can verify." },
      { name: "images", label: "Images (one URL per line)", type: "lines" },
      { name: "video", label: "Video demo", type: "media" },
      { name: "url", label: "External link", type: "url" },
      { name: "services", label: "Related service slugs (one per line)", type: "lines" },
      ...seoFields,
    ],
  },
  "case-studies": {
    key: "case-studies", kind: "project", title: "Case studies", singular: "case study", titleField: "title", slugFrom: "title", hasFeatured: true, seo: true,
    defaults: { kind: "case_study" }, match: (d) => d.kind === "case_study", public: (s) => `/case-studies/${s}`,
    fields: [] as Field[], // filled below (same as portfolio)
  },
  blog: {
    key: "blog", kind: "post", title: "Blog", singular: "post", titleField: "title", slugFrom: "title", seo: true, public: (s) => `/blog/${s}`,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2 },
      { name: "content", label: "Content", type: "textarea", rows: 14, help: "Blank line = new paragraph. ## heading, - list." },
      { name: "image", label: "Featured image", type: "media" },
      { name: "category", label: "Category", type: "text" },
      { name: "tags", label: "Tags (one per line)", type: "lines" },
      { name: "publishedAt", label: "Publication date", type: "date" },
      ...seoFields,
    ],
  },
  faq: {
    key: "faq", kind: "faq", title: "FAQs", singular: "FAQ", titleField: "q", slugFrom: "q",
    fields: [
      { name: "q", label: "Question", type: "text" },
      { name: "a", label: "Answer", type: "textarea", rows: 4 },
      { name: "category", label: "Group", type: "text" },
    ],
  },
  team: {
    key: "team", kind: "team", title: "Team", singular: "team member", titleField: "name", slugFrom: "name", hasFeatured: true, public: () => "/team",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "title", label: "Professional title", type: "text" },
      { name: "bio", label: "Biography", type: "textarea", rows: 5 },
      { name: "photo", label: "Profile photo", type: "media" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "linkedin", label: "LinkedIn URL (optional)", type: "url" },
      { name: "portfolio", label: "Portfolio URL (optional)", type: "url" },
      { name: "social", label: "Other social links", type: "items", fields: [{ name: "label", label: "Label", type: "text" }, { name: "url", label: "URL", type: "url" }] },
      { name: "education", label: "Education", type: "items", fields: [{ name: "title", label: "Degree / course", type: "text" }, { name: "place", label: "Institution", type: "text" }, { name: "period", label: "Period", type: "text" }] },
      { name: "experience", label: "Experience", type: "items", fields: [{ name: "title", label: "Role", type: "text" }, { name: "place", label: "Organisation", type: "text" }, { name: "period", label: "Period", type: "text" }] },
      { name: "skills", label: "Skills (one per line)", type: "lines" },
      { name: "responsibilities", label: "Responsibilities (one per line)", type: "lines" },
      { name: "certifications", label: "Training and certifications (one per line)", type: "lines" },
      { name: "projects", label: "Verified projects (one per line)", type: "lines" },
      { name: "contactKey", label: "Notification key", type: "select", options: ["", "rushikesh", "rutuja"], help: "Used to route enquiry notifications." },
    ],
  },
  navigation: {
    key: "navigation", kind: "nav", title: "Navigation", singular: "link", titleField: "label", slugFrom: "label",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "href", label: "Link (page path or approved external URL)", type: "url" },
      { name: "location", label: "Location", type: "select", options: ["header", "footer"] },
      { name: "parent", label: "Parent link slug (for dropdowns)", type: "text", help: "Leave empty for top-level links." },
      { name: "visible", label: "Visible", type: "bool" },
    ],
  },
  blocks: {
    key: "blocks", kind: "block", title: "Reusable blocks", singular: "block", titleField: "title", slugFrom: "title",
    fields: [{ name: "title", label: "Name", type: "text" }, { name: "sections", label: "Sections (JSON)", type: "textarea", rows: 12, help: "Advanced: a JSON array of sections, same format as page sections." }],
  },
};
RESOURCES["case-studies"].fields = RESOURCES.portfolio.fields;

/* ---------- Page-builder section definitions ---------- */
export interface SectionDef {
  label: string;
  fields: Field[];
  defaults: Record<string, any>;
}
const heading: Field = { name: "heading", label: "Heading", type: "text" };

export const SECTION_DEFS: Record<string, SectionDef> = {
  hero: {
    label: "Hero",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" }, { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea", rows: 2 },
      { name: "primaryLabel", label: "Primary button label", type: "text" }, { name: "primaryHref", label: "Primary button link", type: "url" },
      { name: "secondaryLabel", label: "Secondary button label", type: "text" }, { name: "secondaryHref", label: "Secondary button link", type: "url" },
      { name: "image", label: "Image", type: "media" }, { name: "video", label: "Video", type: "media" },
      { name: "compact", label: "Compact (page header style)", type: "bool" },
      { name: "seconds", label: "Seconds per slide (home hero slider)", type: "number" },
      { name: "items", label: "Hero slider slides (optional)", type: "items", fields: [{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Description", type: "textarea", rows: 2 }, { name: "image", label: "Image", type: "media" }, { name: "href", label: "Link", type: "url" }] },
    ],
    defaults: { title: "New hero", compact: true },
  },
  rich_text: { label: "Rich text", fields: [heading, { name: "body", label: "Body", type: "textarea", rows: 8, help: "Blank line = paragraph, ## heading, - list" }], defaults: { body: "" } },
  text_image: {
    label: "Text and image",
    fields: [heading, { name: "body", label: "Body", type: "textarea", rows: 5 }, { name: "image", label: "Image", type: "media" }, { name: "imageAlt", label: "Image alt text", type: "text" },
      { name: "imageSide", label: "Image side", type: "select", options: ["right", "left"] }, { name: "ctaLabel", label: "Button label", type: "text" }, { name: "ctaHref", label: "Button link", type: "url" }],
    defaults: { imageSide: "right" },
  },
  gallery: { label: "Image gallery", fields: [heading, { name: "images", label: "Images (one URL per line)", type: "lines" }], defaults: { images: [] } },
  video: { label: "Video", fields: [heading, { name: "url", label: "Video", type: "media" }, { name: "poster", label: "Poster image", type: "media" }, { name: "caption", label: "Caption", type: "text" }], defaults: {} },
  video_gallery: { label: "Video gallery", fields: [heading, { name: "urls", label: "Videos (one URL per line)", type: "lines" }], defaults: { urls: [] } },
  embed: { label: "Embedded video (YouTube/Vimeo)", fields: [heading, { name: "url", label: "YouTube or Vimeo URL", type: "url" }], defaults: {} },
  service_cards: {
    label: "Service cards",
    fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "mode", label: "Show", type: "select", options: ["featured", "all", "category"] },
      { name: "category", label: "Category slug (when Show = category)", type: "text" }, { name: "limit", label: "Max cards", type: "number" }],
    defaults: { mode: "featured", limit: 6 },
  },
  portfolio_cards: { label: "Portfolio cards", fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "kind", label: "Type", type: "select", options: ["portfolio", "case_study"] }, { name: "limit", label: "Max cards", type: "number" }], defaults: { kind: "portfolio", limit: 3 } },
  industry_cards: { label: "Industry cards", fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }], defaults: {} },
  feature_list: { label: "Feature list", fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "items", label: "Items", type: "items", fields: stepFields }], defaults: { items: [] } },
  stats: { label: "Statistics (verified only)", fields: [heading, { name: "items", label: "Items", type: "items", fields: [{ name: "value", label: "Value", type: "text" }, { name: "label", label: "Label", type: "text" }] }], defaults: { items: [] } },
  process_steps: { label: "Process steps", fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "items", label: "Steps", type: "items", fields: stepFields }], defaults: { items: [] } },
  faq: {
    label: "FAQ",
    fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "source", label: "Source", type: "select", options: ["all", "custom"] }, { name: "limit", label: "Max (when All)", type: "number" }, { name: "items", label: "Custom items", type: "items", fields: qa }],
    defaults: { source: "all", limit: 5, items: [] },
  },
  testimonials: { label: "Testimonials (verified only)", fields: [heading, { name: "items", label: "Items", type: "items", fields: [{ name: "quote", label: "Quote", type: "textarea", rows: 2 }, { name: "name", label: "Name", type: "text" }, { name: "role", label: "Role", type: "text" }] }], defaults: { items: [] } },
  client_logos: { label: "Client logos", fields: [heading, { name: "items", label: "Logos", type: "items", fields: [{ name: "name", label: "Name", type: "text" }, { name: "image", label: "Logo image", type: "media" }] }], defaults: { items: [] } },
  cta_banner: { label: "CTA banner", fields: [heading, { name: "text", label: "Text", type: "textarea", rows: 2 }, { name: "label", label: "Button label", type: "text" }, { name: "href", label: "Button link", type: "url" }], defaults: { label: "Contact Us", href: "/contact" } },
  contact_form: { label: "Contact form", fields: [heading, { name: "intro", label: "Intro", type: "textarea", rows: 2 }], defaults: {} },
  downloads: { label: "Downloadable resources", fields: [heading, { name: "items", label: "Files", type: "items", fields: [{ name: "title", label: "Title", type: "text" }, { name: "url", label: "File URL", type: "media" }] }], defaults: { items: [] } },
  team_cards: { label: "Team cards", fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "image", label: "Section image", type: "media" }, { name: "limit", label: "Max", type: "number" }], defaults: { limit: 4 } },
  slider: {
    label: "Image slider (moving)",
    fields: [heading, { name: "intro", label: "Description under heading", type: "textarea", rows: 2 }, { name: "seconds", label: "Seconds per slide", type: "number" },
      { name: "items", label: "Slides", type: "items", fields: [{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Description", type: "textarea", rows: 2 }, { name: "image", label: "Image", type: "media" }, { name: "href", label: "Link", type: "url" }] }],
    defaults: { seconds: 5, items: [] },
  },
  reusable: { label: "Reusable block", fields: [{ name: "block", label: "Block slug", type: "text", help: "Create blocks under Admin → Reusable blocks" }], defaults: {} },
};

/** Allow only site-relative paths, anchors, mailto/tel and http(s) URLs. */
export function safeUrl(v: string): string {
  const s = (v || "").trim();
  if (!s) return "";
  if (/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(s)) return s;
  return "";
}
