"use client";
import Link from "next/link";
import { useState } from "react";

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string; group?: string }[];
}

export function Brand({ name }: { name: string }) {
  const i = name.lastIndexOf(".");
  return i > 0 ? <span>{name.slice(0, i)}<span className="text-cyan-accent">{name.slice(i)}</span></span> : <span>{name}</span>;
}

export default function Header({ name, logo, links }: { name: string; logo?: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-navy-900">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          {logo ? <img src={logo} alt="" className="h-8 w-8 rounded object-contain" /> : <img src="/logo-mark.svg" alt="" className="h-8 w-8" />}
          <Brand name={name} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.children?.length ? (
              <div key={l.href + l.label} className="group relative">
                <Link href={l.href} className="inline-flex items-center gap-1 rounded px-3 py-2 text-sm text-slate-200 hover:text-white">
                  {l.label} <span aria-hidden className="text-xs">▾</span>
                </Link>
                <div className="invisible absolute left-0 top-full w-72 rounded-xl border border-white/10 bg-navy-900 p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="max-h-[70vh] overflow-auto">
                    {l.children.map((c, i) => (
                      <div key={c.href}>
                        {c.group && c.group !== l.children![i - 1]?.group && (
                          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-cyan-accent">{c.group}</p>
                        )}
                        <Link href={c.href} className="block rounded px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white">{c.label}</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={l.href + l.label} href={l.href} className="rounded px-3 py-2 text-sm text-slate-200 hover:text-white">{l.label}</Link>
            )
          )}
          <Link href="/book-consultation" className="btn btn-primary ml-2">Book a Consultation</Link>
        </nav>
        <button className="rounded p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span aria-hidden className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[80vh] overflow-auto border-t border-white/10 bg-navy-950 px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <div key={l.href + l.label}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block py-2.5 font-medium">{l.label}</Link>
              {l.children?.map((c) => (
                <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="block py-1.5 pl-4 text-sm text-slate-300">{c.label}</Link>
              ))}
            </div>
          ))}
          <Link href="/book-consultation" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">Book a Consultation</Link>
        </nav>
      )}
    </header>
  );
}
