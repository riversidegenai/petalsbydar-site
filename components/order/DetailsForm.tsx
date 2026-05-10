"use client";


import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBouquet, formatUSD } from "@/lib/bouquets";
import DateChips from "./DateChips";
import TimeChips from "./TimeChips";
import InspirationUpload from "./InspirationUpload";

export default function DetailsForm() {
  const params = useSearchParams();
  const router = useRouter();
  const bouquetId = params.get("bouquet") || "custom";
  const styleSlug = params.get("style");
  const bouquet = getBouquet(bouquetId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
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
    if (!pickupDate) return setErr("Pick a pickup date.");
    if (!pickupTime) return setErr("Pick a pickup time.");
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
          pickupDate,
          pickupTime,
          notes: notes || null,
          inspirationUrls,
          inspirationLinks,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = (await res.json()) as { id: string };
      router.push(`/order/deposit?orderId=${id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
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
          <p className="serif text-2xl">{formatUSD(bouquet!.priceCents)}</p>
          <p className="text-xs text-blush-700">{formatUSD(bouquet!.depositCents)} deposit</p>
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
        <p className="label mb-3">Pickup or delivery date</p>
        <DateChips value={pickupDate} onChange={setPickupDate} />
      </div>

      <div>
        <p className="label mb-3">Pickup time</p>
        <TimeChips value={pickupTime} onChange={setPickupTime} />
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

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Saving…" : "Continue to deposit →"}
        </button>
      </div>
    </form>
  );
}
