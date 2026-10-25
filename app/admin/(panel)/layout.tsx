import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import ConfirmScript from "@/components/admin/ConfirmScript";

export const metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

const links: [string, string][] = [
  ["/admin", "Dashboard"], ["/admin/pages", "Pages"], ["/admin/services", "Services"], ["/admin/categories", "Categories"],
  ["/admin/industries", "Industries"], ["/admin/portfolio", "Portfolio"], ["/admin/case-studies", "Case studies"], ["/admin/blog", "Blog"],
  ["/admin/faq", "FAQs"], ["/admin/team", "Team"], ["/admin/blocks", "Reusable blocks"], ["/admin/media", "Images"], ["/admin/media/videos", "Videos"],
  ["/admin/inquiries", "Inquiries"], ["/admin/navigation", "Navigation"], ["/admin/settings", "Settings"],
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = requireAdmin();
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="bg-navy-950 text-slate-200 lg:min-h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between p-4 lg:block">
          <p className="font-bold text-white">Admin panel</p>
          <p className="hidden text-xs text-slate-400 lg:block">{email}</p>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-3 lg:block lg:space-y-0.5 lg:overflow-visible">
          {links.map(([h, l]) => <Link key={h} href={h} className="block whitespace-nowrap rounded px-3 py-1.5 text-sm hover:bg-white/10">{l}</Link>)}
          <Link href="/" target="_blank" className="block whitespace-nowrap rounded px-3 py-1.5 text-sm text-cyan-accent hover:bg-white/10">View site ↗</Link>
          <form action={logout}><button className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-white/10">Sign out</button></form>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}<ConfirmScript /></main>
    </div>
  );
}
