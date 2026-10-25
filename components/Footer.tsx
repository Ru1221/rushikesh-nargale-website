import Link from "next/link";

export default function Footer({
  name, tagline, text, links, contact,
}: {
  name: string; tagline: string; text: string;
  links: { label: string; href: string }[];
  contact: { email?: string; phone?: string; linkedin?: string; locations?: string[] };
}) {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Link href="/" aria-label={`${name} - ${tagline}`}><img src="/logo-dark.svg" alt={`${name} - ${tagline}`} width="725" height="130" loading="lazy" className="h-auto w-full max-w-[320px]" /></Link>
          <p className="mt-3 text-sm">{text}</p>
        </div>
        <nav aria-label="Footer">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Links</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {links.map((l) => (
              <li key={l.href + l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Contact</p>
          <ul className="space-y-2">
            {contact.email && <li><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>}
            {contact.phone && <li><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white">{contact.phone}</a></li>}
            {(contact.locations || []).map((l) => <li key={l}>{l}</li>)}
            {contact.linkedin && <li><a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}
