import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'

const getRedis = () =>
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

const getResend = () => new Resend(process.env.RESEND_API_KEY)

const RSVP_IDS_KEY = 'birthday:rsvp_ids'
const RATE_LIMIT_MAX = 5 // max submissions per window
const RATE_LIMIT_WINDOW = 3600 // 1 hour in seconds

function getClientIp(): string {
  try {
    const forwarded = getRequestHeader('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0]!.trim()
    const realIp = getRequestHeader('x-real-ip')
    if (realIp) return realIp
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

async function checkRateLimit(redis: Redis): Promise<boolean> {
  const ip = getClientIp()
  if (ip === 'unknown') return true // allow if can't determine IP (dev mode)
  const key = `birthday:ratelimit:${ip}`
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW)
  }
  return current <= RATE_LIMIT_MAX
}

export interface PlusOne {
  name: string
  email: string
}

export interface RsvpEntry {
  id: string
  name: string
  email: string
  message: string
  foodRestrictions: string
  plusOnes: PlusOne[]
  status: 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface PlusOnePublic {
  name: string
  email: string // masked
}

export interface RsvpPublic {
  id: string
  name: string
  email: string // masked
  message: string
  foodRestrictions: string
  plusOnes: PlusOnePublic[]
  status: 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

function generateId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function maskEmail(email: string): string {
  return email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
}

function buildConfirmationEmail(entry: RsvpEntry, siteUrl: string): string {
  const rsvpUrl = `${siteUrl}/rsvp/${entry.id}`
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;padding:32px 0;border-bottom:1px solid #D4A84340;">
      <div style="font-size:48px;margin-bottom:8px;">🎭</div>
      <h1 style="color:#D4A843;font-size:32px;font-style:italic;margin:0;">Level 30</h1>
      <p style="color:#F5E6D380;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:8px 0 0;">Pedro Sereno</p>
    </div>
    <div style="padding:32px 0;text-align:center;">
      <p style="color:#F5E6D3;font-size:18px;font-style:italic;margin:0 0 8px;">Presença confirmada!</p>
      <p style="color:#F5E6D380;font-size:14px;margin:0 0 24px;">
        Valeu, <span style="color:#D4A843;">${entry.name}</span>! Você tá na lista. 🎉
      </p>
      <div style="background:#1A1A1A;border:1px solid #D4A84320;padding:20px;margin:24px 0;">
        <p style="color:#00F5D4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;font-family:monospace;">Detalhes do Evento</p>
        <p style="color:#F5E6D3;font-size:16px;font-style:italic;margin:0 0 4px;">Sábado, 14 de Março de 2026</p>
        <p style="color:#F5E6D360;font-size:13px;margin:0;">Mais detalhes em breve</p>
      </div>
      <p style="color:#F5E6D350;font-size:13px;margin:24px 0 16px;">Precisa mudar algo? Acesse seu convite:</p>
      <a href="${rsvpUrl}" style="display:inline-block;padding:12px 32px;border:2px solid #D4A843;color:#D4A843;text-decoration:none;font-size:14px;font-style:italic;font-weight:bold;letter-spacing:1px;">Meu Convite →</a>
    </div>
    <div style="border-top:1px solid #D4A84320;padding:24px 0 0;text-align:center;">
      <p style="color:#F5E6D315;font-size:11px;letter-spacing:2px;font-family:monospace;margin:0;">FEITO COM ♥ PARA AS MELHORES PESSOAS</p>
    </div>
  </div>
</body>
</html>`
}

function buildUpdateEmail(entry: RsvpEntry, siteUrl: string): string {
  const rsvpUrl = `${siteUrl}/rsvp/${entry.id}`
  const isConfirmed = entry.status === 'confirmed'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;padding:32px 0;border-bottom:1px solid #D4A84340;">
      <div style="font-size:48px;margin-bottom:8px;">🎭</div>
      <h1 style="color:#D4A843;font-size:32px;font-style:italic;margin:0;">Level 30</h1>
    </div>
    <div style="padding:32px 0;text-align:center;">
      <p style="color:#F5E6D3;font-size:18px;font-style:italic;margin:0 0 8px;">
        ${isConfirmed ? 'Presença re-confirmada! 🎉' : 'Resposta atualizada'}
      </p>
      <p style="color:#F5E6D380;font-size:14px;margin:0 0 24px;">
        ${isConfirmed ? `Boa, ${entry.name}! Você tá de volta na lista.` : `Que pena, ${entry.name}. Vamos sentir sua falta.`}
      </p>
      <p style="color:#F5E6D350;font-size:13px;margin:24px 0 16px;">Mudou de ideia? Sempre dá pra atualizar:</p>
      <a href="${rsvpUrl}" style="display:inline-block;padding:12px 32px;border:2px solid #D4A843;color:#D4A843;text-decoration:none;font-size:14px;font-style:italic;font-weight:bold;">Meu Convite →</a>
    </div>
    <div style="border-top:1px solid #D4A84320;padding:24px 0 0;text-align:center;">
      <p style="color:#F5E6D315;font-size:11px;letter-spacing:2px;font-family:monospace;margin:0;">FEITO COM ♥ PARA AS MELHORES PESSOAS</p>
    </div>
  </div>
</body>
</html>`
}

// ── Server Functions ────────────────────────────────────────────────────────

export const submitRsvp = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    name: string
    email: string
    message: string
    foodRestrictions?: string
    plusOnes?: PlusOne[]
    website?: string
  }) => data)
  .handler(async ({ data }) => {
    const redis = getRedis()
    const { name, email, message, foodRestrictions, plusOnes, website } = data

    // Honeypot check — bots fill this invisible field; silently fake success
    if (website) {
      return { success: true, duplicate: false, id: 'ok' } as const
    }

    // Rate limiting
    const allowed = await checkRateLimit(redis)
    if (!allowed) throw new Error('Muitas tentativas. Tente novamente em breve.')

    if (!name || name.trim().length === 0) throw new Error('Nome é obrigatório')
    if (!email || !email.includes('@')) throw new Error('E-mail inválido')

    const emailKey = email.trim().toLowerCase()
    const existingId = await redis.get<string>(`birthday:email:${emailKey}`)
    if (existingId) {
      return { success: false, duplicate: true, existingId } as const
    }

    const id = generateId()
    const now = new Date().toISOString()

    // Clean plus ones — filter out empty entries
    const cleanPlusOnes: PlusOne[] = (plusOnes || [])
      .filter((p) => p.name.trim().length > 0)
      .slice(0, 3)
      .map((p) => ({ name: p.name.trim(), email: p.email.trim().toLowerCase() }))

    const entry: RsvpEntry = {
      id,
      name: name.trim(),
      email: emailKey,
      message: (message || '').trim(),
      foodRestrictions: (foodRestrictions || '').trim(),
      plusOnes: cleanPlusOnes,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    }

    await redis.set(`birthday:rsvp:${id}`, JSON.stringify(entry))
    await redis.set(`birthday:email:${emailKey}`, id)
    await redis.sadd(RSVP_IDS_KEY, id)

    const siteUrl = process.env.SITE_URL || 'https://level-30-birthday.vercel.app'
    try {
      const resend = getResend()
      await resend.emails.send({
        from: 'Level 30 <pedro@sereno.dev.br>',
        to: entry.email,
        subject: '🎭 Presença Confirmada — Level 30 do Pedro!',
        html: buildConfirmationEmail(entry, siteUrl),
      })
    } catch (e) {
      console.error('Email send error:', e)
    }

    return { success: true, duplicate: false, id: entry.id } as const
  })

