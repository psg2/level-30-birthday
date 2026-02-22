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

Add **Upstash Redis** from the [Vercel Marketplace](https://vercel.com/marketplace?search=upstash).
It auto-creates these env vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL`.

Then manually add one more:

| Variable | Value |
|---|---|
| `ADMIN_KEY` | Any secret string you choose (e.g. `minha-chave-secreta-123`) |

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
