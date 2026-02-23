import { motion } from 'motion/react';

const details = [
  {
    icon: '📅',
    label: 'Quando',
    value: 'Sábado, 14 de Março de 2026',
    sub: 'A partir das 17h',
  },
  {
    icon: '📍',
    label: 'Onde',
    value: 'R. Morgado de Mateus, 352',
    sub: 'Salão de Festas · Vila Mariana, SP · 04015-050',
  },
  {
    icon: '🎪',
    label: 'Dress Code',
    value: 'Venha como seu personagem favorito',
    sub: 'Ou simplesmente arrasa no look',
  },
];

export function EventDetails() {
  return (
    <section className="relative py-24 md:py-32 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.5em] uppercase mb-4">
          — Ato III —
        </div>
        <h2 className="font-display text-5xl md:text-7xl font-bold italic text-gold">
          O Palco
        </h2>
        <p className="font-body text-cream/50 text-sm mt-4 max-w-md mx-auto italic">
          "Toda grande apresentação precisa de um palco. Aqui estão os detalhes da noite de estreia."
        </p>
      </motion.div>

      {/* Details cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {details.map((detail, i) => (
          <motion.div
            key={detail.label}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 * i }}
            whileHover={{ y: -8 }}
            className="relative group"
          >
            <div className="border border-gold/15 bg-stage-dark/60 backdrop-blur-sm p-8 text-center
              transition-all duration-500 group-hover:border-gold/40 group-hover:bg-stage-dark/80 h-full">
              {/* Decorative top line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gold/40
                group-hover:w-full transition-all duration-500" />

              <motion.div
                className="text-4xl mb-4"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {detail.icon}
              </motion.div>

              <div className="font-mono text-xs text-neon-cyan/60 tracking-[0.3em] uppercase mb-3">
                {detail.label}
              </div>

              <h3 className="font-display text-xl md:text-2xl text-cream font-bold italic mb-2">
                {detail.value}
              </h3>

              <p className="font-body text-cream/30 text-sm italic">
                {detail.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ticket-style divider */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="max-w-4xl mx-auto mt-16"
      >
        <div className="relative border border-gold/20 bg-stage-dark/40 p-8 md:p-12 overflow-hidden">
          {/* Ticket cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stage-black" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stage-black" />

          {/* Dashed line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t border-dashed border-gold/20" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="font-mono text-xs text-gold/60 tracking-[0.3em]">ENTRADA ÚNICA</div>
              <div className="font-display text-3xl md:text-4xl text-gold font-bold italic">
                Pedro's 30th
              </div>
            </div>
            <div className="text-center">
              <div className="font-mono text-neon-cyan text-sm tracking-wider"
                style={{ textShadow: '0 0 10px rgba(0, 245, 212, 0.3)' }}>
                14.03.2026
              </div>
              <div className="font-mono text-cream/30 text-xs mt-1">SÁBADO</div>
            </div>
            <div className="text-center md:text-right">
              <div className="font-mono text-xs text-gold/60 tracking-[0.3em]">ASSENTO</div>
              <div className="font-display text-2xl text-cream italic">VIP</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
