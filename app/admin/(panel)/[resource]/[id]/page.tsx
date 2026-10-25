import { notFound } from "next/navigation";
import { listAll } from "@/lib/content";
import { RESOURCES } from "@/lib/admin-config";
import { saveItem } from "@/app/admin/actions";
import ItemForm from "@/components/admin/ItemForm";

export default async function AdminEdit(props: { params: Promise<{ resource: string; id: string }> }) {
  const params = await props.params;
  const res = RESOURCES[params.resource];
  if (!res) notFound();
  const isNew = params.id === "new";
  const item = isNew ? undefined : (await listAll(res.kind)).find((i) => String(i.id) === params.id);
  if (!isNew && !item) notFound();
  const fields = res.fields.map((f) => (f.name === "sections" && res.kind === "block" && item ? f : f));
  const data = { ...(item?.data || {}) };
  if (res.kind === "block") data.sections = JSON.stringify(item?.data.sections || [], null, 2);
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">{isNew ? `New ${res.singular}` : `Edit ${res.singular}`}</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ItemForm
          action={saveItem.bind(null, res.key, params.id)}
          fields={fields}
          initial={{ data, slug: item?.slug || "", status: item?.status || "draft", sort: item?.sort ?? 0, featured: item?.featured ?? false }}
          back={`/admin/${res.key}`} hasFeatured={res.hasFeatured} isNew={isNew}
          publicHref={item && res.public ? res.public(item.slug, item.data) : undefined}
        />
      </div>
    </div>
  );
}
