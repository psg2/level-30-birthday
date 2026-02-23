import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { listRsvps } from '@/server/rsvp'
import type { RsvpEntry } from '@/server/rsvp'

type ViewState = 'auth' | 'loading' | 'ready' | 'error'
type Filter = 'all' | 'confirmed' | 'cancelled'

export function AdminPage() {
  const [viewState, setViewState] = useState<ViewState>('auth')
  const [key, setKey] = useState('')
  const [authError, setAuthError] = useState('')
  const [guests, setGuests] = useState<RsvpEntry[]>([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 })
  const [filter, setFilter] = useState<Filter>('all')

  const loadGuests = useCallback(async (adminKey: string) => {
    setViewState('loading')
    try {
      const result = await listRsvps({ data: { key: adminKey } })
      setGuests(result.guests)
      setStats({ total: result.total, confirmed: result.confirmed, cancelled: result.cancelled })
      setViewState('ready')
      sessionStorage.setItem('admin_key', adminKey)
    } catch {
      setAuthError('Chave inválida')
      setViewState('auth')
      sessionStorage.removeItem('admin_key')
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key')
    if (saved) loadGuests(saved)
  }, [loadGuests])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!key.trim()) { setAuthError('Digite a chave'); return }
    loadGuests(key.trim())
  }

  const filteredGuests = guests.filter((g) => {
    if (filter === 'confirmed') return g.status === 'confirmed'
    if (filter === 'cancelled') return g.status === 'cancelled'
    return true
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="grain-overlay min-h-screen bg-stage-black relative">
      <div className="absolute top-20 left-1/4 spotlight opacity-15" />
      <div className="absolute bottom-20 right-1/4 spotlight opacity-10" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block no-underline group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎭</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold italic text-gold">Level 30</h1>
            <p className="font-mono text-cream/30 text-xs tracking-[0.3em] mt-1">PAINEL DO ANIVERSARIANTE</p>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {/* === AUTH GATE === */}
          {viewState === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-sm mx-auto"
            >
              <form onSubmit={handleAuth}>
                <div className="border border-gold/20 bg-stage-dark/80 p-8">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold/40" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold/40" />

                  <div className="font-mono text-neon-cyan/60 text-xs tracking-[0.3em] uppercase mb-6 text-center">
                    Acesso Restrito
                  </div>

                  <label className="block font-mono text-xs text-gold/60 tracking-wider mb-2 uppercase">
                    Chave de Admin
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => { setKey(e.target.value); setAuthError('') }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-transparent border border-gold/20 text-cream font-mono text-base
                      px-4 py-3 placeholder:text-cream/20
                      focus:outline-none focus:border-gold/60 transition-all mb-4"
                  />

                  {authError && (
                    <p className="font-mono text-neon-magenta text-xs text-center mb-4">{authError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full px-6 py-3 border-2 border-gold text-gold font-display text-lg italic font-bold
                      cursor-pointer hover:bg-gold hover:text-stage-black transition-all"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* === LOADING === */}
          {viewState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl inline-block mb-4"
              >🎭</motion.div>
              <p className="font-mono text-cream/40 text-sm">Carregando lista de convidados...</p>
            </motion.div>
          )}

          {/* === GUEST LIST === */}
          {viewState === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { label: 'Total', value: stats.total, color: 'text-cream' },
                  { label: 'Confirmados', value: stats.confirmed, color: 'text-neon-cyan' },
                  { label: 'Cancelados', value: stats.cancelled, color: 'text-neon-magenta' },
                ].map((stat) => (
                  <div key={stat.label} className="border border-gold/15 bg-stage-dark/60 p-5 text-center">
                    <div className={`font-mono text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="font-mono text-xs text-gold/40 tracking-wider uppercase mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-6">
                {([
                  { key: 'all' as Filter, label: `Todos (${stats.total})` },
                  { key: 'confirmed' as Filter, label: `Confirmados (${stats.confirmed})` },
                  { key: 'cancelled' as Filter, label: `Cancelados (${stats.cancelled})` },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 font-mono text-xs tracking-wider uppercase border cursor-pointer transition-all
                      ${filter === tab.key
                        ? 'border-gold/40 text-gold bg-gold/10'
                        : 'border-gold/10 text-cream/30 hover:border-gold/20 hover:text-cream/50'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Guest list */}
              {filteredGuests.length === 0 ? (
                <div className="text-center py-16 border border-gold/10 bg-stage-dark/40">
                  <div className="text-4xl mb-4">🎭</div>
                  <p className="font-body text-cream/30 italic">Nenhum convidado nesta categoria</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGuests.map((guest, i) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border border-gold/10 bg-stage-dark/60 hover:border-gold/25 transition-all group"
                    >
                      <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status indicator + Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            guest.status === 'confirmed'
                              ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,245,212,0.5)]'
                              : 'bg-neon-magenta shadow-[0_0_8px_rgba(247,37,133,0.5)]'
                          }`} />
                          <div className="min-w-0">
                            <div className="font-display text-lg text-cream font-bold italic truncate">
                              {guest.name}
                            </div>
                            <div className="font-mono text-xs text-cream/30 truncate">{guest.email}</div>
                          </div>
                        </div>

                        {/* Message */}
                        {guest.message && (
                          <div className="flex-1 min-w-0 md:text-center">
                            <p className="font-body text-cream/40 text-sm italic truncate">
                              "{guest.message}"
                            </p>
                          </div>
                        )}

                        {/* Date + link */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="font-mono text-[10px] text-cream/20 text-right">
                            {formatDate(guest.createdAt)}
                          </div>
                          <a
                            href={`/rsvp/${guest.id}`}
                            target="_blank"
                            rel="noopener"
                            className="font-mono text-xs text-gold/40 border border-gold/15 px-2.5 py-1
                              hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all no-underline"
                          >
                            Ver →
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Refresh + logout */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/10">
                <button
                  onClick={() => { const k = sessionStorage.getItem('admin_key'); if (k) loadGuests(k) }}
                  className="font-mono text-xs text-gold/40 cursor-pointer hover:text-gold transition-colors"
                >
                  ↻ Atualizar lista
                </button>
                <button
                  onClick={() => { sessionStorage.removeItem('admin_key'); setViewState('auth'); setKey('') }}
                  className="font-mono text-xs text-cream/20 cursor-pointer hover:text-cream/40 transition-colors"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
