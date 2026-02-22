import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CurtainReveal({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(onComplete, 1800);
  };

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
          onClick={handleOpen}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {/* Left curtain */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full"
            animate={isOpen ? { x: '-100%' } : { x: 0 }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            style={{
              background: `linear-gradient(135deg, #8B1A1A 0%, #5C0E0E 40%, #8B1A1A 100%)`,
              boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Curtain folds */}
            <div className="absolute inset-0" style={{
              background: `repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.1) 20px, transparent 40px)`,
            }} />
            {/* Gold trim */}
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-gold-light via-gold to-gold-dim" />
            {/* Tassel */}
            <div className="absolute top-12 right-6 w-1 h-24 bg-gradient-to-b from-gold to-gold-dim rounded-full" />
            <div className="absolute top-36 right-4 w-5 h-8 rounded-b-full" style={{
              background: 'linear-gradient(to bottom, #D4A843, #A07D2E)',
            }} />
          </motion.div>

          {/* Right curtain */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full"
            animate={isOpen ? { x: '100%' } : { x: 0 }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            style={{
              background: `linear-gradient(225deg, #8B1A1A 0%, #5C0E0E 40%, #8B1A1A 100%)`,
              boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute inset-0" style={{
              background: `repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.1) 20px, transparent 40px)`,
            }} />
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gold-light via-gold to-gold-dim" />
            <div className="absolute top-12 left-6 w-1 h-24 bg-gradient-to-b from-gold to-gold-dim rounded-full" />
            <div className="absolute top-36 left-4 w-5 h-8 rounded-b-full" style={{
              background: 'linear-gradient(to bottom, #D4A843, #A07D2E)',
            }} />
          </motion.div>

          {/* Top valance */}
          <motion.div
            className="absolute top-0 left-0 w-full h-16 z-10"
            animate={isOpen ? { y: '-100%', opacity: 0 } : {}}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(to bottom, #5C0E0E, #8B1A1A)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* Scalloped edge */}
            <div className="absolute bottom-0 left-0 w-full h-6" style={{
              background: `repeating-conic-gradient(#8B1A1A 0% 25%, transparent 0% 50%) 0 0 / 40px 12px`,
            }} />
            <div className="absolute bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </motion.div>

          {/* Prompt text */}
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-20 text-center select-none"
            >
              <div className="font-mono text-neon-cyan text-sm tracking-[0.3em] uppercase mb-3"
                style={{ animation: 'neon-flicker 4s infinite' }}>
                Toque em qualquer lugar para começar
              </div>
              <div className="font-display text-gold text-6xl md:text-8xl font-bold italic"
                style={{ textShadow: '0 0 40px rgba(212, 168, 67, 0.3)' }}>
                Ato III
              </div>
              <div className="font-mono text-warm-white/50 text-xs tracking-[0.5em] uppercase mt-3">
                Um novo capítulo te espera
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
