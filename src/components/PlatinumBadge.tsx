import { motion } from 'motion/react';
import { useEasterEggs } from '@/hooks/useEasterEggs';

export function PlatinumBadge() {
  const { allFound, found, total } = useEasterEggs();

  if (!allFound) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', damping: 15 }}
      className="relative mx-auto mb-8 max-w-md"
    >
      <div className="relative border border-[#E5E4E2]/30 bg-[#1a1a2e]/80 backdrop-blur-md p-6 text-center overflow-hidden"
        style={{ boxShadow: '0 0 40px rgba(229, 228, 226, 0.1), 0 0 80px rgba(229, 228, 226, 0.05)' }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#E5E4E2]/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#E5E4E2]/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#E5E4E2]/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#E5E4E2]/50" />

        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(229, 228, 226, 0.08), transparent)',
            width: '50%',
          }}
        />

        {/* Trophy */}
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="text-5xl mb-3"
        >
          🏅
        </motion.div>

        <div className="font-mono text-[10px] text-[#E5E4E2]/60 tracking-[0.4em] uppercase mb-1">
          ★ Troféu Platina ★
        </div>

        <h3 className="font-display text-2xl text-[#E5E4E2] font-bold italic mb-1">
          Explorador Completo
        </h3>

        <p className="font-body text-cream/30 text-xs italic mb-3">
          Você encontrou todos os {total} easter eggs escondidos!
        </p>

        <div className="flex justify-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring' }}
              className="w-2 h-2 rounded-full bg-[#E5E4E2]/60"
              style={{ boxShadow: '0 0 6px rgba(229, 228, 226, 0.4)' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
