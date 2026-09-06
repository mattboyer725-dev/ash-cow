# ASH COW

A 24-hour digital-product launch kit. Forge a named file, list it tonight, sell it in a day.

**Shop** is the public stall. **Live** starts the 24-hour clock the first time you open it, shows the due hour, and posts/emails for that hour. Stripe Checkout is the till. Paid sessions sync into the barn every 30 seconds — no extra button.


## Earn in a day

1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. Open **Live**. The clock starts.
3. Do the hour on screen (post or email).
4. Stripe Checkout on **Shop** is the till. Paid sessions appear in the barn on their own.


Optional env on Vercel:

```
VITE_AUTH_ENABLED=false
VITE_PAY_URL=                # fallback if Stripe is off
STRIPE_SECRET_KEY=sk_live_…  # server only
STRIPE_WEBHOOK_SECRET=whsec_…
```

Webhook URL: `https://<your-domain>/api/stripe/webhook`

Listen locally:

```bash
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

Dashboard: add `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Unsigned requests return 400. Live and the stall barn pull paid sessions every 30 seconds.



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
