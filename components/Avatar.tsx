"use client";
import { useEffect, useRef, useState } from "react";

/** Profile photo with an initials fallback when the image is missing or fails to load. */
export default function Avatar({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const initials = String(name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // An image can fail before React hydrates, so onError never fires: check once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (src && !failed) {
    return <img ref={ref} src={src} alt={name} onError={() => setFailed(true)} className={`object-cover object-top ${className}`} />;
  }
  return (
    <div role="img" aria-label={name} className={`grid place-items-center bg-gradient-to-br from-navy-700 to-brand font-bold text-white ${className}`}>
      <span aria-hidden>{initials}</span>
    </div>
  );
}
