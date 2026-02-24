import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { useEasterEggs } from '@/hooks/useEasterEggs';
import { EasterEggLightbox } from './EasterEggLightbox';

interface Stat {
  label: string;
  fullName: string;
  value: number;
  maxValue: number;
  color: string;
  id?: string;
}

const stats: Stat[] = [
  { label: 'DEV', fullName: 'Desenvolvimento', value: 95, maxValue: 100, color: '#00F5D4', id: 'programming' },
  { label: 'GAM', fullName: 'Gaming', value: 90, maxValue: 100, color: '#F72585' },
  { label: 'FIT', fullName: 'Fitness', value: 75, maxValue: 100, color: '#7B61FF' },
  { label: 'GAS', fullName: 'Gastronomia', value: 92, maxValue: 100, color: '#D4A843' },
  { label: 'SAB', fullName: 'Sabedoria (chega aos 30 e começa do zero)', value: 30, maxValue: 100, color: '#E8C96A' },
];

const traits = [
  { icon: '🎮', label: 'Gamer', desc: 'Digital e de mesa — RPG, strategy, você escolhe' },
  { icon: '🏋️', label: 'Rato de Academia', desc: 'Academia · Funcional · Corrida' },
  { icon: '💻', label: 'Desenvolvedor', desc: 'Escreve <s>código</s> prompts' },
  { icon: '🍰', label: 'Foodie', desc: 'Viciado em comida e sobremesas novas' },
  { icon: '🎭', label: 'Amante do Teatro', desc: 'Peregrino semanal das peças' },
  { icon: '🐕', label: 'Pai de Pet', desc: '🐶 Rick · 🍯 Mel', id: 'pets' },
];

