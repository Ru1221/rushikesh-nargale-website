import { notFound } from "next/navigation";
import { listAll } from "@/lib/content";
import { savePage } from "@/app/admin/actions";
import PageEditor from "@/components/admin/PageEditor";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const isNew = params.id === "new";
  const item = isNew ? undefined : (await listAll("page")).find((i) => String(i.id) === params.id);
  if (!isNew && !item) notFound();
  const d = item?.data || {};
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">{isNew ? "New page" : `Edit page: ${d.title}`}</h1>
      {searchParams.saved && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">Saved. Published changes are live.</p>}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <PageEditor
          action={savePage.bind(null, params.id)} isNew={isNew} isHome={item?.slug === "home"}
          previewHref={item ? (item.slug === "home" ? "/" : `/${item.slug}`) : undefined}
          initial={{
            title: d.title || "", slug: item?.slug || "", status: item?.status || "draft", seoTitle: d.seoTitle || "", metaDescription: d.metaDescription || "",
            ogImage: d.ogImage || "", showInNav: !!d.showInNav,
            sections: d.sections || [],
          }}
        />
      </div>
    </div>
  );
}
