# 🎭 Level 30 — Pedro Sereno

Birthday party invitation landing page. Theater meets arcade.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Motion (Framer Motion)
- Upstash Redis (RSVP storage)
- Resend (confirmation emails)
- Vercel Serverless Functions

## Deploy to Vercel

### 1. Import on Vercel

Go to [vercel.com/new](https://vercel.com/new) → Import `psg2/level-30-birthday`

### 2. Set up Integrations

Add **Upstash Redis** from the [Vercel Marketplace](https://vercel.com/marketplace?search=upstash).
It auto-creates: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`.

### 3. Add Environment Variables

| Variable | Value |
|---|---|
| `ADMIN_KEY` | Any secret string (to view guest list) |
| `RESEND_API_KEY` | Your key from [resend.com](https://resend.com) |
| `SITE_URL` | Your deployed URL (e.g. `https://level-30-birthday.vercel.app`) |

### 4. Redeploy

After adding env vars, trigger a redeploy from Vercel dashboard.

## Features

### RSVP Flow
1. Guest clicks "Eu Vou!" → fills name, email, optional message
2. Data stored in Upstash Redis
3. Confirmation email sent via Resend with a personal link
4. Guest can access `/rsvp/{id}` to edit their response or cancel

### Duplicate Prevention
If the same email tries to RSVP twice, they're redirected to their existing invite page.

### Checking RSVPs (Admin)

```
GET https://your-site.vercel.app/api/rsvp?key=YOUR_ADMIN_KEY
```

Returns:
```json
{
  "total": 10,
  "confirmed": 8,
  "cancelled": 2,
  "guests": [
    { "id": "abc123", "name": "Maria", "email": "m@x.com", "message": "Parabéns!", "status": "confirmed", ... }
  ]
}
```

## Local Development

```bash
npm install
npm run dev
```

> API routes require env vars. Create a `.env` file or use `vercel env pull`.
