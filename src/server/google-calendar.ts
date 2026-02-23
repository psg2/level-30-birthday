// Google Calendar integration — adds/removes attendees from an existing event

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface Attendee {
  email: string
  displayName?: string
  responseStatus?: string
}

interface CalendarEvent {
  id: string
  attendees?: Attendee[]
  [key: string]: unknown
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth credentials not configured')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data: TokenResponse = await res.json()
  if (!data.access_token) {
    throw new Error('Failed to refresh Google access token')
  }

  return data.access_token
}

async function getEvent(accessToken: string, eventId: string): Promise<CalendarEvent> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to fetch event: ${err}`)
  }

  return res.json()
}

async function patchEvent(
  accessToken: string,
  eventId: string,
  attendees: Attendee[],
): Promise<CalendarEvent> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attendees }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to patch event: ${err}`)
  }

  return res.json()
}

/**
 * Add attendees to the existing Google Calendar event.
 * Skips duplicates (by email).
 */
export async function addAttendeesToEvent(
  emails: { email: string; displayName?: string }[],
): Promise<void> {
  const eventId = process.env.GOOGLE_CALENDAR_EVENT_ID
  if (!eventId) {
    console.warn('GOOGLE_CALENDAR_EVENT_ID not set — skipping calendar invite')
    return
  }

  try {
    const token = await getAccessToken()
    const event = await getEvent(token, eventId)
    const existing = event.attendees || []
    const existingEmails = new Set(existing.map((a) => a.email.toLowerCase()))

    const newAttendees = emails.filter((e) => !existingEmails.has(e.email.toLowerCase()))
    if (newAttendees.length === 0) return // already invited

    const updatedAttendees = [
      ...existing,
      ...newAttendees.map((e) => ({
        email: e.email,
        displayName: e.displayName,
        responseStatus: 'accepted' as const,
      })),
    ]

    await patchEvent(token, eventId, updatedAttendees)
    console.log(`Calendar: added ${newAttendees.length} attendee(s)`)
  } catch (err) {
    console.error('Google Calendar error (add):', err)
  }
}

/**
 * Remove attendees from the existing Google Calendar event (by email).
 */
export async function removeAttendeesFromEvent(emails: string[]): Promise<void> {
  const eventId = process.env.GOOGLE_CALENDAR_EVENT_ID
  if (!eventId) return

  try {
    const emailSet = new Set(emails.map((e) => e.toLowerCase()))
    const token = await getAccessToken()
    const event = await getEvent(token, eventId)
    const existing = event.attendees || []

    const updatedAttendees = existing.filter(
      (a) => !emailSet.has(a.email.toLowerCase()),
    )

    if (updatedAttendees.length === existing.length) return // nothing to remove

    await patchEvent(token, eventId, updatedAttendees)
    console.log(`Calendar: removed ${existing.length - updatedAttendees.length} attendee(s)`)
  } catch (err) {
    console.error('Google Calendar error (remove):', err)
  }
}
