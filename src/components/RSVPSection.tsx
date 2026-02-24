import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitRsvp } from '@/server/rsvp';
import type { PlusOne } from '@/server/rsvp';
import { PlatinumBadge } from './PlatinumBadge';
import { useEasterEggs } from '@/hooks/useEasterEggs';

type RsvpState = 'idle' | 'form' | 'submitting' | 'confirmed' | 'declined' | 'duplicate';

const emptyPlusOne = (): PlusOne => ({ name: '', email: '' });

export function RSVPSection() {
  const [state, setState] = useState<RsvpState>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [foodRestrictions, setFoodRestrictions] = useState('');
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);
  const [error, setError] = useState('');
  const [rsvpId, setRsvpId] = useState('');
  const [existingId, setExistingId] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const { found } = useEasterEggs();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Coloca seu nome aí! 😄');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Preciso do seu e-mail pra enviar a confirmação! 📧');
      return;
    }

    setError('');
    setState('submitting');

    try {
      const result = await submitRsvp({
        data: {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          foodRestrictions: foodRestrictions.trim(),
          plusOnes: plusOnes.filter((p) => p.name.trim().length > 0),
          trophies: [...found],
          website,
        },
      });

      if (result.duplicate) {
        setExistingId(result.existingId!);
        setState('duplicate');
        return;
      }

      setRsvpId(result.id!);
      try { localStorage.setItem('level30_rsvp_id', result.id!); } catch {}
      setState('confirmed');
    } catch {
      setError('Ops, algo deu errado. Tenta de novo!');
      setState('form');
    }
  };

  const rsvpUrl = rsvpId ? `${window.location.origin}/rsvp/${rsvpId}` : '';
  const existingUrl = existingId ? `${window.location.origin}/rsvp/${existingId}` : '';

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

      {/* Platinum badge — only shows if all easter eggs found */}
      <PlatinumBadge />

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

        {/* === FORM: Collect name + email + message === */}
        {(state === 'form' || state === 'submitting') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="relative border border-gold/20 bg-stage-dark/80 backdrop-blur-sm p-8 md:p-10">
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

              {/* Email field */}
              <div className="mb-5">
                <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                  Seu E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="seu@email.com"
                  disabled={state === 'submitting'}
                  className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                    px-4 py-3 placeholder:text-cream/20
                    focus:outline-none focus:border-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)]
                    transition-all duration-300 disabled:opacity-50"
                />
                <p className="font-mono text-cream/20 text-[10px] mt-1.5 tracking-wide">
                  Vamos enviar uma confirmação e o link do seu convite
                </p>
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

              {/* Food restrictions */}
              <div className="mb-6">
                <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                  Restrições Alimentares <span className="text-cream/20">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={foodRestrictions}
                  onChange={(e) => setFoodRestrictions(e.target.value)}
                  placeholder="Vegetariano, sem glúten, alergia a..."
                  disabled={state === 'submitting'}
                  className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                    px-4 py-3 placeholder:text-cream/20
                    focus:outline-none focus:border-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)]
                    transition-all duration-300 disabled:opacity-50"
                />
              </div>

              {/* Plus ones */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-gold/60 tracking-wider uppercase">
                    Acompanhantes <span className="text-cream/20">(opcional)</span>
                  </label>
                  {plusOnes.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setPlusOnes([...plusOnes, emptyPlusOne()])}
                      disabled={state === 'submitting'}
                      className="font-mono text-[10px] text-neon-cyan/60 tracking-wider cursor-pointer
                        hover:text-neon-cyan transition-colors disabled:opacity-50"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
                {plusOnes.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setPlusOnes([emptyPlusOne()])}
                    disabled={state === 'submitting'}
                    className="w-full py-3 border border-dashed border-gold/15 text-cream/25 font-mono text-xs
                      cursor-pointer hover:border-gold/30 hover:text-cream/40 transition-all disabled:opacity-50"
                  >
                    Vai trazer alguém? Clique aqui
                  </button>
                )}
                <div className="space-y-3">
                  {plusOnes.map((p, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border border-gold/10 p-3 relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-gold/40 tracking-wider">
                          ACOMPANHANTE {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPlusOnes(plusOnes.filter((_, i) => i !== idx))}
                          className="font-mono text-[10px] text-cream/20 cursor-pointer hover:text-neon-magenta transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...plusOnes];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setPlusOnes(updated);
                        }}
                        placeholder="Nome"
                        disabled={state === 'submitting'}
                        className="w-full bg-transparent border border-gold/15 text-cream font-body text-sm
                          px-3 py-2 mb-2 placeholder:text-cream/20
                          focus:outline-none focus:border-gold/40 transition-all disabled:opacity-50"
                      />
                      <input
                        type="email"
                        value={p.email}
                        onChange={(e) => {
                          const updated = [...plusOnes];
                          updated[idx] = { ...updated[idx], email: e.target.value };
                          setPlusOnes(updated);
                        }}
                        placeholder="E-mail (opcional)"
                        disabled={state === 'submitting'}
                        className="w-full bg-transparent border border-gold/15 text-cream font-body text-sm
                          px-3 py-2 placeholder:text-cream/20
                          focus:outline-none focus:border-gold/40 transition-all disabled:opacity-50"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Honeypot — invisible to humans, bots fill it */}
              <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 overflow-hidden pointer-events-none"
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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
              Enviamos uma confirmação pro seu e-mail 📧
            </p>
            <div className="font-mono text-neon-cyan text-sm tracking-wider mt-6"
              style={{ animation: 'neon-flicker 4s infinite' }}>
              &gt; JOGADOR <span className="uppercase">{name}</span> ENTROU NA PARTY
            </div>

            {/* Link to personal RSVP page */}
            {rsvpUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-10 max-w-md mx-auto"
              >
                <div className="border border-gold/15 bg-stage-dark/60 p-6">
                  <p className="font-mono text-xs text-gold/50 tracking-wider uppercase mb-3">
                    Seu link pessoal do convite
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={rsvpUrl}
                      className="flex-1 bg-transparent border border-gold/10 text-neon-cyan/80 font-mono text-xs
                        px-3 py-2 focus:outline-none select-all truncate"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(rsvpUrl)}
                      className="px-3 py-2 border border-gold/20 text-gold/60 font-mono text-xs
                        cursor-pointer hover:bg-gold/10 hover:text-gold transition-all shrink-0"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="font-mono text-cream/20 text-[10px] mt-2">
                    Use este link para alterar sua resposta a qualquer momento
                  </p>
                </div>
              </motion.div>
            )}

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

        {/* === DUPLICATE EMAIL === */}
        {state === 'duplicate' && (
          <motion.div
            key="duplicate"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">📧</div>
            <h3 className="font-display text-4xl md:text-5xl text-gold font-bold italic mb-4">
              Você Já Confirmou!
            </h3>
            <p className="font-body text-cream/50 italic text-lg mb-6">
              Esse e-mail já está na lista. Quer atualizar sua resposta?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={existingUrl}
                className="px-8 py-4 border-2 border-gold text-gold font-display text-lg italic font-bold
                  hover:bg-gold hover:text-stage-black transition-all duration-300 no-underline"
              >
                Acessar Meu Convite →
              </a>
              <button
                onClick={() => { setState('idle'); setError(''); setEmail(''); }}
                className="font-mono text-sm text-cream/40 cursor-pointer hover:text-cream/60 transition-colors"
              >
                Usar outro e-mail
              </button>
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
