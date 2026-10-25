import type { Metadata } from "next";
import { list } from "@/lib/content";
import { Faq } from "@/components/Sections";
import { Breadcrumbs, PageHero, Empty } from "@/components/ui";

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about our services and process." };

export default async function FaqPage() {
  const faqs = await list("faq");
  const groups = [...new Set(faqs.map((f) => f.data.category || "General"))];
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" />
      <Breadcrumbs trail={[{ label: "FAQ" }]} />
      <div className="container-x space-y-10 py-12">
        {!faqs.length && <Empty title="No FAQs published yet" />}
        {groups.map((g) => (
          <section key={g}>
            {groups.length > 1 && <h2 className="h2 mb-4">{g}</h2>}
            <Faq items={faqs.filter((f) => (f.data.category || "General") === g).map((f) => f.data as any)} />
          </section>
        ))}
      </div>
    </>
  );
}
