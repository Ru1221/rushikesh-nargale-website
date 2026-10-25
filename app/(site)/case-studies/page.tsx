import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectList";

export const metadata: Metadata = { title: "Case Studies", description: "How we approached specific business problems." };
export default function Page() {
  return <ProjectIndex kind="case_study" />;
}
