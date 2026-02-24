import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

const PRONTERA_URL = '/easter-eggs/prontera.mp3';

// Pixel art style Prontera scene using CSS
function PronteraScene() {
  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="relative border border-gold/20 bg-[#2a1f3d] overflow-hidden p-6" style={{ imageRendering: 'pixelated' }}>
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a7ab5] via-[#6b9fd4] to-[#2a1f3d]" />

        {/* Clouds */}
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute top-4 left-8 w-16 h-4 bg-white/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute top-8 right-12 w-12 h-3 bg-white/15 rounded-full blur-sm"
        />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#4a6b35]" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#3a5a28]" />

        {/* Castle/Building silhouette */}
        <div className="relative z-10 flex items-end justify-center gap-1 pt-16 pb-8">
          {/* Left tower */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-[#c4a55a]" />
            <div className="w-4 h-8 bg-[#8b7355]" />
            <div className="w-6 h-4 bg-[#7a6548]" />
          </div>
          {/* Center building */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-[#c4a55a]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="w-8 h-12 bg-[#8b7355]" />
            <div className="w-12 h-6 bg-[#7a6548]" />
          </div>
          {/* Right tower */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-[#c4a55a]" />
            <div className="w-4 h-8 bg-[#8b7355]" />
            <div className="w-6 h-4 bg-[#7a6548]" />
          </div>
        </div>

        {/* Prontera text */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="font-mono text-[10px] text-[#c4a55a] tracking-[0.3em]">
            PRONTERA
          </span>
        </div>
      </div>
    </div>
  );
}

export function RagnarokPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(PRONTERA_URL);
      audioRef.current.volume = 0.4;
      audioRef.current.loop = true;
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stage-black/90 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
              sm:w-full sm:max-w-md z-50 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-stage-dark/95 border border-gold/20 backdrop-blur-md p-6 sm:p-8">
              {/* Easter egg label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-[10px] text-neon-cyan/40 tracking-widest text-center mb-4"
              >
                🔓 EASTER EGG DESBLOQUEADO
              </motion.div>

              <PronteraScene />

              {/* Play button + visualizer */}
              <div className="text-center">
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`font-mono text-sm px-6 py-3 border cursor-pointer transition-all ${
                    isPlaying
                      ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                      : 'border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5'
                  }`}
                >
                  {isPlaying ? '⏸ Pausar BGM' : '▶ Tocar Prontera BGM'}
                </motion.button>

                {/* Fixed-height container so layout doesn't jump */}
                <div className="h-8 flex items-end justify-center gap-1 mt-3">
                  {isPlaying && (
                    <>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 4 }}
                          animate={{ height: [4, 12 + Math.random() * 8, 4] }}
                          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.08 }}
                          className="w-1 bg-neon-cyan/60 rounded-full"
                        />
                      ))}
                    </>
                  )}
                </div>

                <p className="font-body text-cream/20 text-xs italic mt-2">
                  Novice → Thief → Rogue · Nunca esquecemos
                </p>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 font-mono text-cream/30 hover:text-cream
                  transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
