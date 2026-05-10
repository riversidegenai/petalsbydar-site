"use client";


import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBouquet, formatUSD } from "@/lib/bouquets";
import { squareBookingUrl } from "@/lib/square";
import InspirationUpload from "./InspirationUpload";
import StylePicker from "./StylePicker";

export default function DetailsForm() {
  const params = useSearchParams();
  const bouquetId = params.get("bouquet") || "custom";
  const styleSlug = params.get("style");
  const bouquet = getBouquet(bouquetId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState(
    styleSlug ? `Inspired by gallery photo: ${styleSlug}` : "",
  );
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!bouquet) {
    return <p className="text-sm text-red-600">Unknown bouquet.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !email) return setErr("Name, phone, and email are required.");

    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bouquetType: bouquetId,
          customerName: name,
          phone,
          email,
          instagram: instagram || null,
          notes: notes || null,
          inspirationUrls,
          inspirationLinks,
          galleryStyle: styleSlug || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.open(squareBookingUrl(), "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="card-pink flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">Selected</p>
          <p className="serif mt-1 text-2xl">{bouquet!.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blush-700">Deposit secures pickup</p>
          <p className="serif text-2xl">{formatUSD(bouquet!.depositCents)}</p>
          <p className="text-xs text-blush-700">Remainder due at pickup</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" placeholder="+1 555 555 0123" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Instagram (optional)</label>
          <input className="input" placeholder="@yourhandle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Tell us about the bouquet</label>
        <textarea
          className="input min-h-[90px]"
          placeholder="Occasion, who it's for, colors you love, message for the tag…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <InspirationUpload
        urls={inspirationUrls}
        setUrls={setInspirationUrls}
        links={inspirationLinks}
        setLinks={setInspirationLinks}
      />

      <StylePicker
        variant={
          bouquetId === "occasion"
            ? "occasion"
            : bouquetId === "just_because"
              ? "just_because"
              : "custom"
        }
      />

      <div className="rounded-2xl border border-blush-200 bg-white/70 p-5 text-sm text-ink-soft">
        <p className="serif text-lg text-ink">Next: pick a pickup time</p>
        <p className="mt-2">
          When you continue, your details are saved and a new tab opens to
          Petals by Dar&apos;s Square booking page. There you&apos;ll pick a
          pickup time and pay the deposit. Your remainder is paid at pickup.
        </p>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Saving…" : "Schedule pickup & pay deposit →"}
        </button>
      </div>
    </form>
  );
}
