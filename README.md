# ASH COW

A 24-hour digital-product launch kit. Forge a named file, list it tonight, sell it in a day.

**Barn** logs sales you actually made. **Forge** builds the kit (sales page, listing, posts, delivery doc, 24-hour clock). **Truth** shows the play-money ledger next to a printed “$500 → $100k” curve so you can tell them apart.

## Stack

- TanStack Start + React + Tailwind
- Server function for optional Grok-enhanced forge copy (falls back to local generation)
- Client barn in localStorage — no accounts, no database

## Local

```bash
npm install
npm run dev
```

Preview production output:

```bash
npm run build
npm run preview
```

## Deploy

Vercel, Nitro `vercel` preset. Set `VITE_AUTH_ENABLED=false` in the project env if you want the same auth-off barn as this repo.
