import type { Metadata } from "next";
import { list } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectList";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const p = (await list("project")).find((x) => x.slug === params.slug);
  return { title: p?.data.seoTitle ? { absolute: p.data.seoTitle } : p?.data.title || "Project", description: p?.data.metaDescription || p?.data.description };
}
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <ProjectDetail kind="portfolio" slug={params.slug} />;
}
