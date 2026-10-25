import Header, { type NavLink } from "@/components/Header";
import Footer from "@/components/Footer";
import { list, settings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, nav, services, cats] = await Promise.all([settings(), list("nav"), list("service"), list("category")]);
  const visible = nav.filter((n) => n.data.visible !== false);
  const headerItems = visible.filter((n) => n.data.location === "header");
  const catName = (slug: string) => cats.find((c) => c.slug === slug)?.data.name || "";
  const links: NavLink[] = headerItems
    .filter((n) => !n.data.parent)
    .map((n) => {
      const kids = headerItems.filter((k) => k.data.parent === n.slug).map((k) => ({ label: k.data.label, href: k.data.href }));
      if (!kids.length && n.data.href === "/services") {
        const order = (slug: string) => cats.findIndex((c) => c.slug === slug);
        const sorted = [...services].sort((a, b) => order(a.data.category) - order(b.data.category));
        return { label: n.data.label, href: n.data.href, children: sorted.map((x) => ({ label: x.data.title, href: `/${x.slug}`, group: catName(x.data.category) })) };
      }
      return { label: n.data.label, href: n.data.href, children: kids.length ? kids : undefined };
    });
  const footerLinks = visible.filter((n) => n.data.location === "footer").map((n) => ({ label: n.data.label, href: n.data.href }));

  return (
    <>
      <Header name={s.general.siteName} logo={s.general.logo} links={links} />
      <main id="main">{children}</main>
      <Footer name={s.general.siteName} tagline={s.general.tagline} text={s.footer.text} links={footerLinks} contact={s.contact} />
    </>
  );
}
