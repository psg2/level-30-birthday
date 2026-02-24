import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { useEasterEggs } from '@/hooks/useEasterEggs';

export function TrophyNotification() {
  const { lastUnlocked, dismissNotification, justGotPlatinum, dismissPlatinum, found, total } = useEasterEggs();

  // Auto-dismiss individual trophy after 3s
  useEffect(() => {
    if (!lastUnlocked) return;
    const timer = setTimeout(dismissNotification, 3000);
    return () => clearTimeout(timer);
  }, [lastUnlocked, dismissNotification]);

  // Auto-dismiss platinum after 5s
  useEffect(() => {
    if (!justGotPlatinum) return;
    const timer = setTimeout(dismissPlatinum, 5000);
    return () => clearTimeout(timer);
  }, [justGotPlatinum, dismissPlatinum]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {/* Individual trophy notification */}
        {lastUnlocked && (
          <motion.div
            key={`trophy-${lastUnlocked.id}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto"
          >
            <div className="flex items-center gap-4 bg-[#1a1a2e]/95 backdrop-blur-md border border-[#cd7f32]/40
              px-5 py-3 min-w-[280px] max-w-[360px] shadow-2xl"
              style={{ boxShadow: '0 0 30px rgba(205, 127, 50, 0.2)' }}
            >
              {/* Trophy icon */}
              <div className="relative shrink-0">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="text-3xl"
                >
                  🏆
                </motion.div>
                {/* Bronze shimmer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ delay: 0.3, duration: 1.5 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(205, 127, 50, 0.4) 0%, transparent 70%)' }}
                />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#cd7f32]/60 tracking-[0.2em] uppercase">
                  Troféu Desbloqueado
                </div>
                <div className="font-display text-sm text-cream font-bold italic truncate">
                  {lastUnlocked.icon} {lastUnlocked.name}
                </div>
                <div className="font-body text-[11px] text-cream/40 italic truncate">
                  {lastUnlocked.description}
                </div>
              </div>

              {/* Counter */}
              <div className="shrink-0 font-mono text-xs text-[#cd7f32]/50 text-right">
                {found.size}/{total}
              </div>
            </div>
          </motion.div>
        )}

        {/* Platinum notification */}
        {justGotPlatinum && (
          <motion.div
            key="platinum"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto"
          >
            <div className="flex items-center gap-4 bg-[#1a1a2e]/95 backdrop-blur-md border border-[#E5E4E2]/50
              px-5 py-4 min-w-[300px] max-w-[380px] shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(229, 228, 226, 0.2), 0 0 80px rgba(229, 228, 226, 0.1)' }}
            >
              <div className="relative shrink-0">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="text-4xl"
                >
                  🏅
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(229, 228, 226, 0.5) 0%, transparent 70%)' }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#E5E4E2]/70 tracking-[0.2em] uppercase">
                  ★ Troféu Platina ★
                </div>
                <div className="font-display text-base text-cream font-bold italic">
                  Explorador Completo
                </div>
                <div className="font-body text-[11px] text-cream/40 italic">
                  Todos os easter eggs encontrados!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
