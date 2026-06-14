import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { isR2Configured, uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

// Inspiration uploads are unauthenticated by necessity — they happen before an
// order row exists. To stop the endpoint from being abused as free public file
// hosting we constrain it tightly: only image/video MIME types, a hard size cap
// matching the UI's "up to 25 MB each", and a sanitized object key. Files are
// stored in Cloudflare R2 (zero-egress) so the florist can view them cheaply.
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB, matches InspirationUpload copy
const ALLOWED_PREFIXES = ["image/", "video/"];

function safeFilename(name: string): string {
  // Drop any path components and keep a conservative character set so a crafted
  // filename can't traverse or inject into the object key.
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "file";
}

export async function POST(req: Request) {
  // Cap uploads per IP so the endpoint can't be used to bulk-fill storage.
  const limited = checkRateLimit(req, "upload", 20, 60_000);
  if (limited.blocked) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const url = new URL(req.url);
  const filenameParam = url.searchParams.get("filename");
  if (!filenameParam) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ error: "Missing body" }, { status: 400 });
  }

  // Graceful fallback: if object storage isn't set up yet, don't 500. Tell the
  // client so the UI can invite the customer to paste a reference link instead
  // (links need no storage and always work). `storageUnconfigured` lets the
  // frontend show friendly guidance rather than a scary error.
  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Photo uploads aren't available right now — please paste a reference link (Pinterest, Instagram, etc.) below instead.",
        storageUnconfigured: true,
      },
      { status: 503 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!ALLOWED_PREFIXES.some((p) => contentType.startsWith(p))) {
    return NextResponse.json(
      { error: "Only image and video files are allowed." },
      { status: 415 },
    );
  }

  // Reject oversize uploads up front when the client declares a length, so we
  // don't stream 25 MB+ into storage before failing.
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 25 MB)." },
      { status: 413 },
    );
  }

  // Buffer the body so we can enforce the size cap even when content-length is
  // absent or spoofed.
  const bytes = await req.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 25 MB)." },
      { status: 413 },
    );
  }

  // Unique, sanitized key. A random prefix avoids collisions without leaking a
  // guessable sequence. (Date-based + counter-free; Math.random is fine here —
  // this isn't a security token, just a key disambiguator.)
  const rand = Math.random().toString(36).slice(2, 10);
  const key = `inspiration/${Date.now()}-${rand}-${safeFilename(filenameParam)}`;

  try {
    const publicUrl = await uploadToR2(key, bytes, contentType);
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "upload", step: "r2_put" } });
    return NextResponse.json(
      {
        error:
          "We couldn't save that photo. Please try again, or paste a reference link below instead.",
      },
      { status: 502 },
    );
  }
}
