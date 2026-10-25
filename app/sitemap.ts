import type { MetadataRoute } from "next";
import { list } from "@/lib/content";
import { absUrl } from "@/lib/helpers";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/services", "/team", "/portfolio", "/case-studies", "/industries", "/faq", "/blog", "/contact", "/book-consultation"];
  const [svcs, pages, projects, posts] = await Promise.all([list("service"), list("page"), list("project"), list("post")]);
  return [
    ...fixed.map((p) => ({ url: absUrl(p || "/") })),
    ...svcs.map((s) => ({ url: absUrl(`/${s.slug}`) })),
    ...pages.filter((p) => p.slug !== "home").map((p) => ({ url: absUrl(`/${p.slug}`) })),
    ...projects.map((p) => ({ url: absUrl(`${(p.data.kind || "portfolio") === "case_study" ? "/case-studies" : "/portfolio"}/${p.slug}`) })),
    ...posts.map((p) => ({ url: absUrl(`/blog/${p.slug}`) })),
  ];
}
