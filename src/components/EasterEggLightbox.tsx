import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface EasterEggLightboxProps {
  open: boolean;
  onClose: () => void;
  images: { src: string; caption?: string }[];
  title?: string;
}

export function EasterEggLightbox({ open, onClose, images, title }: EasterEggLightboxProps) {
  const [current, setCurrent] = useState(0);
  const isGallery = images.length > 1;

  useEffect(() => {
    if (!open) { setCurrent(0); return; }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (isGallery && e.key === 'ArrowRight') setCurrent((p) => (p + 1) % images.length);
      if (isGallery && e.key === 'ArrowLeft') setCurrent((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, isGallery, images.length]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stage-black/90 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-50 flex flex-col items-center justify-center"
            onClick={onClose}
          >
            {/* Easter egg label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-[10px] text-neon-cyan/40 tracking-widest mb-3"
            >
              🔓 EASTER EGG DESBLOQUEADO
            </motion.div>

            {/* Title */}
            {title && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-xl sm:text-2xl text-cream font-bold italic mb-4"
              >
                {title}
              </motion.h3>
            )}

            {/* Image + arrows row */}
            <div
              className="flex items-center gap-3 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left arrow */}
              {isGallery && (
                <button
                  onClick={() => setCurrent((p) => (p - 1 + images.length) % images.length)}
                  className="shrink-0 w-10 h-10 flex items-center justify-center
                    border border-gold/20 text-cream/60 hover:text-cream hover:border-gold/50
                    transition-all cursor-pointer font-mono text-lg"
                >
                  ‹
                </button>
              )}

              {/* Image */}
              <div className="relative max-w-full max-h-[65vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current}
                    src={images[current].src}
                    alt={images[current].caption || ''}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="max-h-[65vh] max-w-full object-contain rounded-sm
                      border border-gold/20 shadow-2xl"
                  />
                </AnimatePresence>
              </div>

              {/* Right arrow */}
              {isGallery && (
                <button
                  onClick={() => setCurrent((p) => (p + 1) % images.length)}
                  className="shrink-0 w-10 h-10 flex items-center justify-center
                    border border-gold/20 text-cream/60 hover:text-cream hover:border-gold/50
                    transition-all cursor-pointer font-mono text-lg"
                >
                  ›
                </button>
              )}
            </div>

            {/* Caption */}
            {images[current].caption && (
              <motion.p
                key={`cap-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-body text-cream/40 text-sm italic mt-3 text-center"
              >
                {images[current].caption}
              </motion.p>
            )}

            {/* Gallery dots */}
            {isGallery && (
              <div className="flex gap-2 mt-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      i === current ? 'bg-gold scale-125' : 'bg-cream/20 hover:bg-cream/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Close hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-[10px] text-cream/20 mt-4"
            >
              ESC ou clique fora para fechar
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
