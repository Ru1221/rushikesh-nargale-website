import Link from "next/link";
import { list, get } from "@/lib/content";
import type { Section } from "@/lib/types";
import { PageHero, SectionHead, ServiceCard, RichText, Tag } from "./ui";
import Video, { embedUrl } from "./Video";
import InquiryForm from "./InquiryForm";
import { serviceNames } from "@/lib/helpers";

const wrap = (children: React.ReactNode, alt = false) => (
  <section className={`section ${alt ? "bg-slate-50" : ""}`}>
    <div className="container-x">{children}</div>
  </section>
);

export async function SectionView({ s }: { s: Section }) {
  switch (s.type) {
    case "hero":
      if (s.compact)
        return (
          <PageHero eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle}>
            {s.primaryLabel && <Link href={s.primaryHref || "/contact"} className="btn btn-primary mt-6">{s.primaryLabel}</Link>}
          </PageHero>
        );
      return (
        <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-cyan-accent/10 blur-3xl" aria-hidden />
          <div className="container-x relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-2">
            <div>
              {s.eyebrow && <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-accent">{s.eyebrow}</p>}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{s.title}</h1>
              {s.subtitle && <p className="mt-5 max-w-xl text-lg text-slate-300">{s.subtitle}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {s.primaryLabel && <Link href={s.primaryHref || "/services"} className="btn btn-primary">{s.primaryLabel}</Link>}
                {s.secondaryLabel && <Link href={s.secondaryHref || "/contact"} className="btn btn-outline">{s.secondaryLabel}</Link>}
              </div>
            </div>
            {s.video ? <Video url={s.video} poster={s.image} title={s.title} /> : s.image ? (
              <img src={s.image} alt="" className="w-full rounded-2xl shadow-2xl" />
            ) : (
              <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-6 lg:block" aria-hidden>
                {["Automate", "Integrate", "Innovate"].map((w, i) => (
                  <div key={w} className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 p-4 last:mb-0">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold">{i + 1}</span>
                    <span className="text-lg font-semibold">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    case "rich_text":
      return wrap(<div className="max-w-3xl">{s.heading && <h2 className="h2 mb-4">{s.heading}</h2>}<RichText text={s.body} /></div>);

    case "text_image":
      return wrap(
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className={s.imageSide === "left" ? "md:order-2" : ""}>
            {s.heading && <h2 className="h2 mb-4">{s.heading}</h2>}
            <RichText text={s.body} />
            {s.ctaLabel && <Link href={s.ctaHref || "/contact"} className="btn btn-primary mt-2">{s.ctaLabel}</Link>}
          </div>
          {s.image ? <img src={s.image} alt={s.imageAlt || ""} loading="lazy" className="w-full rounded-xl shadow-lg" /> : (
            <div className="grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br from-navy-800 to-brand text-5xl text-white/80" aria-hidden>⚙</div>
          )}
        </div>
      );

    case "gallery": {
      const imgs: string[] = s.images || [];
      return wrap(<><SectionHead title={s.heading} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{imgs.map((u, i) => <img key={i} src={u} alt="" loading="lazy" className="w-full rounded-lg" />)}</div></>);
    }

    case "video":
      return s.url ? wrap(<><SectionHead title={s.heading} /><div className="mx-auto max-w-3xl"><Video url={s.url} poster={s.poster} title={s.heading} />{s.caption && <p className="mt-2 text-sm text-slate-600">{s.caption}</p>}</div></>) : null;

    case "embed":
      return embedUrl(s.url || "") ? wrap(<><SectionHead title={s.heading} /><div className="mx-auto max-w-3xl"><Video url={s.url} title={s.heading} /></div></>) : null;

    case "video_gallery": {
      const urls: string[] = s.urls || [];
      return urls.length ? wrap(<><SectionHead title={s.heading} /><div className="grid gap-6 md:grid-cols-2">{urls.map((u, i) => <Video key={i} url={u} title={`${s.heading || "Video"} ${i + 1}`} />)}</div></>) : null;
    }

    case "service_cards": {
      let svcs = await list("service");
      if (s.mode === "featured") svcs = svcs.filter((x) => x.featured);
      if (s.mode === "category" && s.category) svcs = svcs.filter((x) => x.data.category === s.category);
      svcs = svcs.slice(0, s.limit || 12);
      return wrap(
        <>
          <SectionHead title={s.heading} intro={s.intro} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {svcs.map((x) => <ServiceCard key={x.slug} href={`/${x.slug}`} title={x.data.title} text={x.data.short} />)}
          </div>
          <div className="mt-8"><Link href="/services" className="font-semibold text-brand">View all services →</Link></div>
        </>,
        true
      );
    }

    case "portfolio_cards": {
      const kind = s.kind === "case_study" ? "case_study" : "portfolio";
      const ps = (await list("project")).filter((p) => (p.data.kind || "portfolio") === kind).slice(0, s.limit || 3);
      if (!ps.length) return null;
      const base = kind === "case_study" ? "/case-studies" : "/portfolio";
      return wrap(
        <>
          <SectionHead title={s.heading} />
          <div className="grid gap-5 md:grid-cols-3">
            {ps.map((p) => (
              <Link key={p.slug} href={`${base}/${p.slug}`} className="card block">
                {p.data.images?.[0] && <img src={p.data.images[0]} alt="" loading="lazy" className="mb-3 aspect-video w-full rounded-lg object-cover" />}
                <h3 className="font-semibold text-navy-900">{p.data.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.data.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">{(p.data.tech || []).map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
              </Link>
            ))}
          </div>
        </>
      );
    }

    case "industry_cards": {
      const inds = await list("industry");
      return wrap(
        <>
          <SectionHead title={s.heading} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inds.map((i) => (
              <Link key={i.slug} href={`/industries#${i.slug}`} className="card block">
                <h3 className="font-semibold text-navy-900">{i.data.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{i.data.description}</p>
              </Link>
            ))}
          </div>
        </>,
        true
      );
    }

    case "feature_list":
      return wrap(
        <>
          <SectionHead title={s.heading} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(s.items || []).map((it: any, i: number) => (
              <div key={i} className="card">
                <div className="mb-3 h-1 w-8 rounded bg-brand" aria-hidden />
                <h3 className="font-semibold text-navy-900">{it.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{it.text}</p>
              </div>
            ))}
          </div>
        </>
      );

    case "stats":
      return wrap(
        <>
          <SectionHead title={s.heading} />
          <dl className="grid gap-6 sm:grid-cols-3">
            {(s.items || []).map((it: any, i: number) => (
              <div key={i} className="card text-center"><dt className="text-sm text-slate-600">{it.label}</dt><dd className="text-3xl font-bold text-brand">{it.value}</dd></div>
            ))}
          </dl>
        </>
      );

    case "process_steps":
      return wrap(
        <>
          <SectionHead title={s.heading} />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(s.items || []).map((it: any, i: number) => (
              <li key={i} className="card">
                <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
                <h3 className="font-semibold text-navy-900">{it.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{it.text}</p>
              </li>
            ))}
          </ol>
        </>,
        true
      );

    case "faq": {
      let items: { q: string; a: string }[] = s.items || [];
      if (s.source === "all" || !items.length) items = (await list("faq")).map((f) => f.data as any).slice(0, s.limit || 20);
      return items.length ? wrap(<><SectionHead title={s.heading} /><Faq items={items} /></>) : null;
    }

    case "testimonials":
      return (s.items || []).length ? wrap(<><SectionHead title={s.heading} /><div className="grid gap-5 md:grid-cols-3">{s.items.map((t: any, i: number) => <figure key={i} className="card"><blockquote className="text-slate-700">“{t.quote}”</blockquote><figcaption className="mt-3 text-sm font-semibold">{t.name}{t.role ? `, ${t.role}` : ""}</figcaption></figure>)}</div></>) : null;

    case "client_logos":
      return (s.items || []).length ? wrap(<><SectionHead title={s.heading} /><div className="flex flex-wrap items-center gap-8">{s.items.map((c: any, i: number) => c.image ? <img key={i} src={c.image} alt={c.name} loading="lazy" className="h-10 w-auto" /> : <span key={i} className="font-semibold">{c.name}</span>)}</div></>) : null;

    case "cta_banner":
      return (
        <section className="bg-gradient-to-r from-navy-800 to-brand py-14 text-white">
          <div className="container-x text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{s.heading}</h2>
            {s.text && <p className="mx-auto mt-3 max-w-xl text-slate-100">{s.text}</p>}
            <Link href={s.href || "/contact"} className="btn mt-6 bg-white text-navy-900 hover:bg-slate-100">{s.label || "Contact Us"}</Link>
          </div>
        </section>
      );

    case "contact_form":
      return wrap(<div className="mx-auto max-w-2xl"><SectionHead title={s.heading} intro={s.intro} /><InquiryForm type="contact" services={await serviceNames()} /></div>);

    case "downloads":
      return (s.items || []).length ? wrap(<><SectionHead title={s.heading} /><ul className="space-y-2">{s.items.map((d: any, i: number) => <li key={i}><a className="text-brand underline" href={d.url} download>{d.title}</a></li>)}</ul></>) : null;

    case "team_cards": {
      const team = (await list("team")).slice(0, s.limit || 4);
      return team.length ? wrap(
        <>
          <SectionHead title={s.heading} intro={s.intro} />
          <div className="grid gap-5 sm:grid-cols-2">{team.map((m) => <TeamCard key={m.slug} m={m.data} />)}</div>
          <div className="mt-6"><Link href="/team" className="font-semibold text-brand">Meet the full team →</Link></div>
        </>,
        true
      ) : null;
    }

    case "reusable": {
      const b = await get("block", s.block || "");
      if (!b) return null;
      return <>{await Promise.all((b.data.sections || []).filter((x: Section) => !x.hidden).map((x: Section) => <SectionView key={x.id} s={x} />))}</>;
    }
    default:
      return null;
  }
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="max-w-3xl divide-y divide-slate-200 rounded-xl border border-slate-200">
      {items.map((f, i) => (
        <details key={i} className="group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-navy-900">
            {f.q}<span aria-hidden className="text-brand transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-slate-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function TeamCard({ m }: { m: Record<string, any> }) {
  return (
    <article className="card flex gap-4">
      {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" className="h-20 w-20 rounded-full object-cover" /> : (
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-brand text-2xl font-bold text-white" aria-hidden>
          {String(m.name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-navy-900">{m.name}</h3>
        <p className="text-sm text-slate-600">{m.title}</p>
        <p className="mt-2 text-sm"><a className="text-brand" href={`mailto:${m.email}`}>{m.email}</a></p>
      </div>
    </article>
  );
}

export async function Sections({ sections }: { sections: Section[] }) {
  return <>{(sections || []).filter((s) => !s.hidden).map((s) => <SectionView key={s.id} s={s} />)}</>;
}
