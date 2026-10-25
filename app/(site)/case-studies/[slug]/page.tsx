import type { Metadata } from "next";
import { list } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectList";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = (await list("project")).find((x) => x.slug === params.slug);
  return { title: p?.data.seoTitle ? { absolute: p.data.seoTitle } : p?.data.title || "Case study", description: p?.data.metaDescription || p?.data.description };
}
export default function Page({ params }: { params: { slug: string } }) {
  return <ProjectDetail kind="case_study" slug={params.slug} />;
}
