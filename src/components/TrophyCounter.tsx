import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useEasterEggs, TROPHIES } from '@/hooks/useEasterEggs';

export function TrophyCounter() {
  const { found, total, allFound } = useEasterEggs();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Counter pill */}
      <motion.button
        onClick={() => setExpanded((p) => !p)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-2 backdrop-blur-md border cursor-pointer
          transition-colors duration-300 ${
          allFound
            ? 'bg-[#1a1a2e]/90 border-[#E5E4E2]/40 shadow-[0_0_20px_rgba(229,228,226,0.15)]'
            : 'bg-[#1a1a2e]/80 border-gold/20 hover:border-gold/40'
        }`}
      >
        <motion.span
          key={found.size}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-sm"
        >
          {allFound ? '🏅' : '🏆'}
        </motion.span>
        <span className={`font-mono text-xs tracking-wider ${
          allFound ? 'text-[#E5E4E2]' : 'text-gold/60'
        }`}>
          {found.size}/{total}
        </span>
      </motion.button>

      {/* Expanded trophy list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-72 bg-[#1a1a2e]/95 backdrop-blur-md
              border border-gold/20 p-4 shadow-2xl"
          >
            <div className="font-mono text-[10px] text-gold/60 tracking-[0.3em] uppercase mb-3">
              Troféus
            </div>
            <div className="space-y-2">
              {TROPHIES.map((trophy) => {
                const isFound = found.has(trophy.id);
                return (
                  <div
                    key={trophy.id}
                    className={`flex items-center gap-3 py-1.5 px-2 transition-colors ${
                      isFound ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <span className="text-base w-6 text-center">
                      {isFound ? trophy.icon : '❓'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`font-mono text-xs ${isFound ? 'text-cream' : 'text-cream/50'}`}>
                        {isFound ? trophy.name : '???'}
                      </div>
                      {isFound && (
                        <div className="font-body text-[10px] text-cream/30 italic">
                          {trophy.description}
                        </div>
                      )}
                    </div>
                    {isFound && (
                      <span className="text-[#cd7f32] text-xs">🏆</span>
                    )}
                  </div>
                );
              })}
            </div>

            {allFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 pt-3 border-t border-[#E5E4E2]/20 text-center"
              >
                <div className="font-mono text-[10px] text-[#E5E4E2]/70 tracking-[0.2em]">
                  ★ PLATINA CONQUISTADA ★
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
