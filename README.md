# Petals by Dar

Custom bouquet studio website. Marketing site + 3-step deposit checkout (Stripe) with email + SMS notifications and a stored order log.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Stripe Checkout (Apple Pay / Google Pay / card / Cash App)
- Postgres via Drizzle ORM
- Resend (email), Twilio (SMS)
- Vercel Blob (inspiration uploads)
- Deploys on Vercel

## Local setup

1. `pnpm install`
2. `cp .env.local.example .env.local` and fill in values (see below for what each one does).
3. Run the schema migration: `pnpm db:migrate` (needs `DATABASE_URL` set).
4. Start the dev server: `pnpm dev` → http://localhost:3000.

The site renders without any env vars set — it just won't be able to save orders or run a real checkout. Stripe / DB / email / SMS are all optional for the marketing pages.

## Env vars

| Variable | What it's for |
| -------- | -------------- |
| `NEXT_PUBLIC_SITE_URL` | Used to build Stripe success/cancel URLs. Set to your live domain. |
| `DATABASE_URL` | Postgres connection string (Vercel Postgres / Neon / Supabase). |
| `STRIPE_SECRET_KEY` | Stripe server key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (reserved for future client-side use). |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` (local) or the dashboard endpoint (prod). |
| `RESEND_API_KEY` | Resend API key for sending email. |
| `OWNER_NOTIFICATION_EMAIL` | Email that receives "New deposit" notifications. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio credentials. |
| `TWILIO_FROM_NUMBER` | Verified Twilio phone number to send from. |
| `OWNER_SMS_NUMBER` | Phone number to text when a deposit lands. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for inspiration uploads. |
| `ADMIN_PASSWORD` | Basic-auth password for `/admin`. |

## Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any zip.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel — accept the Next.js defaults.
3. In the project's **Environment Variables** tab, add every value from `.env.local.example`.
4. Provision Vercel Postgres + Vercel Blob from the **Storage** tab. Drag the auto-generated env vars into the project.
5. Run `pnpm db:migrate` once locally with the production `DATABASE_URL`, or trigger it via a Vercel CLI command.
6. In the Stripe dashboard, add a webhook endpoint pointing to `https://<your-vercel-domain>/api/webhooks/stripe` and copy its `whsec_…` into the Vercel env vars.
7. Visit your site at `https://<project>.vercel.app`.

## Adding a custom domain

1. Buy the domain (e.g. petalsbydar.com).
2. In Vercel → **Domains**, add the domain to the project; Vercel will show DNS records.
3. At your registrar, add the records Vercel asks for (an A or CNAME, plus an `www`).
4. Once DNS resolves, update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://petalsbydar.com`.
5. Update the Stripe webhook URL to the new domain and update `STRIPE_WEBHOOK_SECRET` if a new one is issued.

## Project layout

```
app/                      Next.js App Router pages + API routes
components/               UI components (Hero, Bouquets, Gallery, …)
components/order/         Order flow components (Stepper, DetailsForm, …)
lib/                      DB, Stripe, email, SMS, bouquet definitions
public/gallery/           Bouquet photos shown in the marketing site
drizzle/                  Generated SQL migrations
scripts/migrate.ts        One-shot migrator
```

## What's intentionally simple (for now)

- Pickup scheduling shows the next 7 days from today; no admin calendar yet.
- `/admin` is a Basic-auth protected list — username can be anything, password is `ADMIN_PASSWORD`.
- Refunds happen in the Stripe dashboard, not in the UI.
