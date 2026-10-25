import type { Metadata } from "next";
import { getAny } from "@/lib/content";
import { list } from "@/lib/content";
import { Sections } from "@/components/Sections";

export async function generateMetadata(): Promise<Metadata> {
  const p = (await list("page")).find((x) => x.slug === "home");
  return { title: { absolute: p?.data.seoTitle || "Smart Business Automation" }, description: p?.data.metaDescription };
}

export default async function Home() {
  const page = (await list("page")).find((x) => x.slug === "home") ?? (await getAny("page", "home"));
  return <Sections sections={page?.data.sections || []} />;
}
