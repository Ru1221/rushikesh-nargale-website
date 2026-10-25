import type { Metadata } from "next";
import { serviceNames } from "@/lib/helpers";
import InquiryForm from "@/components/InquiryForm";
import { Breadcrumbs, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Book a Consultation", description: "Request a consultation to discuss your automation or software project." };

export default async function Consultation() {
  const names = await serviceNames();
  return (
    <>
      <PageHero eyebrow="Consultation" title="Book a consultation" subtitle="Share a few details and a preferred time. We will contact you to confirm — a request is not a confirmed booking." />
      <Breadcrumbs trail={[{ label: "Book a Consultation" }]} />
      <div className="container-x max-w-2xl py-12">
        <InquiryForm type="consultation" services={names} />
      </div>
    </>
  );
}
