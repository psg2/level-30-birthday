import { defineEventHandler, getQuery } from 'vinxi/http'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    return { error: 'No authorization code received', query }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return { error: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set' }
  }

  const host = event.node.req.headers.host || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const redirectUri = `${protocol}://${host}/api/oauth/callback`

  // Exchange authorization code for tokens
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
    return { error: 'Token exchange failed', details: tokens }
  }

  // Display the refresh token in a styled page so it's easy to copy
  const refreshToken = tokens.refresh_token || 'NOT RETURNED — you may have already authorized. Revoke access at https://myaccount.google.com/permissions and try again.'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>OAuth Complete</title></head>
<body style="margin:0;padding:40px;background:#0A0A0A;color:#F5E6D3;font-family:monospace;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#D4A843;font-style:italic;font-family:Georgia,serif;">🎭 Level 30 — OAuth Complete</h1>
    <p style="color:#00F5D4;">✓ Authorization successful!</p>

    <div style="margin:24px 0;">
      <p style="color:#D4A843;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Refresh Token</p>
      <textarea readonly style="width:100%;height:80px;background:#1A1A1A;border:1px solid #D4A84340;color:#00F5D4;padding:12px;font-family:monospace;font-size:12px;resize:none;"
        onclick="this.select()">${refreshToken}</textarea>
      <p style="color:#F5E6D360;font-size:12px;margin-top:8px;">
        Copy this value and add it to your <code>.env</code> file as:<br>
        <code style="color:#D4A843;">GOOGLE_REFRESH_TOKEN=${refreshToken.length < 100 ? refreshToken : refreshToken.substring(0, 20) + '...'}</code>
      </p>
    </div>

    <div style="margin:24px 0;">
      <p style="color:#D4A843;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Access Token (expires in ${tokens.expires_in}s)</p>
      <textarea readonly style="width:100%;height:60px;background:#1A1A1A;border:1px solid #D4A84340;color:#F5E6D360;padding:12px;font-family:monospace;font-size:11px;resize:none;"
        onclick="this.select()">${tokens.access_token || 'N/A'}</textarea>
    </div>

    <div style="margin:24px 0;padding:16px;background:#1A1A1A;border:1px solid #D4A84320;">
      <p style="color:#D4A843;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Next Steps</p>
      <ol style="color:#F5E6D380;font-size:13px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Copy the refresh token above</li>
        <li>Add <code style="color:#D4A843;">GOOGLE_REFRESH_TOKEN=...</code> to your <code>.env</code></li>
        <li>Add <code style="color:#D4A843;">GOOGLE_CALENDAR_EVENT_ID=...</code> (from your existing event)</li>
        <li>Restart the dev server</li>
        <li>You can delete this OAuth route after — it's only needed once</li>
      </ol>
    </div>
  </div>
</body>
</html>`
})
