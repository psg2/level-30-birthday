import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

const BGM_URL = '/easter-eggs/pokemon_stadium.mp3';

export function NintendoPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.src = BGM_URL;
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
            <div className="w-full bg-stage-dark/95 border border-[#E4000F]/30 backdrop-blur-md p-6 sm:p-8"
              style={{ boxShadow: '0 0 60px rgba(228, 0, 15, 0.1)' }}>

              {/* Easter egg label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-[10px] text-neon-cyan/40 tracking-widest text-center mb-4"
              >
                🔓 EASTER EGG DESBLOQUEADO
              </motion.div>

              {/* Game cover */}
              <div className="flex justify-center mb-6">
                <img
                  src="/easter-eggs/PokemonStadium.jpg"
                  alt="Pokémon Stadium"
                  className="max-h-[35vh] w-auto object-contain border border-[#E4000F]/20 shadow-2xl"
                />
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <h3 className="font-display text-xl sm:text-2xl text-cream font-bold italic">
                  Pokémon Stadium
                </h3>
                <p className="font-mono text-[11px] text-[#E4000F]/60 tracking-wider mt-1">
                  NINTENDO 64 · A PRIMEIRA QUEST
                </p>
              </div>

              {/* Play button */}
              <div className="text-center">
                <motion.button
                  onClick={isPlaying ? pause : play}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`font-mono text-sm px-6 py-3 border cursor-pointer transition-all ${
                    isPlaying
                      ? 'border-[#E4000F]/50 text-[#E4000F] bg-[#E4000F]/10'
                      : 'border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5'
                  }`}
                >
                  {isPlaying ? '⏸ Pausar BGM' : '▶ Tocar Stadium BGM'}
                </motion.button>

                {/* Fixed-height visualizer */}
                <div className="h-8 flex items-end justify-center gap-1 mt-3">
                  {isPlaying && (
                    <>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 4 }}
                          animate={{ height: [4, 12 + Math.random() * 8, 4] }}
                          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.08 }}
                          className="w-1 rounded-full"
                          style={{ backgroundColor: i % 2 === 0 ? '#E4000F' : '#FFD700' }}
                        />
                      ))}
                    </>
                  )}
                </div>

                <p className="font-body text-cream/20 text-xs italic mt-2">
                  Pokémon Stadium & Mario · Onde tudo começou
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
