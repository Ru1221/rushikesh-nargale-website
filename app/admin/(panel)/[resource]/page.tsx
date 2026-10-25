import { notFound } from "next/navigation";
import { listAll } from "@/lib/content";
import { RESOURCES } from "@/lib/admin-config";
import ResourceList from "@/components/admin/ResourceList";

export default async function AdminList(
  props: { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string>> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const res = RESOURCES[params.resource];
  if (!res) notFound();
  const items = (await listAll(res.kind)).filter((i) => !res.match || res.match(i.data));
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">{res.title}</h1>
      <ResourceList
        kind={res.kind} base={`/admin/${res.key}`} titleField={res.titleField} items={items}
        publicHref={res.public ? (i) => res.public!(i.slug, i.data) : undefined}
        newHref={`/admin/${res.key}/new`} newLabel={`Add ${res.singular}`} notice={searchParams}
      />
    </div>
  );
}
