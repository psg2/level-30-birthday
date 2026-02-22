# 🎭 Level 30 — Pedro Sereno

Birthday party invitation landing page. Theater meets arcade.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Motion (Framer Motion)
- Upstash Redis (RSVP storage)
- Vercel Serverless Functions

## Deploy to Vercel

### 1. Import on Vercel

Go to [vercel.com/new](https://vercel.com/new) → Import `psg2/level-30-birthday`

### 2. Set up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → Create a **Redis** database (free tier)
2. Copy the **REST URL** and **REST Token**
3. In Vercel → Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `https://your-db.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `AXxxxxxxxxxxxx...` |
| `ADMIN_KEY` | Any secret string you choose (e.g. `minha-chave-secreta-123`) |

> **Tip:** You can also add Upstash directly from the [Vercel Marketplace](https://vercel.com/marketplace?search=upstash) — it auto-fills the env vars.

### 3. Redeploy

After adding env vars, trigger a redeploy from Vercel dashboard.

## Checking RSVPs

To see who confirmed:

```
https://your-site.vercel.app/api/rsvp?key=YOUR_ADMIN_KEY
```

Returns JSON:
```json
{
  "count": 5,
  "guests": [
    { "name": "Maria", "message": "Parabéns! 🎉", "timestamp": "2026-03-01T..." },
    { "name": "João", "message": "", "timestamp": "2026-02-28T..." }
  ]
}
```

## Local Development

```bash
npm install
npm run dev
```

> RSVP form won't work locally unless you create a `.env` file with the Upstash vars.
