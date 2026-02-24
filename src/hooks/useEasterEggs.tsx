import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { syncTrophies } from '@/server/rsvp';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const TROPHIES: Trophy[] = [
  { id: 'nintendo', name: 'Primeira Quest', description: 'Descobriu as origens gamer', icon: '🎮' },
  { id: 'ragnarok', name: 'Nostalgia Online', description: 'Relembrou os tempos de RO', icon: '⚔️' },
  { id: 'cosplay', name: 'Cosplayer Secreto', description: 'Encontrou o alter ego', icon: '⚡' },
  { id: 'lol', name: 'Streamer Aposentado', description: 'Achou as provas da era LoL', icon: '🏆' },
  { id: 'programming', name: 'Código Competitivo', description: 'Revelou o passado de maratonista', icon: '💻' },
  { id: 'clea', name: 'Player 2 Found', description: 'Conheceu a co-op partner', icon: '❤️' },
  { id: 'pets', name: 'Pai de Pet Revelado', description: 'Viu os companheiros peludos', icon: '🐕' },
  { id: 'boardgames', name: 'Colecionador', description: 'Encontrou a coleção secreta', icon: '🎲' },
  { id: 'teatro', name: 'Crítico de Teatro', description: 'Explorou o acervo teatral', icon: '🎭' },
];

const STORAGE_KEY = 'level30_easter_eggs';

interface EasterEggContextType {
  found: Set<string>;
  total: number;
  unlock: (id: string) => void;
  isFound: (id: string) => boolean;
  allFound: boolean;
  /** The trophy that was just unlocked (for notification) */
  lastUnlocked: Trophy | null;
  dismissNotification: () => void;
  /** Whether platinum was just achieved (for special notification) */
  justGotPlatinum: boolean;
  dismissPlatinum: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | null>(null);

function loadFound(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveFound(found: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
  } catch { /* ignore */ }
}

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const [found, setFound] = useState<Set<string>>(() => loadFound());
  const [lastUnlocked, setLastUnlocked] = useState<Trophy | null>(null);
  const [justGotPlatinum, setJustGotPlatinum] = useState(false);

  const total = TROPHIES.length;
  const allFound = found.size >= total;

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveFound(found);

    // Auto-sync trophies to server if user has an RSVP
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      try {
        const rsvpId = localStorage.getItem('level30_rsvp_id');
        if (rsvpId && found.size > 0) {
          syncTrophies({ data: { id: rsvpId, trophies: [...found] } }).catch(() => {});
        }
      } catch {}
    }, 1000); // debounce 1s
  }, [found]);

  const unlock = useCallback((id: string) => {
    setFound((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);

      // Find trophy info for notification
      const trophy = TROPHIES.find((t) => t.id === id);
      if (trophy) {
        setLastUnlocked(trophy);
      }

      // Check if this completes the set
      if (next.size >= total) {
        setTimeout(() => setJustGotPlatinum(true), 3500); // after individual trophy dismisses
      }

      return next;
    });
  }, [total]);

  const isFound = useCallback((id: string) => found.has(id), [found]);

  const dismissNotification = useCallback(() => setLastUnlocked(null), []);
  const dismissPlatinum = useCallback(() => setJustGotPlatinum(false), []);

  return (
    <EasterEggContext.Provider value={{
      found, total, unlock, isFound, allFound,
      lastUnlocked, dismissNotification,
      justGotPlatinum, dismissPlatinum,
    }}>
      {children}
    </EasterEggContext.Provider>
  );
}

export function useEasterEggs() {
  const ctx = useContext(EasterEggContext);
  if (!ctx) throw new Error('useEasterEggs must be used within EasterEggProvider');
  return ctx;
}
