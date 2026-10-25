"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-24 text-center" role="alert">
      <h1 className="text-2xl font-bold text-navy-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">Please try again in a moment.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Try again</button>
    </div>
  );
}
