import fs from "fs";
import path from "path";

/**
 * Real photos override the built-in illustrations automatically.
 * Drop `public/photos/<name>.jpg` (or .webp/.png) and every place that uses `/img/<name>.svg`
 * shows the photo instead. Names are listed in PHOTOS.md.
 */
const DIR = path.join(process.cwd(), "public", "photos");
let cache: { at: number; files: Map<string, string> } | null = null;

function available(): Map<string, string> {
  if (cache && Date.now() - cache.at < 5000) return cache.files;
  const files = new Map<string, string>();
  try {
    for (const f of fs.readdirSync(DIR)) {
      const m = /^([\w-]+)\.(jpe?g|webp|png|avif)$/i.exec(f);
      if (m) files.set(m[1].toLowerCase(), f);
    }
  } catch {
    /* no photos folder yet */
  }
  cache = { at: Date.now(), files };
  return files;
}

export function mapPhotos<T>(value: T): T {
  const files = available();
  if (!files.size) return value;
  const walk = (v: any): any => {
    if (typeof v === "string") {
      const m = /^\/img\/([\w-]+)\.svg$/.exec(v);
      const f = m && files.get(m[1].toLowerCase());
      return f ? `/photos/${f}` : v;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value);
}
