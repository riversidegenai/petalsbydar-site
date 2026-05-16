"use client";


import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBouquet } from "@/lib/bouquets";
import { slugToPhoto, depositForCents, formatPrice } from "@/lib/gallery";
import InspirationUpload from "./InspirationUpload";
import StylePicker from "./StylePicker";

export default function DetailsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const bouquetId = params.get("bouquet") || "custom";
  const styleSlug = params.get("style");
  const bouquet = getBouquet(bouquetId);
  const stylePhoto = styleSlug ? slugToPhoto(styleSlug) : null;
  const cameFromGallery = stylePhoto !== null;
  const depositCents = stylePhoto
    ? depositForCents(stylePhoto.priceCents)
    : bouquet?.depositCents ?? 4000;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalCents = stylePhoto?.priceCents ?? bouquet?.priceCents ?? 0;
  const payNowCents = paymentType === "full" ? totalCents : depositCents;

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
          paymentType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not save your order. Please try again.");
      }
      const data = (await res.json()) as { id: string };
      router.push(`/order/payment?orderId=${data.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Fast-path product card — only when they came in from the gallery */}
      {cameFromGallery && stylePhoto && (
        <div className="overflow-hidden rounded-3xl border border-blush-200 bg-white/70 shadow-card">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto md:min-h-[320px]">
              <Image
                src={`/gallery/${stylePhoto.file}`}
                alt="Bouquet you're ordering"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
              <span className="pill self-start">You&apos;re ordering</span>
              <h2 className="serif text-3xl leading-tight md:text-4xl">
                {bouquet!.name}
              </h2>
              <p className="text-sm text-ink-soft">
                Hand-made in this style. Final size, flowers, and personal
                touches confirmed with Dar.
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-blush-700">
                  Starting at
                </p>
                <p className="serif text-2xl text-ink">
                  {formatPrice(stylePhoto.priceCents)}
                </p>
                {stylePhoto.note && (
                  <p className="text-[11px] italic text-blush-800">
                    · {stylePhoto.note}
                  </p>
                )}
              </div>

              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-blush-700">
                How would you like to pay?
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("deposit")}
                  aria-pressed={paymentType === "deposit"}
                  className={`text-left transition hover:shadow-glow ${
                    paymentType === "deposit" ? "card-pink-active" : "card-pink"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blush-700">
                    Pay deposit
                  </p>
                  <p className="serif mt-1 text-2xl">{formatPrice(depositCents)}</p>
                  <p className="mt-1 text-[11px] text-blush-700">
                    Remainder at pickup
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("full")}
                  aria-pressed={paymentType === "full"}
                  className={`text-left transition hover:shadow-glow ${
                    paymentType === "full" ? "card-pink-active" : "card-pink"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blush-700">
                    Pay in full
                  </p>
                  <p className="serif mt-1 text-2xl">{formatPrice(totalCents)}</p>
                  <p className="mt-1 text-[11px] text-blush-700">
                    Nothing owed at pickup
                  </p>
                </button>
              </div>

              <Link
                href="/#gallery"
                className="mt-2 self-start text-xs text-blush-700 underline hover:text-blush-900"
              >
                ← Change selection
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Generic "Selected" header — only when they didn't pick a specific photo */}
      {!cameFromGallery && (
        <div className="card-pink flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
              Selected
            </p>
            <p className="serif mt-1 text-2xl">{bouquet!.name}</p>
            <p className="mt-1 text-xs text-blush-700">
              Pick a style below — or just tell Dar what you have in mind.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blush-700">Deposit today</p>
            <p className="serif text-2xl">{formatPrice(depositCents)}</p>
            <p className="text-xs text-blush-700">Remainder at pickup</p>
          </div>
        </div>
      )}

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
        <label className="label">
          {cameFromGallery ? "Any tweaks? (optional)" : "Tell us about the bouquet"}
        </label>
        <textarea
          className="input min-h-[90px]"
          placeholder={
            cameFromGallery
              ? "Different color palette, a name on the tag, who it's for…"
              : "Occasion, who it's for, colors you love, message for the tag…"
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Inspiration upload + style picker only appear when they're still browsing */}
      {!cameFromGallery && (
        <>
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
        </>
      )}

      <div className="rounded-2xl border border-blush-200 bg-white/70 p-5 text-sm text-ink-soft">
        <p className="serif text-lg text-ink">Next: payment, then pickup time</p>
        <p className="mt-2">
          When you continue, your details are saved and you&apos;ll enter your
          card on the next page to pay{" "}
          {cameFromGallery && paymentType === "full"
            ? `${formatPrice(payNowCents)} in full — nothing owed at pickup.`
            : `the ${formatPrice(payNowCents)} deposit. Your remainder is paid at pickup.`}{" "}
          After payment, you&apos;ll be sent to Square to pick a pickup time.
        </p>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting
            ? "Saving…"
            : cameFromGallery && paymentType === "full"
              ? `Continue to payment — ${formatPrice(payNowCents)} →`
              : `Continue to payment — ${formatPrice(payNowCents)} deposit →`}
        </button>
      </div>
    </form>
  );
}
