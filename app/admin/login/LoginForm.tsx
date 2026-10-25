"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "../actions";

function Btn() {
  const { pending } = useFormStatus();
  return <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>;
}

export default function LoginForm() {
  const [s, action] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-5 space-y-4">
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
      {s.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
      <Btn />
    </form>
  );
}
