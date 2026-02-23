import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';

export function CurtainReveal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback(() => {
    if (phase !== 'closed') return;
    setPhase('opening');
  }, [phase]);

  // After the opening animation completes, mark done and notify parent
  const handleCurtainAnimationComplete = useCallback(() => {
    if (phase === 'opening') {
      setPhase('done');
      onComplete();
    }
  }, [phase, onComplete]);

  if (phase === 'done') return null;

  const curtainEase = [0.76, 0, 0.24, 1] as const;
  const isOpening = phase === 'opening';

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden"
      onClick={handleOpen}
    >
      {/* Stage — dark background revealed behind curtains */}
      <div className="absolute inset-0 bg-stage-black" />

      {/* Left curtain */}
      <motion.div
        className="absolute top-0 left-0 w-[52%] h-full origin-left"
        initial={{ x: '0%' }}
        animate={isOpening ? { x: '-100%' } : { x: '0%' }}
        transition={{ duration: 1.6, ease: curtainEase }}
        onAnimationComplete={handleCurtainAnimationComplete}
        style={{
          background: 'linear-gradient(135deg, #8B1A1A 0%, #5C0E0E 40%, #8B1A1A 100%)',
          boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Fabric fold texture */}
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.08) 15px, transparent 30px)',
        }} />
        {/* Extra depth folds when opening */}
        <motion.div
          className="absolute inset-0"
          animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.15) 8px, transparent 16px, rgba(0,0,0,0.05) 24px, transparent 32px)',
          }}
        />
        {/* Gold trim on inner edge */}
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-gold-light via-gold to-gold-dim" />
        {/* Tassel cord */}
        <div className="absolute top-12 right-6 w-1 h-24 bg-gradient-to-b from-gold to-gold-dim rounded-full" />
        <div className="absolute top-36 right-4 w-5 h-8 rounded-b-full" style={{
          background: 'linear-gradient(to bottom, #D4A843, #A07D2E)',
        }} />
        {/* Shadow cast on stage */}
        <div className="absolute top-0 -right-8 w-8 h-full bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* Right curtain */}
      <motion.div
        className="absolute top-0 right-0 w-[52%] h-full origin-right"
        initial={{ x: '0%' }}
        animate={isOpening ? { x: '100%' } : { x: '0%' }}
        transition={{ duration: 1.6, ease: curtainEase }}
        style={{
          background: 'linear-gradient(225deg, #8B1A1A 0%, #5C0E0E 40%, #8B1A1A 100%)',
          boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.08) 15px, transparent 30px)',
        }} />
        <motion.div
          className="absolute inset-0"
          animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.15) 8px, transparent 16px, rgba(0,0,0,0.05) 24px, transparent 32px)',
          }}
        />
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gold-light via-gold to-gold-dim" />
        <div className="absolute top-12 left-6 w-1 h-24 bg-gradient-to-b from-gold to-gold-dim rounded-full" />
        <div className="absolute top-36 left-4 w-5 h-8 rounded-b-full" style={{
          background: 'linear-gradient(to bottom, #D4A843, #A07D2E)',
        }} />
        <div className="absolute top-0 -left-8 w-8 h-full bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* Top valance / pelmet */}
      <motion.div
        className="absolute top-0 left-0 w-full h-16 z-10"
        initial={{ y: 0, opacity: 1 }}
        animate={isOpening ? { y: '-100%', opacity: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.3 }}
        style={{
          background: 'linear-gradient(to bottom, #5C0E0E, #8B1A1A)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute bottom-0 left-0 w-full h-6" style={{
          background: 'repeating-conic-gradient(#8B1A1A 0% 25%, transparent 0% 50%) 0 0 / 40px 12px',
        }} />
        <div className="absolute bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </motion.div>

      {/* Center text — fades out quickly when opening */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isOpening
            ? { opacity: 0, scale: 0.9 }
            : { opacity: 1, y: 0 }
          }
          transition={isOpening
            ? { duration: 0.4 }
            : { duration: 1, delay: 0.3 }
          }
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center select-none">
            <div
              className="font-mono text-neon-cyan text-sm tracking-[0.3em] uppercase mb-3"
              style={{ animation: 'neon-flicker 4s infinite' }}
            >
              Toque em qualquer lugar para começar
            </div>
            <div
              className="font-display text-gold text-6xl md:text-8xl font-bold italic"
              style={{ textShadow: '0 0 40px rgba(212, 168, 67, 0.3)' }}
            >
              Ato III
            </div>
            <div className="font-mono text-warm-white/50 text-xs tracking-[0.5em] uppercase mt-3">
              Um novo capítulo te espera
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
