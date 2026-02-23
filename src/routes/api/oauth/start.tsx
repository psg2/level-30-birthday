import { createFileRoute } from '@tanstack/react-router'

async function handleGet(ctx: { request: Request }): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return Response.json({ error: 'GOOGLE_CLIENT_ID not set' }, { status: 500 })
  }

  const url = new URL(ctx.request.url)
  const redirectUri = `${url.origin}/api/oauth/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  })

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    302,
  )
}

export const Route = createFileRoute('/api/oauth/start')({
  server: {
    handlers: {
      GET: handleGet,
    },
  },
})
