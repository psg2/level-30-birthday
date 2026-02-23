import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const RSVP_IDS_KEY = 'birthday:rsvp_ids';
const SITE_URL = process.env.SITE_URL || 'https://level-30-birthday.vercel.app';

export interface RsvpEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function buildConfirmationEmail(entry: RsvpEntry): string {
  const rsvpUrl = `${SITE_URL}/rsvp/${entry.id}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 0;border-bottom:1px solid #D4A84340;">
      <div style="font-size:48px;margin-bottom:8px;">🎭</div>
      <h1 style="color:#D4A843;font-size:32px;font-style:italic;margin:0;">Level 30</h1>
      <p style="color:#F5E6D380;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:8px 0 0;">
        Pedro Sereno
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px 0;text-align:center;">
      <p style="color:#F5E6D3;font-size:18px;font-style:italic;margin:0 0 8px;">
        Presença confirmada!
      </p>
      <p style="color:#F5E6D380;font-size:14px;margin:0 0 24px;">
        Valeu, <span style="color:#D4A843;">${entry.name}</span>! Você tá na lista. 🎉
      </p>

      <div style="background:#1A1A1A;border:1px solid #D4A84320;padding:20px;margin:24px 0;">
        <p style="color:#00F5D4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;font-family:monospace;">
          Detalhes do Evento
        </p>
        <p style="color:#F5E6D3;font-size:16px;font-style:italic;margin:0 0 4px;">
          Sábado, 14 de Março de 2026
        </p>
        <p style="color:#F5E6D360;font-size:13px;margin:0;">
          Mais detalhes em breve
        </p>
      </div>

      <p style="color:#F5E6D350;font-size:13px;margin:24px 0 16px;">
        Precisa mudar algo? Acesse seu convite:
      </p>
      <a href="${rsvpUrl}"
        style="display:inline-block;padding:12px 32px;border:2px solid #D4A843;color:#D4A843;
        text-decoration:none;font-size:14px;font-style:italic;font-weight:bold;letter-spacing:1px;">
        Meu Convite →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #D4A84320;padding:24px 0 0;text-align:center;">
      <p style="color:#F5E6D315;font-size:11px;letter-spacing:2px;font-family:monospace;margin:0;">
        FEITO COM ♥ PARA AS MELHORES PESSOAS
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // POST — Create new RSVP
    if (req.method === 'POST') {
      const { name, email, message } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'E-mail inválido' });
      }

      // Check if email already has an RSVP
      const existingId = await redis.get<string>(`birthday:email:${email.trim().toLowerCase()}`);
      if (existingId) {
        return res.status(409).json({
          error: 'Este e-mail já confirmou presença',
          existingId,
        });
      }

      const id = generateId();
      const now = new Date().toISOString();

      const entry: RsvpEntry = {
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: (message || '').trim(),
        status: 'confirmed',
        createdAt: now,
        updatedAt: now,
      };

      // Store in Redis
      await redis.set(`birthday:rsvp:${id}`, JSON.stringify(entry));
      await redis.set(`birthday:email:${email.trim().toLowerCase()}`, id);
      await redis.sadd(RSVP_IDS_KEY, id);

      // Send confirmation email
      try {
        await resend.emails.send({
          from: 'Level 30 <onboarding@resend.dev>',
          to: entry.email,
          subject: '🎭 Presença Confirmada — Level 30 do Pedro!',
          html: buildConfirmationEmail(entry),
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
        // Don't fail the RSVP if email fails
      }

      return res.status(201).json({ success: true, id: entry.id });
    }

    // GET — Admin list all RSVPs
    if (req.method === 'GET') {
      const adminKey = process.env.ADMIN_KEY;
      const providedKey = req.query.key;

      if (!adminKey || providedKey !== adminKey) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const ids = await redis.smembers(RSVP_IDS_KEY);
      const entries: RsvpEntry[] = [];

      for (const id of ids) {
        const raw = await redis.get<string>(`birthday:rsvp:${id}`);
        if (raw) {
          const entry = typeof raw === 'string' ? JSON.parse(raw) : raw;
          entries.push(entry);
        }
      }

      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const confirmed = entries.filter((e) => e.status === 'confirmed');
      const cancelled = entries.filter((e) => e.status === 'cancelled');

      return res.status(200).json({
        total: entries.length,
        confirmed: confirmed.length,
        cancelled: cancelled.length,
        guests: entries,
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
