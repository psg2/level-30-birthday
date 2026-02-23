import { defineEventHandler, getQuery } from 'vinxi/http'
import { Redis } from '@upstash/redis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = (query.key as string) || ''
  const adminKey = process.env.ADMIN_KEY

  if (!adminKey || key !== adminKey) {
    return { error: 'Não autorizado' }
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const RSVP_IDS_KEY = 'birthday:rsvp_ids'
  const ids = await redis.smembers(RSVP_IDS_KEY)

  const entries = []
  for (const id of ids) {
    const raw = await redis.get<string>(`birthday:rsvp:${id}`)
    if (raw) {
      entries.push(typeof raw === 'string' ? JSON.parse(raw) : raw)
    }
  }

  entries.sort(
    (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const confirmed = entries.filter((e: { status: string }) => e.status === 'confirmed')
  const cancelled = entries.filter((e: { status: string }) => e.status === 'cancelled')

  return {
    total: entries.length,
    confirmed: confirmed.length,
    cancelled: cancelled.length,
    guests: entries,
  }
})
