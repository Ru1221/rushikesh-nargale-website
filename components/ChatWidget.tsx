"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Msg { role: "user" | "bot"; text: string; links?: { label: string; href: string }[] }

const CHIPS = ["What services do you offer?", "Show me custom apps", "How much does it cost?", "How can I contact you?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm the RushiTech.AI assistant. Ask me about our services, custom apps, pricing or how to reach us." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, open, busy]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const t = text.trim().slice(0, 500);
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: t }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      setMsgs([...next, { role: "bot", text: data.text || "Sorry, something went wrong. Please use the contact form.", links: data.links }]);
    } catch {
      setMsgs([...next, { role: "bot", text: "I can't reach the server right now. Please use the contact form.", links: [{ label: "Contact us", href: "/contact" }] }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      {!open && (
        <button
          type="button" onClick={() => setOpen(true)} aria-label="Open chat assistant"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" /></svg>
          Chat with us
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Chat assistant" className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[380px]">
          <header className="flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-700 px-4 py-3 text-white">
            <div>
              <p className="font-display text-sm font-bold">RushiTech.AI assistant</p>
              <p className="text-xs text-slate-300">Ask about services, apps and pricing</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 text-xl leading-none hover:bg-white/10">×</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-brand text-white" : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  {m.links && m.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-brand hover:bg-slate-200">{l.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-slate-500" role="status">Typing…</p>}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {CHIPS.map((c) => <button key={c} type="button" onClick={() => send(c)} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs hover:border-brand hover:text-brand">{c}</button>)}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <label htmlFor="chat-input" className="sr-only">Your message</label>
            <input id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Type your question…" autoComplete="off" className="input" />
            <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary !px-4">Send</button>
          </form>
          <p className="bg-white px-3 pb-2 text-center text-[11px] text-slate-500">Automated assistant. For project details, please contact the team.</p>
        </section>
      )}
    </>
  );
}
