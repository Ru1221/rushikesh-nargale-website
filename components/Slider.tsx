"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface Slide { image: string; title: string; text: string; href?: string }

/**
 * Auto-advancing slider that always moves in the same direction.
 * A copy of the first slide sits after the last one, so after the last slide the first slide
 * slides in from the same side (no sweep back to the start).
 * Pauses on hover/focus and when the user prefers reduced motion.
 */
export default function Slider({ slides, interval = 5000, stacked = false }: { slides: Slide[]; interval?: number; stacked?: boolean }) {
  const n = slides.length;
  const [pos, setPos] = useState(0); // 0..n, where n is the clone of slide 0
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);

  // When we land on the clone, silently jump to the real first slide.
  useEffect(() => {
    if (pos !== n) return;
    const t = setTimeout(() => { setAnimate(false); setPos(0); }, reduced ? 0 : 760);
    return () => clearTimeout(t);
  }, [pos, n, reduced]);

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = setInterval(() => { setAnimate(true); setPos((p) => (p >= n ? 1 : p + 1)); }, interval);
    return () => clearInterval(t);
  }, [paused, reduced, n, interval]);

  if (!n) return null;
  const active = pos % n;
  const next = () => { setAnimate(true); setPos((p) => (p >= n ? 1 : p + 1)); };
  const prev = () => {
    if (pos === 0) {
      // jump to the clone (identical to slide 0) without animation, then step back one slide
      setAnimate(false); setPos(n);
      requestAnimationFrame(() => requestAnimationFrame(() => { setAnimate(true); setPos(n - 1); }));
    } else { setAnimate(true); setPos(pos - 1); }
  };
  const goTo = (k: number) => { setAnimate(true); setPos(k); };
  const rendered = [...slides, slides[0]];

  return (
    <div
      role="region" aria-roledescription="carousel" aria-label="What we do"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="relative overflow-hidden rounded-2xl bg-navy-900 shadow-xl"
    >
      <div
        className={`flex ${animate ? "transition-transform duration-700 ease-out motion-reduce:transition-none" : ""}`}
        style={{ transform: `translateX(-${pos * 100}%)` }}
      >
        {rendered.map((s, k) => {
          const clone = k === n;
          const visible = k === pos || (clone && pos === n);
          return (
            <div key={k} className={`grid w-full shrink-0 ${stacked ? "" : "md:grid-cols-5"}`} role="group" aria-roledescription="slide" aria-label={`${(k % n) + 1} of ${n}`} aria-hidden={!visible}>
              <div className={stacked ? "" : "md:col-span-3"}>
                <img src={s.image} alt="" className="aspect-video h-full w-full object-cover" />
              </div>
              <div className={`flex flex-col justify-center p-5 pb-14 text-white ${stacked ? "" : "md:col-span-2 md:p-10 md:pb-10"}`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">{String((k % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</p>
                <h3 className={`mt-2 font-bold ${stacked ? "text-xl" : "text-2xl"}`}>{s.title}</h3>
                <p className={`mt-2 text-slate-300 ${stacked ? "text-sm" : ""}`}>{s.text}</p>
                {s.href && <Link href={s.href} tabIndex={visible ? 0 : -1} className="btn btn-primary mt-4 self-start !px-4 !py-2">Learn more</Link>}
              </div>
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          <button type="button" aria-label="Previous slide" onClick={prev} className="rounded-full bg-black/40 px-3 py-1 text-white hover:bg-black/60">‹</button>
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Go to slide ${k + 1}`} aria-current={k === active} onClick={() => goTo(k)} className={`h-2.5 rounded-full transition-all ${k === active ? "w-7 bg-cyan-accent" : "w-2.5 bg-white/50 hover:bg-white/80"}`} />
          ))}
          <button type="button" aria-label="Next slide" onClick={next} className="rounded-full bg-black/40 px-3 py-1 text-white hover:bg-black/60">›</button>
        </div>
      )}
    </div>
  );
}
