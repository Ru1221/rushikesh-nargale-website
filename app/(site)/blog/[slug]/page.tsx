import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { get } from "@/lib/content";
import { Breadcrumbs, PageHero, RichText, Tag } from "@/components/ui";
import { absUrl } from "@/lib/helpers";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const p = await get("post", params.slug);
  if (!p) return { title: "Not found", robots: { index: false } };
  return {
    title: p.data.seoTitle ? { absolute: p.data.seoTitle } : p.data.title,
    description: p.data.metaDescription || p.data.excerpt,
    alternates: { canonical: absUrl(`/blog/${p.slug}`) },
    openGraph: { type: "article", images: p.data.image ? [p.data.image] : undefined },
  };
}

export default async function Post(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const p = await get("post", params.slug);
  if (!p) notFound();
  const d = p.data;
  return (
    <>
      <PageHero eyebrow={d.category || "Blog"} title={d.title} subtitle={d.excerpt} />
      <Breadcrumbs trail={[{ label: "Blog", href: "/blog" }, { label: d.title }]} />
      <article className="container-x max-w-3xl py-12">
        {d.publishedAt && <p className="mb-4 text-sm text-slate-500">{new Date(d.publishedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>}
        {d.image && <img src={d.image} alt="" className="mb-6 w-full rounded-xl" />}
        <RichText text={d.content || ""} />
        <div className="mt-6 flex flex-wrap gap-2">{(d.tags || []).map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
      </article>
    </>
  );
}
