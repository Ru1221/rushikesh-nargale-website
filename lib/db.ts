import { Pool } from "pg";
import { seedContent, seedSettings } from "./seed";

export const hasDb = !!process.env.DATABASE_URL;

/** Bump when lib/seed.ts content changes. Untouched rows are upgraded on the next start; rows edited in the admin are never overwritten. */
const SEED_VERSION = 7;

const g = globalThis as unknown as { _pool?: Pool; _ready?: Promise<void> };

export function pool(): Pool {
  if (!g._pool) {
    const url = process.env.DATABASE_URL!;
    const local = /localhost|127\.0\.0\.1/.test(url);
    g._pool = new Pool({
      connectionString: url,
      ssl: local || /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return g._pool;
}

const SCHEMA = `
create table if not exists content (
  id serial primary key,
  kind text not null,
  slug text not null,
  status text not null default 'published' check (status in ('draft','published','archived')),
  sort int not null default 0,
  featured boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);
create index if not exists content_kind_status on content (kind, status, sort);
create table if not exists settings (key text primary key, value jsonb not null);
create table if not exists media (
  id serial primary key,
  kind text not null check (kind in ('image','video')),
  filename text not null,
  mime text not null,
  size int not null,
  data bytea not null,
  title text default '',
  alt text default '',
  caption text default '',
  description text default '',
  category text default '',
  thumb_id int,
  status text not null default 'published',
  created_at timestamptz not null default now()
);
create table if not exists inquiries (
  id serial primary key,
  reference text unique not null,
  type text not null default 'contact',
  full_name text not null,
  email text not null,
  phone text default '',
  company text default '',
  job_title text default '',
  service text default '',
  other_service text default '',
  message text default '',
  current_tools text default '',
  budget text default '',
  timeline text default '',
  contact_method text default '',
  team_contact text default '',
  preferred_time text default '',
  consent boolean not null default false,
  status text not null default 'New',
  priority text not null default 'Normal',
  assigned_to text default '',
  archived boolean not null default false,
  email_status text default 'not_configured',
  created_at timestamptz not null default now()
);
create table if not exists inquiry_notes (
  id serial primary key,
  inquiry_id int not null references inquiries(id) on delete cascade,
  author text not null,
  note text not null,
  created_at timestamptz not null default now()
);
`;

/** Creates tables and seeds sample content on first use. Safe to call repeatedly. */
export function ready(): Promise<void> {
  if (!g._ready) {
    g._ready = (async () => {
      const p = pool();
      await p.query(SCHEMA);
      const { rows } = await p.query("select count(*)::int as n from content");
      if (rows[0].n === 0) {
        for (const c of seedContent) {
          await p.query(
            "insert into content (kind, slug, status, sort, featured, data) values ($1,$2,$3,$4,$5,$6) on conflict do nothing",
            [c.kind, c.slug, c.status, c.sort, c.featured, JSON.stringify(c.data)]
          );
        }
      }
      for (const [k, v] of Object.entries(seedSettings)) {
        await p.query("insert into settings (key, value) values ($1,$2) on conflict do nothing", [k, JSON.stringify(v)]);
      }
      const ver = (await p.query("select value from settings where key='__seed_version'")).rows[0]?.value;
      if (Number(ver ?? 0) < SEED_VERSION) {
        for (const c of seedContent) {
          const r = await p.query("select id, created_at, updated_at from content where kind=$1 and slug=$2", [c.kind, c.slug]);
          if (!r.rows.length) {
            await p.query("insert into content (kind, slug, status, sort, featured, data) values ($1,$2,$3,$4,$5,$6)", [c.kind, c.slug, c.status, c.sort, c.featured, JSON.stringify(c.data)]);
          } else if (r.rows[0].created_at.getTime() === r.rows[0].updated_at.getTime()) {
            // never edited in the admin: safe to refresh (updated_at is left untouched)
            await p.query("update content set data=$1, status=$2, sort=$3, featured=$4 where id=$5", [JSON.stringify(c.data), c.status, c.sort, c.featured, r.rows[0].id]);
          }
        }
        await p.query("update settings set value = jsonb_set(value, '{tagline}', to_jsonb($1::text)) where key='general' and value->>'tagline' = 'Automate. Integrate. Innovate.'", [seedSettings.general.tagline]);
        await p.query("update settings set value = jsonb_set(value, '{locations}', $1::jsonb) where key='contact' and not (value ? 'locations')", [JSON.stringify(seedSettings.contact.locations)]);
        await p.query("insert into settings (key, value) values ('__seed_version', $1) on conflict (key) do update set value = excluded.value", [JSON.stringify(SEED_VERSION)]);
      }
    })().catch((e) => {
      g._ready = undefined;
      throw e;
    });
  }
  return g._ready;
}

export async function q<T = any>(text: string, params: any[] = []): Promise<T[]> {
  await ready();
  const r = await pool().query(text, params);
  return r.rows as T[];
}
