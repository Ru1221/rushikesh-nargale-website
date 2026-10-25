import type { Metadata } from "next";
import { list } from "@/lib/content";
import { Faq } from "@/components/Sections";
import { Breadcrumbs, PageHero, Empty, SectionHead } from "@/components/ui";

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about our services and process." };

const GROUP_IMG: Record<string, { image: string; intro: string }> = {
  General: { image: "/img/faq-general.svg", intro: "About us, how projects start and what to expect." },
  Services: { image: "/img/faq-services.svg", intro: "What we build and how it can fit your business." },
  "Pricing & timelines": { image: "/img/faq-pricing.svg", intro: "How projects are scoped, priced and scheduled." },
  "Technical & security": { image: "/img/faq-technical.svg", intro: "Integrations, data handling and ownership." },
};

export default async function FaqPage() {
  const faqs = await list("faq");
  const groups = Array.from(new Set(faqs.map((f) => f.data.category || "General")));
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" subtitle="Quick answers about how we work." image="/img/hero-faq.svg" />
      <Breadcrumbs trail={[{ label: "FAQ" }]} />
      <div className="container-x space-y-14 py-12">
        {!faqs.length && <Empty title="No FAQs published yet" />}
        {groups.map((g) => (
          <section key={g} aria-label={g}>
            <SectionHead title={g} intro={GROUP_IMG[g]?.intro} image={GROUP_IMG[g]?.image} />
            <Faq items={faqs.filter((f) => (f.data.category || "General") === g).map((f) => f.data as any)} />
          </section>
        ))}
      </div>
    </>
  );
}
