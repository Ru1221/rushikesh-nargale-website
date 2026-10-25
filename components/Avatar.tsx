"use client";
import { useState } from "react";

/** Profile photo with an initials fallback when the image is missing or fails to load. */
export default function Avatar({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = String(name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (src && !failed) {
    return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={`object-cover object-top ${className}`} />;
  }
  return (
    <div role="img" aria-label={name} className={`grid place-items-center bg-gradient-to-br from-navy-700 to-brand font-bold text-white ${className}`}>
      <span aria-hidden>{initials}</span>
    </div>
  );
}
