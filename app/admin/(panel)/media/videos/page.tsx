import MediaManager from "@/components/admin/MediaManager";
import { hasDb } from "@/lib/db";

export const metadata = { title: "Videos" };

export default function Videos() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">Videos</h1>
      {!hasDb ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Connect the database to upload media.</p> : <MediaManager kind="video" />}
    </div>
  );
}
