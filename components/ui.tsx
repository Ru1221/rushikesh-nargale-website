import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 py-14 text-white sm:py-20">
      <div className="container-x">
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-accent">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-slate-300">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHead({ title, intro }: { title?: string; intro?: string }) {
  if (!title && !intro) return null;
  return (
    <div className="mb-8 max-w-2xl">
      {title && <h2 className="h2">{title}</h2>}
      {intro && <p className="mt-2 text-slate-600">{intro}</p>}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <p className="font-semibold text-navy-900">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
    </div>
  );
}

export function ServiceCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="card group block">
      <h3 className="text-lg font-semibold text-navy-900 group-hover:text-brand">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-brand">Learn more →</span>
    </Link>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{children}</span>;
}

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50">
      <ol className="container-x flex flex-wrap items-center gap-2 py-3 text-sm text-slate-600">
        <li><Link href="/" className="hover:text-brand">Home</Link></li>
        {trail.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {t.href ? <Link href={t.href} className="hover:text-brand">{t.label}</Link> : <span aria-current="page" className="font-medium text-slate-800">{t.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Minimal markdown: blank-line paragraphs, ## / ### headings, "- " lists. Output is escaped by React. */
export function RichText({ text }: { text: string }) {
  const blocks = (text || "").split(/\n{2,}/);
  return (
    <div className="prose-lite">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
        if (b.startsWith("## ")) {
          const [h, ...rest] = lines;
          return (
            <div key={i}>
              <h2>{h.slice(3)}</h2>
              {rest.length > 0 && <p>{rest.join(" ")}</p>}
            </div>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}
