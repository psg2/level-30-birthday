import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface Stat {
  label: string;
  fullName: string;
  value: number;
  maxValue: number;
  color: string;
}

const stats: Stat[] = [
  { label: 'CAR', fullName: 'Carinho', value: 99, maxValue: 100, color: '#F72585' },
  { label: 'EMP', fullName: 'Empatia', value: 97, maxValue: 100, color: '#7B61FF' },
  { label: 'GAM', fullName: 'Gaming', value: 80, maxValue: 100, color: '#00F5D4' },
  { label: 'GAS', fullName: 'Gastronomia', value: 88, maxValue: 100, color: '#D4A843' },
  { label: 'VIA', fullName: 'Viajante', value: 95, maxValue: 100, color: '#E8C96A' },
  { label: 'SAB', fullName: 'Sabedoria (já chegou aos 30 antes)', value: 30, maxValue: 100, color: '#00F5D4' },
];

const traits = [
  { icon: '💖', label: 'Amorosa', desc: 'Coração infinito — skill passiva sempre ativa' },
  { icon: '🎮', label: 'Gamer', desc: 'Companheira de raids e board games' },
  { icon: '🍰', label: 'Foodie', desc: 'Parceira de crime gastronômico' },
  { icon: '🎭', label: 'Amante do Teatro', desc: 'Duo inseparável nas peças' },
  { icon: '✈️', label: 'Viajante', desc: 'Sempre planejando a próxima aventura' },
  { icon: '🐕', label: 'Mãe de Pet', desc: '🐶 Rick · 🍯 Mel' },
];

function MiniPixelBar({ value, maxValue, color, delay }: { value: number; maxValue: number; color: string; delay: number }) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((value / maxValue) * totalBlocks);

  return (
    <div className="flex gap-[2px] sm:gap-[3px]">
      {Array.from({ length: totalBlocks }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.05, delay: delay + i * 0.03 }}
          className="w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 rounded-sm"
          style={{
            backgroundColor: i < filledBlocks ? color : 'rgba(255,255,255,0.05)',
            boxShadow: i < filledBlocks ? `0 0 8px ${color}40` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function StatRows({ stats: statList }: { stats: Stat[] }) {
  const [activeTip, setActiveTip] = useState<string | null>(null);

  return (
    <div className="space-y-3 sm:space-y-4 mb-10">
      {statList.map((stat, i) => {
        const isOpen = activeTip === stat.label;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-2 sm:gap-4 group/stat relative cursor-help select-none"
            onClick={() => setActiveTip((prev) => (prev === stat.label ? null : stat.label))}
          >
            <div className="font-mono text-xs sm:text-sm text-cream/60 w-8 sm:w-10 text-right shrink-0">
              {stat.label}
            </div>
            <MiniPixelBar value={stat.value} maxValue={stat.maxValue} color={stat.color} delay={0.1 * i} />
            <div className="font-mono text-xs shrink-0 w-6 text-right" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
              bg-stage-dark border border-neon-magenta/30 whitespace-nowrap
              pointer-events-none transition-opacity duration-200 z-20
              ${isOpen ? 'opacity-100' : 'opacity-0 group-hover/stat:opacity-100'}`}>
              <div className="font-mono text-[10px] sm:text-xs text-neon-magenta tracking-wider">{stat.fullName}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                border-l-4 border-r-4 border-t-4
                border-l-transparent border-r-transparent border-t-neon-magenta/30" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Player2Card({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-stage-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.4, type: 'spring', damping: 25 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
              sm:w-full sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto z-50"
          >
            <div className="relative border border-neon-magenta/30 bg-stage-dark/95 backdrop-blur-md p-5 sm:p-8 md:p-12"
              style={{ boxShadow: '0 0 60px rgba(247, 37, 133, 0.15), 0 0 120px rgba(247, 37, 133, 0.05)' }}>
              {/* Corner decorations — magenta theme */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-magenta/60" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-magenta/60" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-magenta/60" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-magenta/60" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 font-mono text-cream/30 hover:text-neon-magenta
                  transition-colors text-sm cursor-pointer z-10"
              >
                ✕ ESC
              </button>

              {/* Easter egg hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-4 left-4 font-mono text-[10px] text-neon-magenta/40 tracking-widest"
              >
                🔓 EASTER EGG DESBLOQUEADO
              </motion.div>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-10 mt-6">
                <div className="min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-mono text-neon-magenta text-xs tracking-[0.3em] mb-1"
                  >
                    JOGADORA DOIS
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream italic"
                  >
                    Cléa
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-mono text-neon-magenta/60 text-[10px] sm:text-xs mt-2 tracking-wider leading-relaxed"
                  >
                    <span>CLASSE: Cuidadora / Viajante / Mãe de Pet</span>
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
                    <span>ROLE: Player 2</span>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-mono text-right shrink-0"
                >
                  <div className="text-neon-magenta text-xl sm:text-3xl font-bold" style={{
                    textShadow: '0 0 10px rgba(247, 37, 133, 0.5)',
                  }}>CO-OP</div>
                  <div className="text-cream/40 text-[10px] sm:text-xs">MODO COOPERATIVO</div>
                </motion.div>
              </div>

              {/* Stats */}
              <StatRows stats={stats} />

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-neon-magenta/30 to-transparent mb-10" />

              {/* Traits grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                {traits.map((trait, i) => (
                  <motion.div
                    key={trait.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + 0.08 * i }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(247, 37, 133, 0.1)' }}
                    className="border border-neon-magenta/10 p-4 cursor-default transition-colors"
                  >
                    <div className="text-2xl mb-2">{trait.icon}</div>
                    <div className="font-mono text-sm text-neon-magenta font-bold">{trait.label}</div>
                    <div className="font-body text-cream/40 text-xs mt-1 italic">{trait.desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom flavor text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 text-center"
              >
                <p className="font-body text-cream/20 text-xs italic">
                  "A melhor party é aquela que tem a Player 2 certa ao seu lado"
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
