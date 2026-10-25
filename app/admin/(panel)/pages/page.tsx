import { listAll } from "@/lib/content";
import ResourceList from "@/components/admin/ResourceList";

export const metadata = { title: "Pages" };

export default async function AdminPages({ searchParams }: { searchParams: Record<string, string> }) {
  const items = await listAll("page");
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-navy-900">Pages</h1>
      <p className="mb-4 text-sm text-slate-600">Create and edit pages with the section builder. Published pages are available at <code>/slug</code>.</p>
      <ResourceList kind="page" base="/admin/pages" titleField="title" items={items} newHref="/admin/pages/new" newLabel="New page"
        publicHref={(i) => (i.slug === "home" ? "/" : `/${i.slug}`)} notice={searchParams} />
    </div>
  );
}
