import type { Metadata } from "next";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, ServiceCard } from "@/components/ui";

export const metadata: Metadata = { title: "Services", description: "AI automation, business automation, integrations and custom software." };

export default async function Services() {
  const [svcs, cats] = await Promise.all([list("service"), list("category")]);
  return (
    <>
      <PageHero eyebrow="Services" title="All services" subtitle="Practical AI, automation and software solutions for your business." />
      <Breadcrumbs trail={[{ label: "Services" }]} />
      <div className="container-x space-y-12 py-12">
        {cats.map((c) => {
          const items = svcs.filter((s) => s.data.category === c.slug);
          if (!items.length) return null;
          return (
            <section key={c.slug} aria-labelledby={`c-${c.slug}`}>
              <h2 id={`c-${c.slug}`} className="h2 mb-5">{c.data.name}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => <ServiceCard key={s.slug} href={`/${s.slug}`} title={s.data.title} text={s.data.short} />)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
