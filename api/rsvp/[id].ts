import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.SITE_URL || 'https://level-30-birthday.vercel.app';

interface RsvpEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

function buildUpdateEmail(entry: RsvpEntry): string {
  const rsvpUrl = `${SITE_URL}/rsvp/${entry.id}`;
  const isConfirmed = entry.status === 'confirmed';

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
        ${isConfirmed
          ? `Boa, ${entry.name}! Você tá de volta na lista.`
          : `Que pena, ${entry.name}. Vamos sentir sua falta.`
        }
      </p>

      <p style="color:#F5E6D350;font-size:13px;margin:24px 0 16px;">
        Mudou de ideia? Sempre dá pra atualizar:
      </p>
      <a href="${rsvpUrl}"
        style="display:inline-block;padding:12px 32px;border:2px solid #D4A843;color:#D4A843;
        text-decoration:none;font-size:14px;font-style:italic;font-weight:bold;">
        Meu Convite →
      </a>
    </div>

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const raw = await redis.get<string>(`birthday:rsvp:${id}`);
    if (!raw) {
      return res.status(404).json({ error: 'RSVP não encontrado' });
    }

    const entry: RsvpEntry = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // GET — View RSVP
    if (req.method === 'GET') {
      // Return without email for privacy (partial)
      return res.status(200).json({
        id: entry.id,
        name: entry.name,
        email: entry.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        message: entry.message,
        status: entry.status,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });
    }

    // PUT — Update RSVP
    if (req.method === 'PUT') {
      const { name, message, status } = req.body;

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'Nome é obrigatório' });
        }
        entry.name = name.trim();
      }

      if (message !== undefined) {
        entry.message = (message || '').trim();
      }

      if (status !== undefined) {
        if (status !== 'confirmed' && status !== 'cancelled') {
          return res.status(400).json({ error: 'Status inválido' });
        }
        entry.status = status;
      }

      entry.updatedAt = new Date().toISOString();

      await redis.set(`birthday:rsvp:${id}`, JSON.stringify(entry));

      // Send update notification email
      try {
        await resend.emails.send({
          from: 'Level 30 <onboarding@resend.dev>',
          to: entry.email,
          subject: entry.status === 'confirmed'
            ? '🎭 Presença Re-confirmada — Level 30 do Pedro!'
            : '🎭 Resposta Atualizada — Level 30 do Pedro',
          html: buildUpdateEmail(entry),
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }

      return res.status(200).json({ success: true, entry: { ...entry, email: entry.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') } });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('RSVP [id] error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
