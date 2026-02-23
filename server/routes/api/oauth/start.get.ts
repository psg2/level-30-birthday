import { defineEventHandler, sendRedirect } from 'vinxi/http'

export default defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return { error: 'GOOGLE_CLIENT_ID not set' }
  }

  // Build the redirect URI from the current request
  const host = event.node.req.headers.host || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const redirectUri = `${protocol}://${host}/api/oauth/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent', // force consent to get refresh_token
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  return sendRedirect(event, url)
})
