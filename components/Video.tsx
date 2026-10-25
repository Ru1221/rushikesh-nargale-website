export function embedUrl(url: string): string | null {
  try {
    const u = new URL(url, "http://x");
    if (/youtube\.com$/.test(u.hostname) || /youtube-nocookie\.com$/.test(u.hostname)) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (/vimeo\.com$/.test(u.hostname)) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

/** Accessible, lazy video: YouTube/Vimeo iframe or a native <video> that loads nothing until played. */
export default function Video({ url, poster, title }: { url: string; poster?: string; title?: string }) {
  if (!url) return null;
  const emb = embedUrl(url);
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
      {emb ? (
        <iframe src={emb} title={title || "Video"} loading="lazy" className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <video controls preload="none" poster={poster || undefined} className="h-full w-full" aria-label={title || "Video"}>
          <source src={url} />
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
}
