# Checkout & Payments — Setup / Recovery Checklist

This file documents the two issues found on 2026-06-10 and exactly what's
needed to get orders + wallet payments (Apple Pay / Cash App Pay) working.

## ✅ Current state (2026-06-10)

The order → checkout → payment flow is now **verified working** against a
**local Postgres** database (Homebrew `postgresql@16`). `.env.local`
`DATABASE_URL` currently points at `localhost:5432/petalsbydar`. The original
Supabase pooler string is preserved (commented out) in `.env.local`.

- Local DB control:
  - start: `brew services start postgresql@16`
  - stop:  `brew services stop postgresql@16`
  - psql:  `/opt/homebrew/opt/postgresql@16/bin/psql -d petalsbydar`

**For production**, switch `DATABASE_URL` back to your Supabase project once
it's un-paused (see Issue 1). The Supabase project was **paused**, not deleted
— free-tier projects auto-pause after ~7 days idle. Restore it from the
dashboard; Pro tier ($25/mo) never auto-pauses (recommended for a live store).

---

## 🟢 Keep-alive (prevents future Supabase pauses)

A Vercel Cron job pings `/api/keep-alive` daily so the free-tier Supabase
project never sits idle long enough to auto-pause.

- `vercel.json` → `crons` runs `/api/keep-alive` at 12:00 UTC daily.
- `app/api/keep-alive/route.ts` runs `select 1` against the DB.
- Optional: set `CRON_SECRET` in Vercel env; Vercel sends it as a Bearer
  token so only the cron can call the route. (Without it, the route still
  works — it just isn't auth-gated.)

This only runs on Vercel (cron jobs don't fire locally). Verify after deploy:
Vercel → Project → Settings → Cron Jobs should list `/api/keep-alive`.

### Make sure Vercel points at Supabase
`petalsbydar.com` (on Vercel) uses its OWN env vars, not your laptop's
`.env.local`. Confirm in Vercel → Project → Settings → Environment Variables
that **`DATABASE_URL`** is the Supabase Transaction-pooler string (port 6543)
for the Production environment. Redeploy after any change.

---

## ⛔ Issue 1 — Orders fail / checkout never loads  (ROOT CAUSE: dead database)

**Symptom:** Placing an order does nothing / doesn't reach the payment page.
The payment page shows "couldn't load your order".

**Root cause (verified):** The Supabase project `otijxykmquvggmiqeqgj` is
unreachable. Its pooler rejects the tenant
(`(ENOTFOUND) tenant/user postgres.otijxykmquvggmiqeqgj not found`) and the
direct host `db.otijxykmquvggmiqeqgj.supabase.co` no longer resolves in DNS —
the classic signature of a **paused or deleted** free-tier Supabase project.

Every step of the flow depends on this DB, so it breaks all of:
`POST /api/orders` → `GET /api/orders/[id]` → `POST /api/payments`.

### Fix (you do this part)
1. Log in at https://supabase.com → open the project.
   - If **paused**: click **Restore / Resume**.
   - If **deleted**: create a new project and run the migrations (below).
2. Copy the **Transaction pooler** connection string (port **6543**) from
   Project → Settings → Database → Connection string → "Transaction pooler".
3. Update `DATABASE_URL` in `.env.local` with the new string. Make sure any
   special characters in the password are URL-encoded (e.g. `!` → `%21`).
4. If it's a fresh project, create the tables:
   ```bash
   pnpm db:migrate
   ```
5. Restart the dev server and confirm an order saves:
   ```bash
   curl -s -X POST http://localhost:3001/api/orders \
     -H 'content-type: application/json' \
     -d '{"bouquetType":"occasion","customerName":"Test","phone":"+15555550123","email":"t@e.com","paymentType":"deposit"}'
   # Expect: {"id":"<uuid>"}   (NOT a 500/503)
   ```

> Code hardening already done: all three API routes now return a clear JSON
> error (503) instead of a silent 500 if the DB is ever down again, so
> customers see an actionable message instead of a dead end.

---

## 🍎 Issue 2 — Apple Pay & Cash App Pay don't show up

**Two things to know first:**

- **Wallet buttons only render over HTTPS.** They will *never* appear on
  `http://localhost`. Test on the live HTTPS domain (or an HTTPS tunnel).
- Apple Pay additionally **only renders in Safari on Apple devices**, and only
  after the domain is verified (below). Chrome/Firefox will never show it.

### 2a. Apple Pay domain verification  (ROOT CAUSE: file returned 404)

The route `/.well-known/apple-developer-merchantid-domain-association` was
returning **404** because the `APPLE_PAY_DOMAIN_ASSOCIATION` env var is unset.
Apple fetches that URL to verify you own the domain; a 404 means verification
fails and the button never appears.

**Fix:**
1. Square Developer Dashboard → your app → **Apple Pay** tab.
2. Register your production domain (e.g. `petalsbydar.com`).
3. Square gives you a **domain association file**. Open it, copy its full
   contents (one long string).
4. Paste it into your environment as `APPLE_PAY_DOMAIN_ASSOCIATION`:
   - **Vercel:** Project → Settings → Environment Variables → add
     `APPLE_PAY_DOMAIN_ASSOCIATION` = (file contents), for Production.
   - **Local test:** add the same line to `.env.local`.
5. Deploy, then verify the URL serves the file (HTTP 200, exact contents):
   ```bash
   curl -i https://YOUR-DOMAIN/.well-known/apple-developer-merchantid-domain-association
   ```
6. Back in Square's Apple Pay tab, confirm the domain shows **Verified**.

> Code already fixed: the route now trims the value, serves it with the right
> content-type, and logs a clear error if the env var is missing.

### 2b. Cash App Pay

Cash App Pay does **not** need the `.well-known` file. If it's missing in
production, check (in browser DevTools console on the live HTTPS site):
- Is the page HTTPS? (required)
- Any `[PaymentForm] Cash App Pay init/attach failed:` error logged? The code
  logs the exact reason instead of silently hiding the button.
- Cash App Pay must be enabled for your Square account/location.

---

## Quick smoke test once the DB is back (full flow)

1. `http://localhost:3001/order` → pick a bouquet → fill details → Continue.
   - You should land on `/order/payment?orderId=…` (no error).
2. On the live HTTPS domain, in **Safari on an Apple device**, the Apple Pay
   button should appear once the domain is Verified in Square.
3. Card payment works on any browser (incl. localhost) once the DB is up.
