"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface Slide { image: string; title: string; text: string; href?: string }

/** Auto-advancing image slider. Pauses on hover/focus and when the user prefers reduced motion. */
export default function Slider({ slides, interval = 5000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    timer.current = setInterval(() => setI((x) => (x + 1) % n), interval);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, reduced, n, interval]);

  if (!n) return null;
  const go = (k: number) => setI((k + n) % n);

  return (
    <div
      role="region" aria-roledescription="carousel" aria-label="What we do"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="relative overflow-hidden rounded-2xl bg-navy-900 shadow-xl"
    >
      <div className="flex transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => (
          <div key={k} className="grid w-full shrink-0 md:grid-cols-5" role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={k !== i}>
            <div className="md:col-span-3">
              <img src={s.image} alt="" loading={k === 0 ? "eager" : "lazy"} className="aspect-video h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center p-6 text-white md:col-span-2 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">{String(k + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</p>
              <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
              <p className="mt-3 text-slate-300">{s.text}</p>
              {s.href && <Link href={s.href} tabIndex={k === i ? 0 : -1} className="btn btn-primary mt-5 self-start">Learn more</Link>}
            </div>
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} className="rounded-full bg-black/40 px-3 py-1 text-white hover:bg-black/60">‹</button>
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => go(k)} className={`h-2.5 rounded-full transition-all ${k === i ? "w-7 bg-cyan-accent" : "w-2.5 bg-white/50 hover:bg-white/80"}`} />
          ))}
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} className="rounded-full bg-black/40 px-3 py-1 text-white hover:bg-black/60">›</button>
        </div>
      )}
    </div>
  );
}
