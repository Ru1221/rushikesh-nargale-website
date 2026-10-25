import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectList";

export const metadata: Metadata = { title: "Portfolio", description: "Selected projects and automation work." };
export default function Page() {
  return <ProjectIndex kind="portfolio" />;
}
