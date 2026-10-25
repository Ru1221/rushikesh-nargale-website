import { settings } from "@/lib/content";
import { saveSettings } from "@/app/admin/actions";
import { hasDb } from "@/lib/db";
import { MediaInput } from "@/components/admin/FieldInputs";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

function T({ n, l, v, area }: { n: string; l: string; v?: string; area?: boolean }) {
  return <div><label className="label" htmlFor={n}>{l}</label>{area ? <textarea id={n} name={n} rows={3} className="input" defaultValue={v} /> : <input id={n} name={n} className="input" defaultValue={v} />}</div>;
}

export default async function Settings({ searchParams }: { searchParams: { saved?: string } }) {
  const s = await settings();
  const mail = !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Website settings</h1>
      {!hasDb && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Connect the database to save settings.</p>}
      {searchParams.saved && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Settings saved.</p>}
      <form action={saveSettings} className="space-y-8 rounded-xl bg-white p-6 shadow-sm">
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-2 font-semibold">General</legend>
          <T n="siteName" l="Website title" v={s.general.siteName} /><T n="tagline" l="Tagline" v={s.general.tagline} />
          <div className="sm:col-span-2"><T n="title" l="Professional title" v={s.general.title} /></div>
          <div><label className="label" htmlFor="logo">Logo</label><MediaInput name="logo" defaultValue={s.general.logo} kind="image" /></div>
          <div><label className="label" htmlFor="favicon">Favicon</label><MediaInput name="favicon" defaultValue={s.general.favicon} kind="image" /></div>
          <T n="ctaPrimary" l="Primary CTA label" v={s.general.ctaPrimary} /><T n="ctaSecondary" l="Secondary CTA label" v={s.general.ctaSecondary} />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-2 font-semibold">Contact & links</legend>
          <T n="contactEmail" l="Email" v={s.contact.email} /><T n="contactPhone" l="Phone" v={s.contact.phone} />
          <T n="linkedin" l="LinkedIn URL" v={s.contact.linkedin} /><T n="portfolioUrl" l="Portfolio URL" v={s.contact.portfolio} />
        </fieldset>
        <fieldset className="space-y-4"><legend className="mb-2 font-semibold">Footer</legend><T n="footerText" l="Footer text" v={s.footer.text} area /></fieldset>
        <fieldset className="grid gap-4"><legend className="mb-2 font-semibold">SEO defaults</legend>
          <T n="seoTitle" l="Default title" v={s.seo.title} /><T n="seoDescription" l="Default description" v={s.seo.description} area />
          <div><label className="label" htmlFor="ogImage">Default social image</label><MediaInput name="ogImage" defaultValue={s.seo.ogImage} kind="image" /></div>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-2 font-semibold">Email notifications</legend>
          <T n="adminEmail" l="Notify (administrator)" v={s.notifications.adminEmail} /><div />
          <T n="rushikeshEmail" l="Rushikesh preferred-contact email" v={s.notifications.rushikesh} /><T n="rutujaEmail" l="Rutuja preferred-contact email" v={s.notifications.rutuja} />
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="sendConfirmation" defaultChecked={s.notifications.sendConfirmation} />Send a confirmation email to the customer</label>
          <p className="text-sm sm:col-span-2">Email provider status: <strong className={mail ? "text-green-700" : "text-amber-700"}>{mail ? "configured (Resend)" : "not configured — inquiries are saved but no emails are sent"}</strong></p>
        </fieldset>
        <button className="btn btn-primary" disabled={!hasDb}>Save settings</button>
      </form>
      <p className="text-xs text-slate-500">API keys and passwords are never shown here; they are set as environment variables.</p>
    </div>
  );
}
