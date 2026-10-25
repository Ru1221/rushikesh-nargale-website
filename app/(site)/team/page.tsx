import type { Metadata } from "next";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, RichText, Tag, Empty } from "@/components/ui";

export const metadata: Metadata = { title: "Our Team", description: "Meet the team behind the automation and software solutions." };

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export default async function Team() {
  const team = await list("team");
  return (
    <>
      <PageHero eyebrow="Team" title="Our team" subtitle="The people who will work on your project." />
      <Breadcrumbs trail={[{ label: "Team" }]} />
      <div className="container-x space-y-10 py-12">
        {!team.length && <Empty title="No team profiles published yet" />}
        {team.map(({ slug, data: m }) => (
          <article key={slug} id={slug} className="card grid gap-6 md:grid-cols-[180px_1fr]">
            <div>
              {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" className="aspect-square w-full rounded-xl object-cover" /> : (
                <div className="grid aspect-square w-full place-items-center rounded-xl bg-gradient-to-br from-navy-700 to-brand text-5xl font-bold text-white" aria-hidden>
                  {String(m.name).split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">{m.name}</h2>
              <p className="text-brand">{m.title}</p>
              {m.bio && <div className="mt-3"><RichText text={m.bio} /></div>}
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {m.email && <li><a className="text-brand hover:underline" href={`mailto:${m.email}`}>{m.email}</a></li>}
                {m.phone && <li><a className="text-brand hover:underline" href={tel(m.phone)}>{m.phone}</a></li>}
                {m.linkedin && <li><a className="text-brand hover:underline" href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
                {m.portfolio && <li><a className="text-brand hover:underline" href={m.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></li>}
                {(m.social || []).map((s: any, i: number) => <li key={i}><a className="text-brand hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
              </ul>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {m.education?.length > 0 && <Block title="Education">{m.education.map((e: any, i: number) => <li key={i}>{[e.title, e.place, e.period].filter(Boolean).join(", ")}</li>)}</Block>}
                {m.experience?.length > 0 && <Block title="Experience">{m.experience.map((e: any, i: number) => <li key={i}>{[e.title, e.place, e.period].filter(Boolean).join(", ")}</li>)}</Block>}
                {m.responsibilities?.length > 0 && <Block title="Responsibilities">{m.responsibilities.map((r: string) => <li key={r}>{r}</li>)}</Block>}
                {m.projects?.length > 0 && <Block title="Projects">{m.projects.map((r: string) => <li key={r}>{r}</li>)}</Block>}
              </div>
              {m.skills?.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{m.skills.map((s: string) => <Tag key={s}>{s}</Tag>)}</div>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{children}</ul>
    </div>
  );
}
