import type { Metadata } from "next";
import { list, settings } from "@/lib/content";
import { serviceNames } from "@/lib/helpers";
import InquiryForm from "@/components/InquiryForm";
import { Breadcrumbs, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Contact Us", description: "Send an enquiry or contact the team directly." };

export default async function Contact() {
  const [team, names, s] = await Promise.all([list("team"), serviceNames(), settings()]);
  return (
    <>
      <PageHero eyebrow="Contact" title="Contact us" subtitle="Tell us about your project and we will get back to you." image="/img/hero-contact.svg" />
      <Breadcrumbs trail={[{ label: "Contact" }]} />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="h2 mb-5">Send an enquiry</h2>
          <InquiryForm type="contact" services={names} />
        </div>
        <aside className="space-y-5">
          {team.map(({ slug, data: m }) => (
            <div key={slug} className="card">
              <h3 className="font-semibold text-navy-900">{m.name}</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li><a className="text-brand hover:underline" href={`mailto:${m.email}`}>{m.email}</a></li>
                <li><a className="text-brand hover:underline" href={`tel:${String(m.phone).replace(/[^\d+]/g, "")}`}>{m.phone}</a></li>
                {m.linkedin && <li><a className="text-brand hover:underline" href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
              </ul>
            </div>
          ))}
          {s.contact.portfolio && <p className="text-sm text-slate-600">Portfolio: <a className="text-brand hover:underline" href={s.contact.portfolio} target="_blank" rel="noopener noreferrer">{s.contact.portfolio}</a></p>}
        </aside>
      </div>
    </>
  );
}
