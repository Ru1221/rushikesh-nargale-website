import { redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false } };

export default function Login() {
  if (currentAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-bold text-navy-900">Admin login</h1>
        {!adminConfigured() && (
          <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Admin is not configured. Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> (16+ characters) in the environment.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
