import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@/lib/content";
import { Breadcrumbs, PageHero, Empty, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "Blog and Insights", description: "Articles on AI, automation and software integration." };

const PER = 9;

export default async function Blog({ searchParams }: { searchParams: { page?: string; q?: string; tag?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const qs = (searchParams.q || "").toLowerCase().trim();
  let posts = (await list("post")).filter((p) => !p.data.publishedAt || new Date(p.data.publishedAt) <= new Date());
  posts.sort((a, b) => String(b.data.publishedAt || "").localeCompare(String(a.data.publishedAt || "")));
  if (qs) posts = posts.filter((p) => `${p.data.title} ${p.data.excerpt}`.toLowerCase().includes(qs));
  if (searchParams.tag) posts = posts.filter((p) => (p.data.tags || []).includes(searchParams.tag));
  const pages = Math.max(1, Math.ceil(posts.length / PER));
  const slice = posts.slice((page - 1) * PER, page * PER);
  const link = (n: number) => `/blog?page=${n}${qs ? `&q=${encodeURIComponent(qs)}` : ""}`;

  return (
    <>
      <PageHero eyebrow="Blog" title="Blog and insights" subtitle="Practical notes on AI, automation and software integration." />
      <Breadcrumbs trail={[{ label: "Blog" }]} />
      <div className="container-x py-12">
        <form role="search" className="mb-8 flex max-w-md gap-2">
          <label htmlFor="q" className="sr-only">Search posts</label>
          <input id="q" name="q" defaultValue={searchParams.q} placeholder="Search posts" className="input" />
          <button className="btn btn-primary">Search</button>
        </form>
        {!slice.length && <Empty title="No posts found" text="Published posts will appear here." />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {slice.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card block">
              {p.data.image && <img src={p.data.image} alt="" loading="lazy" className="mb-3 aspect-video w-full rounded-lg object-cover" />}
              <p className="text-xs text-slate-500">{p.data.publishedAt ? new Date(p.data.publishedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}</p>
              <h2 className="mt-1 font-semibold text-navy-900">{p.data.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{p.data.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">{(p.data.tags || []).map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
            </Link>
          ))}
        </div>
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3 text-sm">
            {page > 1 && <Link className="btn btn-outline-dark" href={link(page - 1)}>← Previous</Link>}
            <span>Page {page} of {pages}</span>
            {page < pages && <Link className="btn btn-outline-dark" href={link(page + 1)}>Next →</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
