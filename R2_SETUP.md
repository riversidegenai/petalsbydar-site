# Cloudflare R2 setup — inspiration photo uploads

Customer inspiration photos are stored in **Cloudflare R2** (zero-egress object
storage). Until R2 is configured, the upload box degrades gracefully: customers
are told to paste a reference link instead, and ordering still works.

## What you'll end up with
- A private R2 bucket that *stores* uploaded photos.
- An API token the website uses to *write* photos to the bucket.
- A public read URL so the **florist can view** each photo (and so the photo can
  be shown in the order/admin view).

## Steps (in the Cloudflare dashboard)

1. **Create the bucket**
   - Cloudflare dashboard → **R2** → **Create bucket**.
   - Name it `petalsbydar-inspiration` (or anything; match `R2_BUCKET`).
   - Region: Automatic.

2. **Enable public access** (so the florist can view photos)
   - Open the bucket → **Settings** → **Public access**.
   - Easiest: enable the **r2.dev** public URL. Cloudflare gives you a URL like
     `https://pub-xxxxxxxxxxxx.r2.dev` — copy it; that's `R2_PUBLIC_BASE_URL`.
   - Nicer (optional): attach a **custom domain** like
     `media.petalsbydar.com`. If you do, also add that hostname to the CSP
     `img-src` and `remotePatterns` in `next.config.ts`.

3. **Create an API token**
   - R2 → **Manage R2 API Tokens** → **Create API token**.
   - Permission: **Object Read & Write**.
   - Scope it to the one bucket if offered.
   - It shows you an **Access Key ID** and **Secret Access Key** ONCE — copy both.

4. **Find your Account ID**
   - On the R2 overview page (right sidebar / URL). That's `R2_ACCOUNT_ID`.

5. **Set the env vars** — locally in `.env.local`, and in Vercel
   (Settings → Environment Variables, Production):
   ```
   R2_ACCOUNT_ID=<account id>
   R2_ACCESS_KEY_ID=<access key id>
   R2_SECRET_ACCESS_KEY=<secret access key>
   R2_BUCKET=petalsbydar-inspiration
   R2_PUBLIC_BASE_URL=https://pub-xxxxxxxxxxxx.r2.dev   # or your custom domain
   ```

6. **Redeploy** (Vercel) and restart the local dev server. Done — uploads now
   land in R2 and return a public URL.

## How to verify
- Locally: place an order with a photo; it should upload without error and the
  filename appears in the list.
- The saved URL (in the order's `inspirationUrls`) should open the image in a
  browser — that's the link the florist uses to view it.

## Notes
- R2 is **zero-egress**: you pay to store, not per view. Good for a florist who
  reviews inspiration photos repeatedly.
- `BLOB_READ_WRITE_TOKEN` (old Vercel Blob) is no longer used and can be removed.
- The bucket must have public read enabled, or the florist's link will 401.
