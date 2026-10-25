import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { list, get, getAny } from "@/lib/content";
import { currentAdmin } from "@/lib/auth";
import { Sections, Faq } from "@/components/Sections";
import { Breadcrumbs, PageHero, RichText, ServiceCard, Tag } from "@/components/ui";
import Video from "@/components/Video";
import { absUrl } from "@/lib/helpers";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const svc = await get("service", params.slug);
  if (svc) {
    return {
      title: svc.data.seoTitle ? { absolute: svc.data.seoTitle } : svc.data.title,
      description: svc.data.metaDescription || svc.data.short,
      alternates: { canonical: absUrl(`/${svc.slug}`) },
      openGraph: { images: svc.data.hero ? [svc.data.hero] : undefined },
    };
  }
  const page = await get("page", params.slug);
  if (!page) return { title: "Not found", robots: { index: false } };
  return {
    title: page.data.seoTitle ? { absolute: page.data.seoTitle } : page.data.title,
    description: page.data.metaDescription,
    alternates: { canonical: absUrl(`/${page.slug}`) },
    openGraph: { images: page.data.ogImage ? [page.data.ogImage] : undefined },
  };
}

export default async function DynamicPage({ params }: Props) {
  const svc = await get("service", params.slug);
  if (svc) return <ServicePage svc={svc} />;

  let page = await get("page", params.slug);
  // Admins can preview drafts.
  if (!page && currentAdmin()) page = await getAny("page", params.slug);
  if (!page || params.slug === "home") notFound();

  return (
    <>
      {page.data.sections?.[0]?.type !== "hero" && <PageHero title={page.data.title} />}
      <Breadcrumbs trail={[{ label: page.data.title }]} />
      {page.status !== "published" && <p className="bg-amber-100 p-2 text-center text-sm text-amber-900">Draft preview — not visible to the public.</p>}
      <Sections sections={page.data.sections || []} />
    </>
  );
}

async function ServicePage({ svc }: { svc: Awaited<ReturnType<typeof get>> & {} }) {
  const d = svc.data;
  const [all, cats] = await Promise.all([list("service"), list("category")]);
  const related = (d.related || []).map((r: string) => all.find((x) => x.slug === r)).filter(Boolean) as typeof all;
  const cat = cats.find((c) => c.slug === d.category)?.data.name;
  return (
    <>
      <PageHero eyebrow={cat} title={d.title} subtitle={d.short} image={d.hero}>
        <Link href={d.ctaHref || "/contact"} className="btn btn-primary mt-6">{d.ctaLabel || "Contact Us"}</Link>
      </PageHero>
      <Breadcrumbs trail={[{ label: "Services", href: "/services" }, { label: d.title }]} />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <RichText text={d.full} />
          {d.problem && (
            <div>
              <h2 className="h2 mb-2">The business problem</h2>
              <p className="text-slate-700">{d.problem}</p>
            </div>
          )}
          {d.features?.length > 0 && (
            <div>
              <h2 className="h2 mb-4">What we can build</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {d.features.map((f: string) => (
                  <li key={f} className="flex gap-2 rounded-lg border border-slate-200 p-3 text-sm"><span className="text-brand" aria-hidden>✓</span>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {d.benefits?.length > 0 && (
            <div>
              <h2 className="h2 mb-4">Benefits</h2>
              <ul className="list-disc space-y-1 pl-6 text-slate-700">{d.benefits.map((b: string) => <li key={b}>{b}</li>)}</ul>
              <p className="mt-3 text-xs text-slate-500">Results depend on your processes and systems; we do not guarantee specific savings or returns.</p>
            </div>
          )}
          {d.process?.length > 0 && (
            <div>
              <h2 className="h2 mb-4">Our process</h2>
              <ol className="space-y-3">
                {d.process.map((p: any, i: number) => (
                  <li key={i} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span><div><p className="font-semibold text-navy-900">{p.title}</p><p className="text-sm text-slate-600">{p.text}</p></div></li>
                ))}
              </ol>
            </div>
          )}
          {d.video && <div><h2 className="h2 mb-4">Video</h2><Video url={d.video} title={d.title} /></div>}
          {d.images?.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{d.images.map((u: string, i: number) => <img key={i} src={u} alt="" loading="lazy" className="rounded-lg" />)}</div>}
          {d.faqs?.length > 0 && <div><h2 className="h2 mb-4">FAQs</h2><Faq items={d.faqs} /></div>}
        </div>
        <aside className="space-y-6">
          {d.tech?.length > 0 && (
            <div className="card">
              <h2 className="mb-3 font-semibold text-navy-900">Technologies</h2>
              <div className="flex flex-wrap gap-2">{d.tech.map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
            </div>
          )}
          <div className="card bg-navy-900 text-white">
            <h2 className="font-semibold">Talk to us</h2>
            <p className="mt-2 text-sm text-slate-300">Tell us about your workflow and we will suggest a practical approach.</p>
            <Link href="/contact" className="btn btn-primary mt-4 w-full">Contact Us</Link>
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container-x">
            <h2 className="h2 mb-6">Related services</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ServiceCard key={r.slug} href={`/${r.slug}`} title={r.data.title} text={r.data.short} image={r.data.hero} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
