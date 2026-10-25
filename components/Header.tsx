"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false); // mobile menu
  const [sub, setSub] = useState<string | null>(null); // expanded group in the mobile menu
  const [dd, setDd] = useState<string | null>(null); // open dropdown on desktop
  const navRef = useRef<HTMLElement>(null);

  // Mobile menu: stop the page behind it from scrolling; Escape or a wider screen closes it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Desktop dropdown: close on outside click or Escape.
  useEffect(() => {
    if (!dd) return;
    const onDown = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setDd(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDd(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [dd]);

  return (
    <>
    <header className="sticky top-0 z-[60] border-b border-white/10 bg-navy-950/95 text-white backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-navy-900">
        Skip to content
      </a>
      <div className="container-x flex h-14 items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-base font-bold tracking-tight">
          {logo ? <img src={logo} alt="" className="h-7 w-7 rounded object-contain" /> : <img src="/logo-mark.svg" alt="" className="h-7 w-7" />}
          <Brand name={name} />
        </Link>

        <nav ref={navRef} aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => {
            const key = l.href + l.label;
            if (!l.children?.length) {
              return <Link key={key} href={l.href} className="whitespace-nowrap rounded px-2 py-1.5 text-[13px] text-slate-200 hover:text-white">{l.label}</Link>;
            }
            const isOpen = dd === key;
            return (
              <div key={key} className="group relative">
                {/* A button, not a link: clicking only opens the list, it does not open the page. */}
                <button
                  type="button" aria-haspopup="true" aria-expanded={isOpen}
                  onClick={() => setDd(isOpen ? null : key)}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-1.5 text-[13px] text-slate-200 hover:text-white"
                >
                  {l.label} <span aria-hidden className={"text-xs transition-transform " + (isOpen ? "rotate-180" : "")}>▾</span>
                </button>
                <div className={"absolute left-0 top-full w-72 rounded-xl border border-white/10 bg-navy-900 p-2 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 " + (isOpen ? "visible opacity-100" : "invisible opacity-0")}>
                  <div className="max-h-[70vh] overflow-auto">
                    <Link href={l.href} onClick={() => setDd(null)} className="block rounded px-3 py-1.5 text-sm font-semibold text-cyan-accent hover:bg-white/10">All {l.label.toLowerCase()} →</Link>
                    {l.children.map((c, i) => (
                      <div key={c.href}>
                        {c.group && c.group !== l.children![i - 1]?.group && (
                          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-cyan-accent">{c.group}</p>
                        )}
                        <Link href={c.href} onClick={() => setDd(null)} className="block rounded px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white">{c.label}</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <Link href="/book-consultation" className="btn btn-primary ml-2 shrink-0 whitespace-nowrap !px-3 !py-1.5 !text-[13px]"><span className="xl:hidden">Book a Call</span><span className="hidden xl:inline">Book a Consultation</span></Link>
        </nav>

        <button className="rounded p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span aria-hidden className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
    </header>

    {/* Outside <header>: a backdrop-filter on the header would otherwise shrink this "fixed" panel to the header's height. */}
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-[57px] z-[60] overflow-y-auto overscroll-contain border-t border-white/10 bg-navy-950 px-4 pb-28 lg:hidden">
          {links.map((l) => {
            const key = l.href + l.label;
            if (!l.children?.length) return <Link key={key} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 font-medium">{l.label}</Link>;
            const expanded = sub === key;
            return (
              <div key={key}>
                {/* Tapping the group name only expands it; it does not open the page. */}
                <button
                  type="button" aria-expanded={expanded} onClick={() => setSub(expanded ? null : key)}
                  className="flex w-full items-center justify-between py-2.5 text-left font-medium"
                >
                  <span>{l.label}</span>
                  <span aria-hidden className={"inline-block px-1 text-slate-300 transition-transform " + (expanded ? "rotate-180" : "")}>▾</span>
                </button>
                {expanded && (
                  <div className="pb-2">
                    <Link href={l.href} onClick={() => setOpen(false)} className="block py-1.5 pl-4 text-sm font-semibold text-cyan-accent">All {l.label.toLowerCase()} →</Link>
                    {l.children.map((c) => (
                      <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="block py-1.5 pl-4 text-sm text-slate-300">{c.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/book-consultation" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">Book a Consultation</Link>
        </nav>
      )}
    </>
  );
}
