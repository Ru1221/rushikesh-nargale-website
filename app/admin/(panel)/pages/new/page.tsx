import EditPage from "../[id]/page";

export const metadata = { title: "New page" };

export default function NewPage() {
  return EditPage({ params: { id: "new" }, searchParams: {} });
}
