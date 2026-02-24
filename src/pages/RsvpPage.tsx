import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { getRsvp, updateRsvp as updateRsvpFn } from '@/server/rsvp';
import type { RsvpPublic, PlusOne } from '@/server/rsvp';

type PageState = 'loading' | 'view' | 'editing' | 'saving' | 'not-found';

const emptyPlusOne = (): PlusOne => ({ name: '', email: '' });

export function RsvpPage({ id }: { id: string }) {
  const [state, setState] = useState<PageState>('loading');
  const [rsvp, setRsvp] = useState<RsvpPublic | null>(null);
  const [editName, setEditName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editFood, setEditFood] = useState('');
  const [editPlusOnes, setEditPlusOnes] = useState<PlusOne[]>([]);
  const [toast, setToast] = useState('');

  const syncEditFields = (data: RsvpPublic) => {
    setEditName(data.name);
    setEditMessage(data.message);
    setEditFood(data.foodRestrictions || '');
    setEditPlusOnes(data.plusOnes?.length ? data.plusOnes : []);
  };

  useEffect(() => {
    if (!id) return;
    getRsvp({ data: { id } })
      .then((data) => {
        if (!data) { setState('not-found'); return; }
        setRsvp(data);
        syncEditFields(data);
        setState('view');
        try { localStorage.setItem('level30_rsvp_id', id); } catch {}
      })
      .catch(() => setState('not-found'));
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const doUpdate = async (updates: Record<string, unknown>) => {
    setState('saving');
    try {
      const entry = await updateRsvpFn({ data: { id, ...updates } });

      setRsvp(entry);
      syncEditFields(entry);
      setState('view');

      if (updates.status === 'confirmed') showToast('Presença re-confirmada! 🎉');
      else if (updates.status === 'cancelled') showToast('Resposta atualizada 😢');
      else showToast('Dados atualizados! ✨');
    } catch {
      showToast('Erro ao salvar. Tenta de novo!');
      setState('view');
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    doUpdate({
      name: editName.trim(),
      message: editMessage.trim(),
      foodRestrictions: editFood.trim(),
      plusOnes: editPlusOnes.filter((p) => p.name.trim().length > 0),
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grain-overlay min-h-screen bg-stage-black relative">
      {/* Background effects */}
      <div className="absolute top-20 left-1/4 spotlight opacity-20" />
      <div className="absolute bottom-20 right-1/4 spotlight opacity-15" style={{ animationDelay: '-3s' }} />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50
              bg-stage-dark border border-gold/30 px-6 py-3
              font-mono text-sm text-gold shadow-[0_0_30px_rgba(212,168,67,0.2)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-block no-underline group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎭</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold italic text-gold">
              Level 30
            </h1>
            <p className="font-mono text-cream/30 text-xs tracking-[0.3em] mt-1">PEDRO SERENO</p>
          </Link>
        </motion.div>

        {/* Loading */}
        {state === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-4xl inline-block mb-4"
            >
              🎭
            </motion.div>
            <p className="font-mono text-cream/40 text-sm">Carregando seu convite...</p>
          </motion.div>
        )}

        {/* Not Found */}
        {state === 'not-found' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="font-display text-3xl text-cream/60 font-bold italic mb-4">
              Convite Não Encontrado
            </h2>
            <p className="font-body text-cream/30 italic mb-8">
              Esse link parece inválido ou expirou.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 border border-gold/30 text-gold font-mono text-sm
                hover:bg-gold/10 transition-all no-underline"
            >
              ← Voltar ao Início
            </Link>
          </motion.div>
        )}

        {/* View / Edit RSVP */}
        {(state === 'view' || state === 'editing' || state === 'saving') && rsvp && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Status badge */}
            <div className="text-center mb-8">
              <span className={`inline-block px-4 py-1.5 font-mono text-xs tracking-[0.2em] uppercase border
                ${rsvp.status === 'confirmed'
                  ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5'
                  : 'border-neon-magenta/40 text-neon-magenta bg-neon-magenta/5'
                }`}>
                {rsvp.status === 'confirmed' ? '✓ Presença Confirmada' : '✗ Não Vai'}
              </span>
            </div>

            {/* RSVP Card */}
            <div className="relative border border-gold/20 bg-stage-dark/80 backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold/40" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold/40" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold/40" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold/40" />

              <div className="p-8 md:p-10">
                <AnimatePresence mode="wait">
                  {state === 'editing' ? (
                    /* Edit mode */
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.3em] uppercase mb-6 text-center">
                        Editar Convite
                      </div>

                      <div className="mb-5">
                        <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">Nome</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                            px-4 py-3 focus:outline-none focus:border-gold/60 transition-all"
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">Recado</label>
                        <textarea
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          rows={3}
                          className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                            px-4 py-3 resize-none focus:outline-none focus:border-gold/60 transition-all"
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                          Restrições Alimentares
                        </label>
                        <input
                          type="text"
                          value={editFood}
                          onChange={(e) => setEditFood(e.target.value)}
                          placeholder="Vegetariano, sem glúten, alergia a..."
                          className="w-full bg-transparent border border-gold/20 text-cream font-body text-base
                            px-4 py-3 placeholder:text-cream/20 focus:outline-none focus:border-gold/60 transition-all"
                        />
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-mono text-xs text-gold/60 tracking-wider uppercase">
                            Acompanhantes
                          </label>
                          {editPlusOnes.length < 3 && (
                            <button
                              type="button"
                              onClick={() => setEditPlusOnes([...editPlusOnes, emptyPlusOne()])}
                              className="font-mono text-[10px] text-neon-cyan/60 tracking-wider cursor-pointer
                                hover:text-neon-cyan transition-colors"
                            >
                              + Adicionar
                            </button>
                          )}
                        </div>
                        {editPlusOnes.length === 0 && (
                          <button
                            type="button"
                            onClick={() => setEditPlusOnes([emptyPlusOne()])}
                            className="w-full py-3 border border-dashed border-gold/15 text-cream/25 font-mono text-xs
                              cursor-pointer hover:border-gold/30 hover:text-cream/40 transition-all"
                          >
                            Adicionar acompanhante
                          </button>
                        )}
                        <div className="space-y-3">
                          {editPlusOnes.map((p, idx) => (
                            <div key={idx} className="border border-gold/10 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-[10px] text-gold/40 tracking-wider">
                                  ACOMPANHANTE {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditPlusOnes(editPlusOnes.filter((_, i) => i !== idx))}
                                  className="font-mono text-[10px] text-cream/20 cursor-pointer hover:text-neon-magenta transition-colors"
                                >
                                  Remover
                                </button>
                              </div>
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => {
                                  const updated = [...editPlusOnes];
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                  setEditPlusOnes(updated);
                                }}
                                placeholder="Nome"
                                className="w-full bg-transparent border border-gold/15 text-cream font-body text-sm
                                  px-3 py-2 mb-2 placeholder:text-cream/20 focus:outline-none focus:border-gold/40 transition-all"
                              />
                              <input
                                type="email"
                                value={p.email}
                                onChange={(e) => {
                                  const updated = [...editPlusOnes];
                                  updated[idx] = { ...updated[idx], email: e.target.value };
                                  setEditPlusOnes(updated);
                                }}
                                placeholder="E-mail (opcional)"
                                className="w-full bg-transparent border border-gold/15 text-cream font-body text-sm
                                  px-3 py-2 placeholder:text-cream/20 focus:outline-none focus:border-gold/40 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-6 py-3 border-2 border-gold text-gold font-display text-lg italic font-bold
                            cursor-pointer hover:bg-gold hover:text-stage-black transition-all"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            syncEditFields(rsvp);
                            setState('view');
                          }}
                          className="px-6 py-3 border border-cream/15 text-cream/30 font-mono text-sm
                            cursor-pointer hover:border-cream/30 hover:text-cream/50 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* View mode */
                    <motion.div
                      key="view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-6">
                        <div>
                          <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mb-1">Nome</div>
                          <div className="font-display text-3xl text-cream font-bold italic">{rsvp.name}</div>
                        </div>

                        <div>
                          <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mb-1">E-mail</div>
                          <div className="font-body text-cream/60">{rsvp.email}</div>
                        </div>

                        {rsvp.message && (
                          <div>
                            <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mb-1">Recado</div>
                            <div className="font-body text-cream/60 italic">"{rsvp.message}"</div>
                          </div>
                        )}

                        {rsvp.foodRestrictions && (
                          <div>
                            <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mb-1">Restrições Alimentares</div>
                            <div className="font-body text-cream/60">{rsvp.foodRestrictions}</div>
                          </div>
                        )}

                        {rsvp.plusOnes && rsvp.plusOnes.length > 0 && (
                          <div>
                            <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mb-2">
                              Acompanhante{rsvp.plusOnes.length > 1 ? 's' : ''}
                            </div>
                            <div className="space-y-2">
                              {rsvp.plusOnes.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-3 border border-gold/10 px-3 py-2">
                                  <span className="font-body text-cream/60">{p.name}</span>
                                  {p.email && (
                                    <span className="font-mono text-cream/30 text-xs">{p.email}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

                        <div className="flex justify-between text-cream/20 font-mono text-[10px] tracking-wider">
                          <span>Confirmado em {formatDate(rsvp.createdAt)}</span>
                          {rsvp.updatedAt !== rsvp.createdAt && (
                            <span>Atualizado em {formatDate(rsvp.updatedAt)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-8 space-y-3">
                        <button
                          onClick={() => setState('editing')}
                          className="w-full px-6 py-3 border border-gold/20 text-gold/70 font-mono text-sm
                            cursor-pointer hover:bg-gold/10 hover:text-gold hover:border-gold/40 transition-all"
                        >
                          ✏️ Editar Dados
                        </button>

                        {rsvp.status === 'confirmed' ? (
                          <button
                            onClick={() => doUpdate({ status: 'cancelled' })}
                            disabled={state === 'saving'}
                            className="w-full px-6 py-3 border border-neon-magenta/20 text-neon-magenta/60 font-mono text-sm
                              cursor-pointer hover:bg-neon-magenta/10 hover:text-neon-magenta hover:border-neon-magenta/40
                              transition-all disabled:opacity-50"
                          >
                            😢 Não vou conseguir ir
                          </button>
                        ) : (
                          <button
                            onClick={() => doUpdate({ status: 'confirmed' })}
                            disabled={state === 'saving'}
                            className="w-full px-6 py-3 border-2 border-gold text-gold font-display text-lg italic font-bold
                              cursor-pointer hover:bg-gold hover:text-stage-black transition-all disabled:opacity-50"
                          >
                            🎉 Mudei de ideia, eu vou!
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Event reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 border border-gold/10 bg-stage-dark/40 p-6 text-center"
            >
              <div className="font-mono text-xs text-gold/40 tracking-[0.3em] uppercase mb-2">Evento</div>
              <div className="font-display text-xl text-cream italic">Sábado, 14 de Março de 2026</div>
              <div className="font-mono text-cream/30 text-xs mt-1">Mais detalhes em breve</div>
            </motion.div>

            {/* Back to main */}
            <div className="text-center mt-8">
              <Link
                to="/"
                className="font-mono text-xs text-cream/20 hover:text-cream/40 transition-colors no-underline"
              >
                ← Voltar ao convite principal
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
