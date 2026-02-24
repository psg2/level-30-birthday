import { motion } from 'motion/react';
import { useState } from 'react';
import { Player2Card } from './Player2Card';
import { EasterEggLightbox } from './EasterEggLightbox';
import { RagnarokPlayer } from './RagnarokPlayer';
import { useEasterEggs } from '@/hooks/useEasterEggs';

interface MilestoneLink {
  label: string;
  url: string;
  icon: string;
}

interface Milestone {
  age: string;
  title: string;
  subtitle: string;
  icon: string;
  id?: string;
  links?: MilestoneLink[];
}

const milestones: Milestone[] = [
  { age: '0', title: 'Jogador Entrou no Game', subtitle: 'Um Pedro selvagem apareceu!', icon: '👶' },
  { age: '5', title: 'Primeira Quest: Nintendo', subtitle: 'O vício em jogos começa aqui', icon: '🎮', id: 'nintendo' },
  { age: '10', title: 'Ragnarök Online', subtitle: 'Novice → Thief → Rogue', icon: '⚔️', id: 'ragnarok' },
  { age: '12', title: 'Anime & Cosplay', subtitle: 'Desbloqueou skill: cultura otaku', icon: '⚡', id: 'cosplay' },
  { age: '14', title: 'Jogador de LoL', subtitle: 'Ranked, tilts e pentakills', icon: '🏆', links: [
    { label: 'Twitch', url: 'https://www.twitch.tv/videos/47021114', icon: '📺' },
    { label: 'Facebook', url: 'https://www.facebook.com/share/p/1BTyUk5fn7/', icon: '👤' },
  ], id: 'lol' },
  { age: '18', title: 'Nova Árvore de Habilidade: Código', subtitle: 'Hello, World!', icon: '💻', id: 'programming' },
  { age: '21', title: 'Rato de Academia', subtitle: 'Buff de stamina ativado', icon: '🏋️' },
  { age: '21', title: 'Encontrou o Amor', subtitle: 'Cléa entrou na party como Player 2', icon: '❤️', id: 'clea' },
  { age: '25', title: 'Pai de Pet', subtitle: 'Rick e Mel entram na party', icon: '🐕', id: 'pets' },
  { age: '26', title: 'Vício em Board Games', subtitle: 'Tudo começou com Splendor', icon: '🎲', id: 'boardgames' },
  { age: '28', title: 'Amante do Teatro', subtitle: 'Uma nova paixão entra em cena', icon: '🎭', id: 'teatro' },
  { age: '30', title: 'FASE DO CHEFÃO', subtitle: 'A aventura está apenas começando...', icon: '🔥' },
];

// Easter egg content per ID
const easterEggImages: Record<string, { images: { src: string; caption?: string }[]; title: string }> = {
  pets: {
    title: '🐶 Rick & 🍯 Mel',
    images: [
      { src: '/easter-eggs/Rick.jpg', caption: 'Rick — o companheiro de todas as horas' },
      { src: '/easter-eggs/Mel.jpg', caption: 'Mel — a princesa da casa' },
      { src: '/easter-eggs/RickMelHalloween.jpg', caption: 'Halloween com a dupla!' },
    ],
  },
  // Placeholder entries — will be filled when photos arrive
  nintendo: {
    title: '🎮 Primeiras Quests',
    images: [],
  },
  cosplay: {
    title: '⚡ Alter Ego',
    images: [],
  },
  programming: {
    title: '💻 Era Competitiva',
    images: [],
  },
  boardgames: {
    title: '🎲 A Coleção',
    images: [],
  },
  teatro: {
    title: '🎭 Acervo Teatral',
    images: [],
  },
};

// IDs that open a lightbox (have images)
const lightboxIds = new Set(Object.keys(easterEggImages));
// IDs that open special modals
const specialIds = new Set(['clea', 'ragnarok']);
// IDs that reveal links inline
const linkIds = new Set(['lol']);