export const getRsvp = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<RsvpPublic | null> => {
    const redis = getRedis()
    const raw = await redis.get<string>(`birthday:rsvp:${data.id}`)
    if (!raw) return null

    const entry: RsvpEntry = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      ...entry,
      email: maskEmail(entry.email),
      foodRestrictions: entry.foodRestrictions || '',
      plusOnes: (entry.plusOnes || []).map((p) => ({
        name: p.name,
        email: p.email ? maskEmail(p.email) : '',
      })),
    }
  })

export const updateRsvp = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string
      name?: string
      message?: string
      foodRestrictions?: string
      plusOnes?: PlusOne[]
      status?: 'confirmed' | 'cancelled'
    }) => data,
  )
  .handler(async ({ data }): Promise<RsvpPublic> => {
    const redis = getRedis()

    // Rate limiting on updates too
    const allowed = await checkRateLimit(redis)
    if (!allowed) throw new Error('Muitas tentativas. Tente novamente em breve.')

    const raw = await redis.get<string>(`birthday:rsvp:${data.id}`)
    if (!raw) throw new Error('RSVP não encontrado')

    const entry: RsvpEntry = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (data.name !== undefined) entry.name = data.name.trim()
    if (data.message !== undefined) entry.message = (data.message || '').trim()
    if (data.foodRestrictions !== undefined) entry.foodRestrictions = (data.foodRestrictions || '').trim()
    if (data.plusOnes !== undefined) {
      entry.plusOnes = data.plusOnes
        .filter((p) => p.name.trim().length > 0)
        .slice(0, 3)
        .map((p) => ({ name: p.name.trim(), email: p.email.trim().toLowerCase() }))
    }
    if (data.status !== undefined) entry.status = data.status
    entry.updatedAt = new Date().toISOString()

    await redis.set(`birthday:rsvp:${data.id}`, JSON.stringify(entry))

    const siteUrl = process.env.SITE_URL || 'https://level-30-birthday.vercel.app'
    try {
      const resend = getResend()
      await resend.emails.send({
        from: 'Level 30 <pedro@sereno.dev.br>',
        to: entry.email,
        subject:
          entry.status === 'confirmed'
            ? '🎭 Presença Re-confirmada — Level 30 do Pedro!'
            : '🎭 Resposta Atualizada — Level 30 do Pedro',
        html: buildUpdateEmail(entry, siteUrl),
      })
    } catch (e) {
      console.error('Email send error:', e)
    }

    return {
      ...entry,
      email: maskEmail(entry.email),
      foodRestrictions: entry.foodRestrictions || '',
      plusOnes: (entry.plusOnes || []).map((p) => ({
        name: p.name,
        email: p.email ? maskEmail(p.email) : '',
      })),
    }
  })

export const listRsvps = createServerFn({ method: 'GET' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const adminKey = process.env.ADMIN_KEY
    if (!adminKey || data.key !== adminKey) throw new Error('Não autorizado')

    const redis = getRedis()
    const ids = await redis.smembers(RSVP_IDS_KEY)
    const entries: RsvpEntry[] = []

    for (const id of ids) {
      const raw = await redis.get<string>(`birthday:rsvp:${id}`)
      if (raw) {
        entries.push(typeof raw === 'string' ? JSON.parse(raw) : raw)
      }
    }

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const confirmed = entries.filter((e) => e.status === 'confirmed')
    const cancelled = entries.filter((e) => e.status === 'cancelled')

    return { total: entries.length, confirmed: confirmed.length, cancelled: cancelled.length, guests: entries }
  })
