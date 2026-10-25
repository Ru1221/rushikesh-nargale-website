import { list } from "./content";

export async function serviceNames(): Promise<string[]> {
  return (await list("service")).map((s) => s.data.title as string);
}

export function absUrl(path = "") {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return base + path;
}
