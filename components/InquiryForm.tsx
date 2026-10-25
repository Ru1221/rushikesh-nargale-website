"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { submitInquiry, type FormState } from "@/app/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
      {pending ? "Sending…" : label}
    </button>
  );
}

function Field({ name, label, error, required, children }: { name: string; label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span aria-hidden className="text-red-600">*</span>}
      </label>
      {children}
      {error && <p id={`${name}-err`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const initial: FormState = { ok: false, message: "" };

export default function InquiryForm({ type, services }: { type: "contact" | "consultation"; services: string[] }) {
  const [state, action] = useFormState(submitInquiry, initial);
  const [ts] = useState(() => Date.now());
  const e = state.errors || {};
  const consult = type === "consultation";

  if (state.ok && state.reference) {
    return (
      <div role="status" className="rounded-xl border border-green-300 bg-green-50 p-6 text-green-900">
        <p className="text-lg font-semibold">Thank you!</p>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  const f = (n: string) => ({ id: n, name: n, className: "input", "aria-describedby": e[n] ? `${n}-err` : undefined, "aria-invalid": !!e[n] });

  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="ts" value={ts} />
      <div className="hidden" aria-hidden>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {state.message && !state.ok && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label="Full name" required error={e.full_name}><input {...f("full_name")} required autoComplete="name" /></Field>
        <Field name="email" label="Work email" required error={e.email}><input {...f("email")} type="email" required autoComplete="email" /></Field>
        <Field name="phone" label="Phone number"><input {...f("phone")} type="tel" autoComplete="tel" /></Field>
        <Field name="company" label="Company name"><input {...f("company")} autoComplete="organization" /></Field>
        {!consult && <Field name="job_title" label="Job title"><input {...f("job_title")} /></Field>}
        <Field name="service" label={consult ? "Preferred service" : "Service required"}>
          <select {...f("service")} defaultValue="">
            <option value="">Select a service…</option>
            {services.map((s) => <option key={s}>{s}</option>)}
            <option>Other</option>
          </select>
        </Field>
        {!consult && <Field name="other_service" label="Other service (if not listed)"><input {...f("other_service")} /></Field>}
      </div>

      <Field name="message" label={consult ? "Project details" : "Project description"} required error={e.message}>
        <textarea {...f("message")} rows={5} required />
      </Field>

      {!consult && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="current_tools" label="Current tools"><input {...f("current_tools")} placeholder="e.g. Tally, Zoho, Google Sheets" /></Field>
          <Field name="budget" label="Budget range">
            <select {...f("budget")} defaultValue=""><option value="">Prefer not to say</option><option>Under ₹25,000</option><option>₹25,000 – ₹1,00,000</option><option>₹1,00,000 – ₹5,00,000</option><option>Above ₹5,00,000</option></select>
          </Field>
          <Field name="timeline" label="Expected timeline">
            <select {...f("timeline")} defaultValue=""><option value="">Not sure</option><option>Immediately</option><option>Within 1 month</option><option>1–3 months</option><option>3+ months</option></select>
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {consult && <Field name="preferred_time" label="Preferred date / time"><input {...f("preferred_time")} placeholder="e.g. Weekdays after 4 pm" /></Field>}
        <Field name="contact_method" label="Preferred contact method">
          <select {...f("contact_method")} defaultValue=""><option value="">No preference</option><option>Email</option><option>Phone</option><option>WhatsApp</option></select>
        </Field>
        <Field name="team_contact" label="Preferred team contact">
          <select {...f("team_contact")} defaultValue="No Preference"><option>No Preference</option><option>Rushikesh</option><option>Rutuja</option></select>
        </Field>
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent" id="consent" className="mt-1" aria-describedby={e.consent ? "consent-err" : undefined} />
          <span>I agree to be contacted about my enquiry. See the <a className="text-brand underline" href="/privacy-policy">Privacy Policy</a>. <span aria-hidden className="text-red-600">*</span></span>
        </label>
        {e.consent && <p id="consent-err" role="alert" className="mt-1 text-sm text-red-600">{e.consent}</p>}
      </div>

      <Submit label={consult ? "Request consultation" : "Send enquiry"} />
    </form>
  );
}
