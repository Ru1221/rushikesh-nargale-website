import Link from "next/link";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, Tag, Empty, RichText, ServiceCard } from "@/components/ui";
import Video from "@/components/Video";
import { notFound } from "next/navigation";

const META = {
  portfolio: { base: "/portfolio", label: "Portfolio", title: "Portfolio", sub: "Selected projects and automation work." },
  case_study: { base: "/case-studies", label: "Case Studies", title: "Case studies", sub: "How we approached specific business problems." },
} as const;
type K = keyof typeof META;

export async function ProjectIndex({ kind }: { kind: K }) {
  const m = META[kind];
  const ps = (await list("project")).filter((p) => (p.data.kind || "portfolio") === kind);
  return (
    <>
      <PageHero eyebrow={m.label} title={m.title} subtitle={m.sub} />
      <Breadcrumbs trail={[{ label: m.label }]} />
      <div className="container-x py-12">
        {!ps.length && <Empty title={`No ${m.label.toLowerCase()} published yet`} text="Add entries from the admin panel." />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ps.map((p) => (
            <Link key={p.slug} href={`${m.base}/${p.slug}`} className="card block">
              {p.data.images?.[0] && <img src={p.data.images[0]} alt="" loading="lazy" className="mb-3 aspect-video w-full rounded-lg object-cover" />}
              <h2 className="font-semibold text-navy-900">{p.data.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{p.data.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">{(p.data.tech || []).map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export async function ProjectDetail({ kind, slug }: { kind: K; slug: string }) {
  const m = META[kind];
  const all = await list("project");
  const p = all.find((x) => x.slug === slug && (x.data.kind || "portfolio") === kind);
  if (!p) notFound();
  const d = p.data;
  const svcs = (await list("service")).filter((s) => (d.services || []).includes(s.slug));
  return (
    <>
      <PageHero eyebrow={m.label} title={d.title} subtitle={d.description} />
      <Breadcrumbs trail={[{ label: m.label, href: m.base }, { label: d.title }]} />
      <div className="container-x max-w-3xl space-y-8 py-12">
        {d.images?.[0] && <img src={d.images[0]} alt={d.title} className="w-full rounded-xl" />}
        {d.problem && <section><h2 className="h2 mb-2">Business problem</h2><RichText text={d.problem} /></section>}
        {d.solution && <section><h2 className="h2 mb-2">Solution</h2><RichText text={d.solution} /></section>}
        {d.features?.length > 0 && <section><h2 className="h2 mb-2">Features</h2><ul className="list-disc pl-6 text-slate-700">{d.features.map((f: string) => <li key={f}>{f}</li>)}</ul></section>}
        {d.outcomes?.length > 0 && <section><h2 className="h2 mb-2">Verified outcomes</h2><ul className="list-disc pl-6 text-slate-700">{d.outcomes.map((f: string) => <li key={f}>{f}</li>)}</ul></section>}
        {d.video && <Video url={d.video} title={d.title} />}
        {d.images?.length > 1 && <div className="grid gap-4 sm:grid-cols-2">{d.images.slice(1).map((u: string, i: number) => <img key={i} src={u} alt="" loading="lazy" className="rounded-lg" />)}</div>}
        {d.tech?.length > 0 && <div className="flex flex-wrap gap-2">{d.tech.map((t: string) => <Tag key={t}>{t}</Tag>)}</div>}
        {d.url && <a className="btn btn-primary" href={d.url} target="_blank" rel="noopener noreferrer">View project</a>}
        {svcs.length > 0 && (
          <section>
            <h2 className="h2 mb-4">Related services</h2>
            <div className="grid gap-4 sm:grid-cols-2">{svcs.map((s) => <ServiceCard key={s.slug} href={`/${s.slug}`} title={s.data.title} text={s.data.short} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}
