import { createFileRoute } from '@tanstack/react-router'

async function handleGet(ctx: { request: Request }): Promise<Response> {
  const url = new URL(ctx.request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return Response.json({ error: 'No authorization code received' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return Response.json({ error: 'Google OAuth credentials not set' }, { status: 500 })
  }

  const redirectUri = `${url.origin}/api/oauth/callback`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (tokens.error) {
    return Response.json({ error: 'Token exchange failed', details: tokens }, { status: 400 })
  }

  const refreshToken = tokens.refresh_token || 'NOT RETURNED — revoke access at https://myaccount.google.com/permissions and try again.'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>OAuth Complete</title></head>
<body style="margin:0;padding:40px;background:#0A0A0A;color:#F5E6D3;font-family:monospace;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#D4A843;font-style:italic;font-family:Georgia,serif;">🎭 Level 30 — OAuth Complete</h1>
    <p style="color:#00F5D4;">✓ Authorization successful!</p>

    <div style="margin:24px 0;">
      <p style="color:#D4A843;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Refresh Token</p>
      <textarea readonly style="width:100%;height:80px;background:#1A1A1A;border:1px solid #D4A84340;color:#00F5D4;padding:12px;font-family:monospace;font-size:12px;resize:none;box-sizing:border-box;"
        onclick="this.select()">${refreshToken}</textarea>
      <p style="color:#F5E6D360;font-size:12px;margin-top:8px;">
        Copy this and add to your <code>.env</code> as:<br>
        <code style="color:#D4A843;">GOOGLE_REFRESH_TOKEN=...</code>
      </p>
    </div>

    <div style="margin:24px 0;padding:16px;background:#1A1A1A;border:1px solid #D4A84320;">
      <p style="color:#D4A843;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Next Steps</p>
      <ol style="color:#F5E6D380;font-size:13px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Copy the refresh token above</li>
        <li>Add <code style="color:#D4A843;">GOOGLE_REFRESH_TOKEN=...</code> to your <code>.env</code></li>
        <li>Add <code style="color:#D4A843;">GOOGLE_CALENDAR_EVENT_ID=...</code> from your existing event</li>
        <li>Restart the dev server</li>
      </ol>
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export const Route = createFileRoute('/api/oauth/callback')({
  server: {
    handlers: {
      GET: handleGet,
    },
  },
})