export function TimelineSection() {
  const [player2Open, setPlayer2Open] = useState(false);
  const [ragnarokOpen, setRagnarokOpen] = useState(false);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [revealedLinks, setRevealedLinks] = useState<Set<string>>(new Set());
  const { unlock } = useEasterEggs();

  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      {/* Background theatrical element */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.5em] uppercase mb-4">
          — Ato II —
        </div>
        <h2 className="font-display text-5xl md:text-7xl font-bold italic text-gold">
          A Jornada
        </h2>
        <p className="font-body text-cream/50 text-sm mt-4 max-w-lg mx-auto italic">
          "Três décadas de missões, conquistas e pontos de experiência"
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto relative">
        {/* Central line */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0 origin-top"
        />

        {milestones.map((milestone, i) => {
          const isLeft = i % 2 === 0;
          const isBoss = i === milestones.length - 1;

          return (
            <motion.div
              key={milestone.age}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`relative flex items-center mb-12 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex-row`}
            >
              {/* Node on timeline */}
              <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 z-10
                ${isBoss ? 'w-6 h-6' : 'w-3 h-3'}
                rounded-full border-2
                ${isBoss ? 'border-neon-magenta bg-neon-magenta/30' : 'border-gold bg-gold/20'}
              `}
                style={isBoss ? {
                  boxShadow: '0 0 20px rgba(247, 37, 133, 0.5), 0 0 40px rgba(247, 37, 133, 0.2)',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                } : {}}
              />

              {/* Content card */}
              <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
              }`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={
                    milestone.id
                      ? () => {
                          const id = milestone.id!;
                          if (id === 'clea') {
                            setPlayer2Open(true);
                          } else if (id === 'ragnarok') {
                            setRagnarokOpen(true);
                          } else if (linkIds.has(id)) {
                            setRevealedLinks((prev) => { const next = new Set(prev); next.add(id); return next; });
                          } else if (lightboxIds.has(id)) {
                            if (easterEggImages[id].images.length > 0) setLightboxId(id);
                          }
                          unlock(id);
                        }
                      : undefined
                  }
                  className={`p-5 border ${
                    isBoss
                      ? 'border-neon-magenta/40 bg-neon-magenta/5'
                      : milestone.id === 'clea'
                        ? 'border-neon-magenta/20 bg-stage-dark/60 cursor-pointer hover:border-neon-magenta/50 hover:bg-neon-magenta/5'
                        : milestone.id
                          ? 'border-gold/10 bg-stage-dark/60 cursor-pointer hover:border-gold/30'
                          : 'border-gold/10 bg-stage-dark/60 hover:border-gold/30'
                  } backdrop-blur-sm transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2"
                    style={{ flexDirection: isLeft ? 'row-reverse' : 'row' }}>
                    <span className="text-2xl">{milestone.icon}</span>
                    <div className={`font-mono text-xs tracking-[0.2em] ${
                      isBoss ? 'text-neon-magenta' : 'text-neon-cyan/60'
                    }`}>
                      {isBoss ? '>>> IDADE' : 'IDADE'} {milestone.age}
                    </div>
                  </div>
                  <h3 className={`font-display text-xl font-bold italic ${
                    isBoss ? 'text-neon-magenta' : 'text-cream'
                  }`}
                    style={isBoss ? {
                      textShadow: '0 0 20px rgba(247, 37, 133, 0.4)',
                    } : {}}>
                    {milestone.title}
                  </h3>
                  <p className="font-body text-cream/40 text-sm mt-1 italic">
                    {milestone.subtitle}
                  </p>
                  {milestone.links && milestone.id && revealedLinks.has(milestone.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 mt-3 pt-3 border-t border-gold/10 flex-wrap"
                      style={{ justifyContent: isLeft ? 'flex-end' : 'flex-start' }}
                    >
                      <span className="font-mono text-[10px] text-neon-cyan/40 tracking-widest">🔓 PROVAS</span>
                      {milestone.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[10px] text-neon-cyan/50 hover:text-neon-cyan
                            border border-neon-cyan/20 hover:border-neon-cyan/50 px-2 py-0.5
                            transition-all no-underline hover:bg-neon-cyan/5"
                        >
                          {link.icon} {link.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                  {milestone.id === 'clea' && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="font-mono text-[10px] text-neon-magenta/50 mt-2 tracking-widest"
                    >
                      ▸ TOQUE PARA VER PLAYER 2
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Player2Card open={player2Open} onClose={() => setPlayer2Open(false)} />
      <RagnarokPlayer open={ragnarokOpen} onClose={() => setRagnarokOpen(false)} />
      {lightboxId && easterEggImages[lightboxId] && (
        <EasterEggLightbox
          open={true}
          onClose={() => setLightboxId(null)}
          images={easterEggImages[lightboxId].images}
          title={easterEggImages[lightboxId].title}
        />
      )}
    </section>
  );
}
