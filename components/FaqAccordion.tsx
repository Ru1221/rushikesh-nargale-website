"use client";
import { useId, useState } from "react";

/** One answer open at a time: opening a question closes the previous one. */
export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div className="max-w-3xl divide-y divide-slate-200 rounded-xl border border-slate-200">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3 className="m-0">
              <button
                type="button"
                id={`${base}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium text-navy-900 hover:bg-slate-50"
              >
                <span>{f.q}</span>
                <span aria-hidden className={`text-xl leading-none text-brand transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
            </h3>
            <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} hidden={!isOpen} className="px-4 pb-4">
              <p className="text-slate-600">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
