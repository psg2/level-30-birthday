import { motion } from 'motion/react';
import { useCountdown } from '../hooks/useCountdown';

const partyDate = new Date('2026-03-14T20:00:00');

function CountdownUnit({ value, label }: { value: number; label: string; }) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="relative">
        <div className="font-mono text-3xl sm:text-4xl md:text-6xl text-neon-cyan font-bold tracking-wider"
          style={{
            textShadow: '0 0 10px rgba(0, 245, 212, 0.5), 0 0 30px rgba(0, 245, 212, 0.2)',
          }}>
          {String(value).padStart(2, '0')}
        </div>
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="w-full h-px bg-neon-cyan/50" style={{ animation: 'scanline 3s linear infinite' }} />
        </div>
      </div>
      <div className="font-mono text-[10px] sm:text-xs text-gold/60 tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-1 sm:mt-2">{label}</div>
    </div>
  );
}

export function HeroSection() {
  const timeLeft = useCountdown(partyDate);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Spotlight effects */}
      <div className="spotlight" style={{ top: '20%', left: '30%' }} />
      <div className="spotlight" style={{ top: '60%', right: '20%', animationDelay: '-3s' }} />

      {/* Stage floor gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-stage-charcoal/80 to-transparent" />

      {/* Decorative theater arch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] max-w-5xl">
        <svg viewBox="0 0 800 120" className="w-full opacity-30">
          <path d="M0,120 Q400,-20 800,120" fill="none" stroke="#D4A843" strokeWidth="1.5" />
          <path d="M20,120 Q400,0 780,120" fill="none" stroke="#D4A843" strokeWidth="0.5" />
          {/* Decorative dots along arch */}
          {Array.from({ length: 20 }).map((_, i) => {
            const t = (i + 1) / 21;
            const x = 800 * t;
            const y = 120 - 140 * (1 - (2 * t - 1) ** 2);
            return <circle key={i} cx={x} cy={y} r="2" fill="#D4A843" opacity="0.4" />;
          })}
        </svg>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="relative z-10 text-center"
      >
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-mono text-xs md:text-sm tracking-[0.5em] text-gold/60 uppercase mb-6"
        >
          Você está cordialmente convidado(a) para
        </motion.div>

        {/* Theater masks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="theater-mask text-5xl md:text-6xl mb-4"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          🎭
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-display text-7xl md:text-[10rem] font-black italic leading-[0.85] tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #E8C96A 0%, #D4A843 40%, #F5E6D3 60%, #D4A843 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 30px rgba(212, 168, 67, 0.3))',
          }}
        >
          Level
          <br />
          <span className="text-8xl md:text-[14rem]">30</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-4 md:mt-2"
        >
          <span className="font-mono text-neon-cyan text-sm md:text-base tracking-[0.2em]"
            style={{ animation: 'neon-flicker 5s infinite 2s' }}>
            &gt; JOGADOR_UM: PEDRO SERENO
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="w-64 md:w-96 h-px mx-auto my-8 bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="space-y-2"
        >
          <div className="font-display text-2xl md:text-4xl text-cream font-light italic">
            Sábado, 14 de Março
          </div>
          <div className="font-mono text-gold/80 text-sm tracking-[0.3em]">
            MMXXVI · O ANO DOS TRINTA
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="mt-12 flex gap-3 sm:gap-6 md:gap-10 justify-center px-4"
        >
          <CountdownUnit value={timeLeft.days} label="Dias" />
          <div className="font-mono text-gold/30 text-3xl sm:text-4xl md:text-6xl self-start">:</div>
          <CountdownUnit value={timeLeft.hours} label="Horas" />
          <div className="font-mono text-gold/30 text-3xl sm:text-4xl md:text-6xl self-start">:</div>
          <CountdownUnit value={timeLeft.minutes} label="Min" />
          <div className="font-mono text-gold/30 text-3xl sm:text-4xl md:text-6xl self-start">:</div>
          <CountdownUnit value={timeLeft.seconds} label="Seg" />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-gold/40 text-xs tracking-[0.3em]">DESÇA</span>
          <svg width="20" height="30" viewBox="0 0 20 30" className="text-gold/40">
            <rect x="1" y="1" width="18" height="28" rx="9" fill="none" stroke="currentColor" strokeWidth="1" />
            <motion.circle
              cx="10" cy="10" r="3" fill="currentColor"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
