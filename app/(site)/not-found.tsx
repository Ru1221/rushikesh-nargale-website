import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn btn-primary mt-6">Back to home</Link>
    </div>
  );
}
