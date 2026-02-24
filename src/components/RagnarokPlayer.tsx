import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

const PRONTERA_URL = '/easter-eggs/prontera.mp3';

function RagnarokImage() {
  return (
    <div className="relative w-full max-w-sm mx-auto mb-6 flex justify-center">
      <img
        src="/easter-eggs/Ragnarok.jpg"
        alt="Ragnarök Online — Fique com Ragnarok"
        className="max-h-[40vh] w-auto object-contain border border-gold/20 shadow-2xl"
      />
    </div>
  );
}

export function RagnarokPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ensure audio element exists
  const getAudio = () => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.src = PRONTERA_URL;
      audio.volume = 0.4;
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const play = () => {
    const audio = getAudio();
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const pause = () => {
    const audio = getAudio();
    audio.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  // Auto-play on open, stop on close
  useEffect(() => {
    if (open) {
      play();
    } else {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

              <RagnarokImage />

              {/* Play button + visualizer */}
              <div className="text-center">
                <motion.button
                  onClick={isPlaying ? pause : play}
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
