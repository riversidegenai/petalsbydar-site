"use client";

import { useState } from "react";

export default function InspirationUpload({
  urls,
  setUrls,
  links,
  setLinks,
}: {
  urls: string[];
  setUrls: (u: string[]) => void;
  links: string[];
  setLinks: (l: string[]) => void;
}) {
  const [linkDraft, setLinkDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setErr(null);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { url: string };
        newUrls.push(data.url);
      }
      setUrls([...urls, ...newUrls]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addLink() {
    const v = linkDraft.trim();
    if (!v) return;
    setLinks([...links, v]);
    setLinkDraft("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Inspiration (optional — pictures, videos, links)</label>
        <p className="mt-1 text-xs text-blush-700">
          Show us what you love — drop a few images or videos (up to 25 MB each) plus reference links from Pinterest, Instagram, anything.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-blush-300 bg-blush-50/40 px-4 py-3 text-sm hover:bg-blush-50">
        <span>📎 Add photos / video</span>
        <span className="text-xs text-blush-700">or paste a link below</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </label>
      {uploading && <p className="text-xs text-blush-700">Uploading…</p>}
      {err && <p className="text-xs text-red-600">{err}</p>}
      {urls.length > 0 && (
        <ul className="text-xs text-blush-800">
          {urls.map((u) => (
            <li key={u}>📎 {u.split("/").pop()}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="e.g. pinterest.com/pin/… or instagram.com/p/…"
          value={linkDraft}
          onChange={(e) => setLinkDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
        />
        <button type="button" onClick={addLink} className="btn-secondary px-4 py-2">
          Add
        </button>
      </div>
      {links.length > 0 && (
        <ul className="text-xs text-blush-800">
          {links.map((l, i) => (
            <li key={i}>🔗 {l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
