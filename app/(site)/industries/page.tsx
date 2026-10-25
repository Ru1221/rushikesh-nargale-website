import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, Empty } from "@/components/ui";

export const metadata: Metadata = { title: "Industries We Serve", description: "Automation and software solutions for different industries." };

export default async function Industries() {
  const [inds, svcs] = await Promise.all([list("industry"), list("service")]);
  return (
    <>
      <PageHero eyebrow="Industries" title="Industries we serve" subtitle="Where our automation and software solutions fit best." image="/img/hero-industries.svg" />
      <Breadcrumbs trail={[{ label: "Industries" }]} />
      <div className="container-x grid gap-6 py-12 md:grid-cols-2">
        {!inds.length && <Empty title="No industries published yet" />}
        {inds.map(({ slug, data: d }) => (
          <section key={slug} id={slug} className="card scroll-mt-24">
            {d.image && <img src={d.image} alt="" loading="lazy" className="mb-4 aspect-video w-full rounded-lg object-cover" />}
            <h2 className="text-xl font-semibold text-navy-900">{d.name}</h2>
            <p className="mt-2 text-slate-600">{d.description}</p>
            <p className="mt-4 text-sm font-medium text-slate-700">Relevant services</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {(d.services || []).map((s: string) => {
                const svc = svcs.find((x) => x.slug === s);
                return svc ? <li key={s}><Link className="text-brand hover:underline" href={`/${s}`}>{svc.data.title}</Link></li> : null;
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