function PixelBar({ value, maxValue, color, delay }: { value: number; maxValue: number; color: string; delay: number }) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((value / maxValue) * totalBlocks);

  return (
    <div className="flex gap-[2px] sm:gap-[3px]">
      {Array.from({ length: totalBlocks }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
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

function StatRows({ stats, onStatClick }: { stats: Stat[]; onStatClick?: (id: string) => void }) {
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const toggleTip = (label: string) => {
    setActiveTip((prev) => (prev === label ? null : label));
  };

  return (
    <div className="space-y-3 sm:space-y-4 mb-10">
      {stats.map((stat, i) => {
        const isOpen = activeTip === stat.label;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-2 sm:gap-4 group/stat relative cursor-help select-none"
            onClick={() => { toggleTip(stat.label); if (stat.id && onStatClick) onStatClick(stat.id); }}
          >
            <div className="font-mono text-xs sm:text-sm text-cream/60 w-8 sm:w-10 text-right shrink-0">
              {stat.label}
            </div>
            <PixelBar value={stat.value} maxValue={stat.maxValue} color={stat.color} delay={0.1 * i} />
            <div className="font-mono text-xs shrink-0 w-6 text-right" style={{ color: stat.color }}>
              {stat.value}
            </div>
            {/* Tooltip — centered over the full row */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
              bg-stage-dark border border-gold/30 whitespace-nowrap
              pointer-events-none transition-opacity duration-200 z-20
              ${isOpen ? 'opacity-100' : 'opacity-0 group-hover/stat:opacity-100'}`}>
              <div className="font-mono text-[10px] sm:text-xs text-gold tracking-wider">{stat.fullName}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                border-l-4 border-r-4 border-t-4
                border-l-transparent border-r-transparent border-t-gold/30" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const programmingImages = [
  { src: '/easter-eggs/Maratona1.jpg', caption: 'Maratona de Programação — os tempos de ICPC' },
  { src: '/easter-eggs/Maratona2.jpeg', caption: 'Quando o código compilava de primeira era milagre' },
];

const petsImages = [
  { src: '/easter-eggs/Rick.jpg', caption: 'Rick — o companheiro de todas as horas' },
  { src: '/easter-eggs/Mel.jpg', caption: 'Mel — a princesa da casa' },
  { src: '/easter-eggs/RickMelHalloween.jpg', caption: 'Halloween com a dupla!' },
];

export function CharacterSheet() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { unlock } = useEasterEggs();
  const [lightbox, setLightbox] = useState<{ images: { src: string; caption?: string }[]; title: string } | null>(null);
  const [cosplayOpen, setCosplayOpen] = useState(false);

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.5em] uppercase mb-4">
          — Ato I —
        </div>
        <h2 className="font-display text-5xl md:text-7xl font-bold italic text-gold">
          O Protagonista
        </h2>
        <p className="font-body text-cream/50 text-sm mt-4 max-w-md mx-auto italic">
          "Toda grande história precisa de um herói com talentos diversos e apetite por aventura"
        </p>
      </motion.div>

      {/* Character card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative border border-gold/20 bg-stage-dark/80 backdrop-blur-sm p-5 sm:p-8 md:p-12"
          style={{ animation: isInView ? 'pulse-glow 4s ease-in-out infinite' : 'none' }}>
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-10">
            <div className="min-w-0">
              <div className="font-mono text-neon-cyan text-xs tracking-[0.3em] mb-1">JOGADOR UM</div>
              <h3
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream italic cursor-pointer
                  hover:text-gold/90 transition-colors"
                onClick={() => { unlock('cosplay'); setCosplayOpen(true); }}
              >
                Pedro Sereno
              </h3>
              <div className="font-mono text-gold/60 text-[10px] sm:text-xs mt-2 tracking-wider leading-relaxed">
                <span>CLASSE: Dev / Gamer / Pai de Pet</span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
                <span>NVL: 29 → 30</span>
              </div>
            </div>
            <div className="font-mono text-right shrink-0">
              <div className="text-neon-magenta text-xl sm:text-3xl font-bold" style={{
                textShadow: '0 0 10px rgba(247, 37, 133, 0.5)',
              }}>XP MAX</div>
              <div className="text-cream/40 text-[10px] sm:text-xs">LEVEL UP IMINENTE</div>
            </div>
          </div>

          {/* Stats */}
          <StatRows stats={stats} onStatClick={(id) => {
            if (id === 'programming') {
              unlock('programming');
              setLightbox({ images: programmingImages, title: '💻 Era Competitiva' });
            }
          }} />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-10" />

          {/* Traits grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {traits.map((trait, i) => (
              <motion.div
                key={trait.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(212, 168, 67, 0.1)' }}
                className={`border border-gold/10 p-4 transition-colors ${trait.id ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={trait.id === 'pets' ? () => {
                  unlock('pets');
                  setLightbox({ images: petsImages, title: '🐶 Rick & 🍯 Mel' });
                } : undefined}
              >
                <div className="text-2xl mb-2">{trait.icon}</div>
                <div className="font-mono text-sm text-gold font-bold">{trait.label}</div>
                <div className="font-body text-cream/40 text-xs mt-1 italic" dangerouslySetInnerHTML={{ __html: trait.desc }} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cosplay easter egg — YouTube embed + photos */}
      {cosplayOpen && (
        <EasterEggLightbox
          open={true}
          onClose={() => setCosplayOpen(false)}
          images={[
            { src: '/easter-eggs/Cosplay3.jpg', caption: 'Akatsuki — Naruto' },
            { src: '/easter-eggs/Cosplay1.jpg', caption: 'Shino Aburame — KHR' },
            { src: '/easter-eggs/Cosplay2.jpg', caption: 'Arrancar — Bleach' },
          ]}
          title="⚡ Alter Ego · Cosplay"
          videoUrl="https://www.youtube.com/embed/KSUa-BNxhaU"
        />
      )}

      {/* Programming / Pets lightbox */}
      {lightbox && (
        <EasterEggLightbox
          open={true}
          onClose={() => setLightbox(null)}
          images={lightbox.images}
          title={lightbox.title}
        />
      )}
    </section>
  );
}
