import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RSVP_KEY = 'birthday:rsvps';

interface RsvpEntry {
  name: string;
  message: string;
  timestamp: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { name, message } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const entry: RsvpEntry = {
        name: name.trim(),
        message: (message || '').trim(),
        timestamp: new Date().toISOString(),
      };

      await redis.lpush(RSVP_KEY, JSON.stringify(entry));

      return res.status(201).json({ success: true, entry });
    }

    if (req.method === 'GET') {
      // Simple auth for listing guests — pass ?key=<ADMIN_KEY>
      const adminKey = process.env.ADMIN_KEY;
      const providedKey = req.query.key;

      if (!adminKey || providedKey !== adminKey) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const rawEntries = await redis.lrange(RSVP_KEY, 0, -1);
      const entries: RsvpEntry[] = rawEntries.map((entry) => {
        if (typeof entry === 'string') return JSON.parse(entry);
        return entry;
      });

      return res.status(200).json({ count: entries.length, guests: entries });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
