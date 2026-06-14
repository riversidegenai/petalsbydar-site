import { AwsClient } from "aws4fetch";

// Cloudflare R2 object storage (S3-compatible) for customer inspiration uploads.
// R2 is zero-egress, so the florist viewing these photos repeatedly doesn't
// rack up bandwidth cost. We talk to R2 via its S3 API using aws4fetch (a tiny
// request-signer) rather than the heavy @aws-sdk, which keeps the serverless
// bundle small.
//
// Required env (all server-side secrets except the public base URL):
//   R2_ACCOUNT_ID         — Cloudflare account id (from the R2 dashboard)
//   R2_ACCESS_KEY_ID      — R2 API token access key
//   R2_SECRET_ACCESS_KEY  — R2 API token secret
//   R2_BUCKET             — bucket name, e.g. "petalsbydar-inspiration"
//   R2_PUBLIC_BASE_URL    — public read URL for the bucket, e.g.
//                           https://media.petalsbydar.com  (custom domain) or
//                           the r2.dev public bucket URL. Used to build the
//                           link the florist clicks to view the photo.

function cfg() {
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  };
}

/** True only when every piece needed to store AND serve a file is present. */
export function isR2Configured(): boolean {
  const c = cfg();
  return Boolean(
    c.accountId &&
      c.accessKeyId &&
      c.secretAccessKey &&
      c.bucket &&
      c.publicBaseUrl,
  );
}

/**
 * Upload bytes to R2 under `key` and return the public URL to view it.
 * Throws if R2 isn't configured (callers should check isR2Configured first to
 * give a friendly fallback) or if R2 rejects the request.
 */
export async function uploadToR2(
  key: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const c = cfg();
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }

  const client = new AwsClient({
    accessKeyId: c.accessKeyId!,
    secretAccessKey: c.secretAccessKey!,
    service: "s3",
    region: "auto", // R2 uses the "auto" region
  });

  const endpoint = `https://${c.accountId}.r2.cloudflarestorage.com/${c.bucket}/${key}`;

  const res = await client.fetch(endpoint, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`R2 upload failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  // Public URL the florist uses to view the photo. Trim a trailing slash on the
  // base so we don't end up with a double slash.
  const base = c.publicBaseUrl!.replace(/\/+$/, "");
  return `${base}/${key}`;
}
