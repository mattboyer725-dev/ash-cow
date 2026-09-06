# ASH COW

A 24-hour digital-product launch kit. Forge a named file, list it tonight, sell it in a day.

**Shop** is the public stall. **Till** holds your Gumroad / PayPal / Stripe link and the ten people you will message. **Go live** starts the 24-hour clock, copies the sales URL, and keeps the due hour on the operator page. It will not post, charge a card, or log a sale you did not make.

## Earn in a day

1. Open **Till**. Paste the public product URL where you already take money.
2. Paste ten emails of people who already trust you.
3. **Go live** on a stall (Ash Cow is $29 and ready).
4. Use **Post on X** and **Open emails** for the due hour. Log the barn when money actually hits.

Optional env on Vercel: `VITE_PAY_URL` so buyers on other devices still get a working Buy button.

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
