import { motion } from 'motion/react';

interface Milestone {
  age: string;
  title: string;
  subtitle: string;
  icon: string;
}

const milestones: Milestone[] = [
  { age: '0', title: 'Jogador Entrou no Game', subtitle: 'Um Pedro selvagem apareceu!', icon: '👶' },
  { age: '5', title: 'Tutorial Completo', subtitle: 'Primeiros jogos, primeiras histórias', icon: '🎮' },
  { age: '10', title: 'Missões Secundárias Liberadas', subtitle: 'Esportes, artes e aventuras', icon: '⚡' },
  { age: '15', title: 'Nova Árvore de Habilidade: Código', subtitle: 'Hello, World!', icon: '💻' },
  { age: '20', title: 'Guilda Formada', subtitle: 'Construindo amizades e puxando ferro', icon: '🤝' },
  { age: '25', title: 'Conquista Rara Desbloqueada', subtitle: 'Entusiasta do teatro entra na party', icon: '🎭' },
  { age: '30', title: 'FASE DO CHEFÃO', subtitle: 'A aventura está apenas começando...', icon: '🏆' },
];

export function TimelineSection() {
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
                  className={`p-5 border ${
                    isBoss
                      ? 'border-neon-magenta/40 bg-neon-magenta/5'
                      : 'border-gold/10 bg-stage-dark/60'
                  } backdrop-blur-sm transition-all hover:border-gold/30`}
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
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
