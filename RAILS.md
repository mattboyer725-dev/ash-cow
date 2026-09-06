# Vercel rails — ash-cow

Git remote: `https://github.com/mattboyer725-dev/ash-cow.git`  
Team: `mattboyer725-4868s-projects` (`team_hmdMyBfWSwV5QTQ9S7fS6okN`)  
No Vercel project is linked yet (no `.vercel/project.json`; no `ash-cow` project on the team).

Framework: TanStack Start + Nitro (`preset: "vercel"` in `vite.config.ts`).  
`vercel.json` sets `framework: "tanstack-start"`. Keep `buildCommand: "npm run build"` so `vite build` **and** `db:migrate` run on every deploy.

## Webhook URLs

Replace `<your-domain>` with the production host (or a preview host if you wire preview webhooks).

| Provider | Method | URL | Signature header |
| --- | --- | --- | --- |
| Stripe | `POST` | `https://<your-domain>/api/stripe/webhook` | `Stripe-Signature` |
| Nango | `POST` | `https://<your-domain>/api/nango/webhook` | `X-Nango-Hmac-Sha256` |

Probe: `GET https://<your-domain>/api/health` (reports checkout / webhook / nango flags, never secrets).

Paid file URLs after a sale: `https://<your-domain>/d/<token>` and `https://<your-domain>/api/download/<token>`.

## Environment variables (Vercel → Settings → Environment Variables)

Do **not** prefix server secrets with `VITE_`. `VITE_*` is inlined into the browser bundle.

### Required for the till (Production + Preview)

| Name | Where it lives | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | server | Checkout. Empty → `/api/health` `checkout: false`. |
| `STRIPE_WEBHOOK_SECRET` | server | Stripe dashboard webhook signing secret. |
| `NANGO_API_KEY` | server | Nango environment API key. Alias: `NANGO_SECRET_KEY`. |
| `NANGO_WEBHOOK_SIGNING_KEY` | server | Nango Environment Settings → Webhooks. |

### Nango connection (defaults match this repo)

| Name | Default |
| --- | --- |
| `NANGO_INTEGRATION_ID` | `stripe` |
| `NANGO_CONNECTION_ID` | `ash-cow` |
| `NANGO_SYNC_NAME` | `checkout-sessions` |
| `NANGO_MODEL` | `CheckoutSession` |
| `NANGO_SYNC_FREQUENCY` | `every hour` |
| `NANGO_HOST` | unset (Nango cloud) |

In Nango: Stripe integration `stripe`, connection `ash-cow`, enable the `checkout-sessions` sync (model `CheckoutSession`). Point Nango webhooks at the URL above.

### Persistence / operator

| Name | Notes |
| --- | --- |
| `DATABASE_URL` | Neon Postgres when deployed. Empty → PGLite (preview / local). `npm run build` migrates this URL. |
| `PUBLIC_ORIGIN` | Canonical public origin for webhook URLs and Stripe `success_url`. Empty → request `Origin` / Host. |
| `OPERATOR_SECRET` | Locks kick / inspect / ingest. Leave empty in preview. |
| `XAI_API_KEY` | Optional. Forge copy falls back to local generation if unset. |

### Browser (`VITE_*`)

| Name | Value |
| --- | --- |
| `VITE_AUTH_ENABLED` | `false` (this kit has no accounts) |
| `VITE_PAY_URL` | Optional Gumroad/PayPal fallback if Stripe is off |

Do not invent keys. Paste real values only in the Vercel dashboard. Never commit a `.env` with secrets.
