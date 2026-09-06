# ASH COW

A 24-hour digital-product launch kit. Forge a named file, list it tonight, sell it in a day.

**Shop** is the public stall. **Live** starts the 24-hour clock the first time you open it, shows the due hour, and posts/emails for that hour. Stripe Checkout is the till. **Nango** syncs paid checkout sessions; this app reads the records cache instead of polling Stripe.



## Earn in a day

1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. In [Nango](https://app.nango.dev): Stripe integration `stripe`, connection `ash-cow`, enable the `checkout-sessions` sync (model `CheckoutSession`).
3. Set `NANGO_API_KEY` and `NANGO_WEBHOOK_SIGNING_KEY`. Point Nango webhooks at `https://<your-domain>/api/nango/webhook`.
4. Open **Live**. The clock starts. Nango kicks the sync; paid sessions land in the barn.



Optional env on Vercel:

```
VITE_AUTH_ENABLED=false
STRIPE_SECRET_KEY=sk_live_…           # server only — Checkout
STRIPE_WEBHOOK_SECRET=whsec_…
NANGO_API_KEY=                        # Environment API key
NANGO_WEBHOOK_SIGNING_KEY=            # Environment Settings → Webhooks
NANGO_INTEGRATION_ID=stripe
NANGO_CONNECTION_ID=ash-cow
```

Stripe webhook: `https://<your-domain>/api/stripe/webhook`  
Nango webhook: `https://<your-domain>/api/nango/webhook` (`X-Nango-Hmac-Sha256`)

Enable Stripe’s `checkout-sessions` sync in Nango. Live triggers it on open and reads `CheckoutSession` records. If Nango is down, the barn falls back to listing Stripe sessions.



## Stack

- TanStack Start + React + Tailwind
- Server function for optional Grok-enhanced forge copy (falls back to local generation)
- Client barn and till in localStorage — no accounts, no database

## Local

```bash
npm install
npm run dev
```

## Deploy

Import [mattboyer725-dev/ash-cow](https://github.com/mattboyer725-dev/ash-cow) on Vercel. Build: `npm run build`. Set `VITE_AUTH_ENABLED=false` and optionally `VITE_PAY_URL`.
