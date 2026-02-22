import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer className="relative py-16 px-6">
      {/* Top border */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-12" />

      <div className="max-w-2xl mx-auto text-center">
        {/* Theater curtain call style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="font-display text-3xl md:text-4xl text-gold/60 italic mb-4">
            ~ Fin ~
          </div>

          <div className="font-body text-cream/30 text-sm italic mb-8">
            Uma produção de Pedro Sereno · Fazendo 30 desde 1996
          </div>

          {/* Decorative pattern */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['🎭', '🎮', '🏋️', '💻', '🎨'].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-lg opacity-30 hover:opacity-100 transition-opacity cursor-default"
                whileHover={{ scale: 1.3, y: -4 }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          <div className="font-mono text-xs text-cream/15 tracking-[0.3em]">
            FEITO COM ♥ PARA AS MELHORES PESSOAS
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
