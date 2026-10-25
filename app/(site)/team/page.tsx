import type { Metadata } from "next";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, RichText, Tag, Empty } from "@/components/ui";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Our Team", description: "Meet the team behind the automation and software solutions." };

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const line = (e: any) => [e.title, e.place, e.period].filter(Boolean).join(", ");

export default async function Team() {
  const team = await list("team");
  return (
    <>
      <PageHero eyebrow="Team" title="Meet the team" subtitle="The two people you will work with on your project." image="/img/hero-team.svg" />
      <Breadcrumbs trail={[{ label: "Team" }]} />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-2">
        {!team.length && <Empty title="No team profiles published yet" />}
        {team.map(({ slug, data: m }) => {
          const highlights: string[] = m.highlights?.length ? m.highlights : [m.education?.[0] && line(m.education[0]), m.experience?.[0] && line(m.experience[0])].filter(Boolean);
          const hasMore = m.bio || m.education?.length > 1 || m.experience?.length > 1 || m.responsibilities?.length || m.certifications?.length || m.projects?.length;
          return (
            <article key={slug} id={slug} className="card flex min-w-0 flex-col overflow-hidden !p-0">
              <div className="flex items-center gap-5 bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white">
                <Avatar src={m.photo} name={m.name} className="h-28 w-28 shrink-0 rounded-2xl text-3xl ring-2 ring-cyan-accent/60" />
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-bold">{m.name}</h2>
                  <p className="mt-1 text-sm text-cyan-accent">{m.title}</p>
                  {m.location && <p className="mt-1 text-xs text-slate-300">Based in {m.location}</p>}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                {(m.short || m.bio) && <p className="text-slate-700">{m.short || String(m.bio).split(/(?<=\.)\s/)[0]}</p>}

                {highlights.length > 0 && (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {highlights.slice(0, 4).map((h) => (
                      <li key={h} className="flex gap-2"><span aria-hidden className="mt-0.5 text-brand">✓</span><span>{h}</span></li>
                    ))}
                  </ul>
                )}

                {m.skills?.length > 0 && <div className="flex flex-wrap gap-2">{m.skills.slice(0, 8).map((s: string) => <Tag key={s}>{s}</Tag>)}</div>}

                <div className="mt-auto flex flex-wrap gap-2">
                  {m.email && <a className="btn btn-primary !px-4 !py-2" href={`mailto:${m.email}`}>Email</a>}
                  {m.phone && <a className="btn btn-outline-dark !px-4 !py-2" href={tel(m.phone)}>Call</a>}
                  {m.linkedin && <a className="btn btn-outline-dark !px-4 !py-2" href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                  {m.portfolio && <a className="btn btn-outline-dark !px-4 !py-2" href={m.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
                </div>

                {hasMore && (
                  <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-navy-900">
                      Full profile <span aria-hidden className="text-brand transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="mt-4 space-y-5 text-sm">
                      {m.bio && <RichText text={m.bio} />}
                      <More title="Education" rows={(m.education || []).map(line)} />
                      <More title="Experience" rows={(m.experience || []).map(line)} />
                      <More title="Responsibilities" rows={m.responsibilities || []} />
                      <More title="Training & certifications" rows={m.certifications || []} />
                      <More title="Projects" rows={m.projects || []} />
                      {m.skills?.length > 8 && <div className="flex flex-wrap gap-2">{m.skills.slice(8).map((s: string) => <Tag key={s}>{s}</Tag>)}</div>}
                    </div>
                  </details>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function More({ title, rows }: { title: string; rows: string[] }) {
  if (!rows.length) return null;
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-slate-700">{rows.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}
