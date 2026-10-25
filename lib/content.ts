import { unstable_cache } from "next/cache";
import { hasDb, q } from "./db";
import { seedContent, seedSettings } from "./seed";
import type { Item, Kind } from "./types";

const seedItems: Item[] = seedContent.map((c, i) => ({ ...c, id: i + 1 }));

async function fetchAll(kind: Kind): Promise<Item[]> {
  if (!hasDb) return seedItems.filter((i) => i.kind === kind).sort((a, b) => a.sort - b.sort);
  try {
    return await q<Item>("select id, kind, slug, status, sort, featured, data, updated_at from content where kind=$1 order by sort, id", [kind]);
  } catch (e) {
    console.error("DB read failed, using seed content:", e);
    return seedItems.filter((i) => i.kind === kind);
  }
}

const cachedAll = unstable_cache(async (kind: Kind) => fetchAll(kind), ["content-all"], { tags: ["content"], revalidate: 60 });

/** Published items of a kind (public site). */
export async function list(kind: Kind): Promise<Item[]> {
  return (await cachedAll(kind)).filter((i) => i.status === "published");
}

/** Every item of a kind, including drafts (admin). Never cached. */
export async function listAll(kind: Kind): Promise<Item[]> {
  return fetchAll(kind);
}

export async function get(kind: Kind, slug: string): Promise<Item | undefined> {
  return (await list(kind)).find((i) => i.slug === slug);
}

export async function getAny(kind: Kind, slug: string): Promise<Item | undefined> {
  return (await listAll(kind)).find((i) => i.slug === slug);
}

const cachedSettings = unstable_cache(
  async () => {
    if (!hasDb) return seedSettings;
    try {
      const rows = await q<{ key: string; value: any }>("select key, value from settings");
      const s: Record<string, any> = { ...seedSettings };
      rows.forEach((r) => (s[r.key] = r.value));
      return s;
    } catch {
      return seedSettings;
    }
  },
  ["settings"],
  { tags: ["content"], revalidate: 60 }
);

export async function settings() {
  return (await cachedSettings()) as typeof seedSettings;
}

export function money(n: number) {
  return n.toLocaleString("en-IN");
}
