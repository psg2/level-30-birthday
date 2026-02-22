import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type RsvpState = 'idle' | 'form' | 'submitting' | 'confirmed' | 'declined';

export function RSVPSection() {
  const [state, setState] = useState<RsvpState>('idle');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Coloca seu nome aí! 😄');
      return;
    }

    setError('');
    setState('submitting');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (!res.ok) throw new Error('Erro ao enviar');
      setState('confirmed');
    } catch {
      setError('Ops, algo deu errado. Tenta de novo!');
      setState('form');
    }
  };

  return (
    <section className="relative py-24 md:py-40 px-6 overflow-hidden">
      {/* Dramatic spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]
        bg-radial-[at_center] from-gold/5 via-transparent to-transparent rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.5em] uppercase mb-4">
          — Gran Finale —
        </div>
        <h2 className="font-display text-5xl md:text-7xl font-bold italic text-gold">
          Bora pra Festa?
        </h2>
        <p className="font-body text-cream/50 text-sm mt-4 max-w-md mx-auto italic">
          "O palco está montado, as luzes estão prontas. Você vai estar na plateia?"
        </p>
      </motion.div>

      {/* RSVP States */}
      <AnimatePresence mode="wait">
        {/* === IDLE: Yes / No buttons === */}
        {state === 'idle' && (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto"
          >
            <motion.button
              onClick={() => setState('form')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full sm:w-auto px-12 py-5 border-2 border-gold bg-transparent
                font-display text-2xl text-gold italic font-bold tracking-wide
                cursor-pointer transition-all duration-300
                hover:bg-gold hover:text-stage-black hover:shadow-[0_0_40px_rgba(212,168,67,0.4)]"
            >
              ✨ Eu Vou!
            </motion.button>

            <motion.button
              onClick={() => setState('declined')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full sm:w-auto px-12 py-5 border border-cream/20 bg-transparent
                font-display text-xl text-cream/40 italic
                cursor-pointer transition-all duration-300
                hover:border-cream/40 hover:text-cream/60"
            >
              Não Vou Conseguir
            </motion.button>
          </motion.div>
        )}

        {/* === FORM: Collect name + message === */}
        {(state === 'form' || state === 'submitting') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="border border-gold/20 bg-stage-dark/80 backdrop-blur-sm p-8 md:p-10">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold/40" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold/40" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold/40" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold/40" />

              <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.3em] uppercase mb-6 text-center">
                Confirme sua presença
              </div>

              {/* Name field */}
              <div className="mb-5">
                <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Como te chamam?"
                  disabled={state === 'submitting'}
                  className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                    px-4 py-3 placeholder:text-cream/20
                    focus:outline-none focus:border-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)]
                    transition-all duration-300 disabled:opacity-50"
                />
              </div>

              {/* Message field */}
              <div className="mb-6">
                <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                  Recado <span className="text-cream/20">(opcional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Manda um salve pro aniversariante..."
                  rows={3}
                  disabled={state === 'submitting'}
                  className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                    px-4 py-3 placeholder:text-cream/20 resize-none
                    focus:outline-none focus:border-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)]
                    transition-all duration-300 disabled:opacity-50"
                />
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-neon-magenta text-xs text-center mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit + Back */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleSubmit}
                  disabled={state === 'submitting'}
                  whileHover={{ scale: state === 'submitting' ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-8 py-4 border-2 border-gold bg-transparent
                    font-display text-xl text-gold italic font-bold
                    cursor-pointer transition-all duration-300
                    hover:bg-gold hover:text-stage-black hover:shadow-[0_0_40px_rgba(212,168,67,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
                >
                  {state === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                      Enviando...
                    </span>
                  ) : (
                    '🎉 Confirmar Presença'
                  )}
                </motion.button>

                <motion.button
                  onClick={() => { setState('idle'); setError(''); }}
                  disabled={state === 'submitting'}
                  whileHover={{ scale: 1.02 }}
                  className="px-6 py-4 border border-cream/15 text-cream/30 font-mono text-sm
                    cursor-pointer hover:border-cream/30 hover:text-cream/50 transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Voltar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === CONFIRMED === */}
        {state === 'confirmed' && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center"
          >
            <motion.div
              className="text-8xl mb-6"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              🎉
            </motion.div>
            <h3 className="font-display text-4xl md:text-6xl text-gold font-bold italic mb-4">
              Você Tá Dentro!
            </h3>
            <p className="font-body text-cream/50 italic text-lg mb-2">
              Valeu, <span className="text-gold">{name}</span>! O elenco está completo.
            </p>
            <p className="font-body text-cream/40 italic">
              Nos vemos no palco!
            </p>
            <div className="font-mono text-neon-cyan text-sm tracking-wider mt-6"
              style={{ animation: 'neon-flicker 4s infinite' }}>
              &gt; JOGADOR <span className="uppercase">{name}</span> ENTROU NA PARTY
            </div>

            {/* Confetti particles */}
            <div className="relative mt-8 flex justify-center gap-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [0, -120 - Math.random() * 120],
                    x: [(Math.random() - 0.5) * 250],
                    opacity: [1, 0],
                    rotate: [0, Math.random() * 720],
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: ['#D4A843', '#00F5D4', '#F72585', '#7B61FF', '#E8C96A'][i % 5],
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* === DECLINED === */}
        {state === 'declined' && (
          <motion.div
            key="declined"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">🎭</div>
            <h3 className="font-display text-4xl md:text-5xl text-cream/50 font-bold italic mb-4">
              O Show Deve Continuar...
            </h3>
            <p className="font-body text-cream/30 italic text-lg mb-6">
              Vamos sentir sua falta. O holofote não vai brilhar igual.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setState('idle')}
              className="font-mono text-sm text-gold/60 cursor-pointer hover:text-gold transition-colors
                border border-gold/20 px-6 py-2 hover:border-gold/40"
            >
              Pera, deixa eu reconsiderar...
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
