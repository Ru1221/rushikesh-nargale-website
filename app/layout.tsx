import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { settings } from "@/lib/content";
import { absUrl } from "@/lib/helpers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await settings();
  return {
    metadataBase: new URL(absUrl()),
    title: { default: s.seo.title, template: `%s | ${s.general.siteName}` },
    description: s.seo.description,
    icons: s.general.favicon ? { icon: s.general.favicon } : undefined,
    openGraph: { type: "website", siteName: s.general.siteName, images: s.seo.ogImage ? [s.seo.ogImage] : undefined },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
