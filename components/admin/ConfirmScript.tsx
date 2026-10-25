"use client";
import { useEffect } from "react";

/** Asks for confirmation before any button marked data-confirm submits its form. */
export default function ConfirmScript() {
  useEffect(() => {
    const h = (e: Event) => {
      const t = (e.target as HTMLElement).closest("[data-confirm]") as HTMLElement | null;
      if (t && !window.confirm(t.getAttribute("data-confirm") || "Are you sure?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, []);
  return null;
}
