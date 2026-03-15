import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { listRsvps, deleteRsvp, toggleAttendance, addWalkIn, removeWalkIn } from '@/server/rsvp'
import type { RsvpEntry } from '@/server/rsvp'

type ViewState = 'auth' | 'loading' | 'ready' | 'error'
type Filter = 'all' | 'confirmed' | 'cancelled' | 'attended' | 'noshow'

// Cycle: null/undefined → true (attended) → false (no-show) → null (unmarked)
function nextAttendance(current: boolean | null | undefined): boolean | null {
  if (current === null || current === undefined) return true
  if (current === true) return false
  return null
}

function AttendanceBadge({
  attended,
  onClick,
  label,
  small,
}: {
  attended: boolean | null | undefined
  onClick: () => void
  label: string
  small?: boolean
}) {
  const base = small
    ? 'inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[10px] cursor-pointer transition-all select-none'
    : 'inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-xs cursor-pointer transition-all select-none'

  if (attended === true) {
    return (
      <button onClick={onClick} className={`${base} border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan/80 hover:bg-neon-cyan/20`}>
        <span>✓</span>
        <span className="truncate max-w-[120px]">{label}</span>
      </button>
    )
  }
  if (attended === false) {
    return (
      <button onClick={onClick} className={`${base} border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta/70 hover:bg-neon-magenta/20 line-through`}>
        <span>✗</span>
        <span className="truncate max-w-[120px]">{label}</span>
      </button>
    )
  }
  return (
    <button onClick={onClick} className={`${base} border-cream/10 bg-transparent text-cream/25 hover:border-cream/25 hover:text-cream/40`}>
      <span>○</span>
      <span className="truncate max-w-[120px]">{label}</span>
    </button>
  )
}

export function AdminPage() {
  const [viewState, setViewState] = useState<ViewState>('auth')
  const [key, setKey] = useState('')
  const [authError, setAuthError] = useState('')
  const [guests, setGuests] = useState<RsvpEntry[]>([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 })
  const [filter, setFilter] = useState<Filter>('all')
  const [copyFeedback, setCopyFeedback] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [walkInForm, setWalkInForm] = useState<{ guestId: string; name: string } | null>(null)

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar RSVP de "${name}"? Isso libera o e-mail para novo cadastro.`)) return
    const adminKey = sessionStorage.getItem('admin_key')
    if (!adminKey) return
    try {
      await deleteRsvp({ data: { id, key: adminKey } })
      loadGuests(adminKey)
    } catch {
      alert('Erro ao deletar')
    }
  }

  const handleToggleAttendance = async (
    guestId: string,
    current: boolean | null | undefined,
    plusOneIndex?: number,
  ) => {
    const adminKey = sessionStorage.getItem('admin_key')
    if (!adminKey) return
    const next = nextAttendance(current)
    try {
      await toggleAttendance({
        data: { id: guestId, key: adminKey, attended: next, plusOneIndex },
      })
      // Optimistic update
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== guestId) return g
          if (plusOneIndex !== undefined) {
            const updatedPlusOnes = [...(g.plusOnes || [])]
            updatedPlusOnes[plusOneIndex] = { ...updatedPlusOnes[plusOneIndex], attended: next }
            return { ...g, plusOnes: updatedPlusOnes }
          }
          return { ...g, attended: next }
        }),
      )
    } catch {
      alert('Erro ao atualizar presença')
    }
  }

  const handleAddWalkIn = async (guestId: string, name: string) => {
    const adminKey = sessionStorage.getItem('admin_key')
    if (!adminKey || !name.trim()) return
    try {
      await addWalkIn({ data: { id: guestId, key: adminKey, name: name.trim() } })
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== guestId) return g
          return { ...g, walkIns: [...(g.walkIns || []), { name: name.trim(), attended: true }] }
        }),
      )
      setWalkInForm(null)
    } catch {
      alert('Erro ao adicionar walk-in')
    }
  }

  const handleRemoveWalkIn = async (guestId: string, walkInIndex: number, name: string) => {
    if (!confirm(`Remover "${name}" dos walk-ins?`)) return
    const adminKey = sessionStorage.getItem('admin_key')
    if (!adminKey) return
    try {
      await removeWalkIn({ data: { id: guestId, key: adminKey, walkInIndex } })
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== guestId) return g
          const updated = [...(g.walkIns || [])]
          updated.splice(walkInIndex, 1)
          return { ...g, walkIns: updated }
        }),
      )
    } catch {
      alert('Erro ao remover walk-in')
    }
  }

  // ── Attendance stats ──
  const confirmedGuests = guests.filter((g) => g.status === 'confirmed')
  const walkInTotal = confirmedGuests.reduce((s, g) => s + (g.walkIns || []).length, 0)
  const attendedCount = confirmedGuests.filter((g) => g.attended === true).length
    + confirmedGuests.reduce((s, g) => s + (g.plusOnes || []).filter((p) => p.attended === true).length, 0)
    + walkInTotal
  const noshowCount = confirmedGuests.filter((g) => g.attended === false).length
    + confirmedGuests.reduce((s, g) => s + (g.plusOnes || []).filter((p) => p.attended === false).length, 0)

  // ── CSV / Export ──
  const generateTsv = () => {
    const rows: string[] = ['Nome\tTipo\tEmail\tRestrições\tCompareceu\tMensagem']
    for (const g of confirmedGuests) {
      const attended = g.attended === true ? 'Sim' : g.attended === false ? 'Não' : '—'
      const msg = (g.message || '').replace(/[\t\n\r]/g, ' ')
      const food = (g.foodRestrictions || '').replace(/[\t\n\r]/g, ' ')
      rows.push(`${g.name}\tConvidado\t${g.email}\t${food}\t${attended}\t${msg}`)
      for (const p of (g.plusOnes || [])) {
        const pAttended = p.attended === true ? 'Sim' : p.attended === false ? 'Não' : '—'
        rows.push(`${p.name}\tAcompanhante de ${g.name}\t${p.email || ''}\t\t${pAttended}\t`)
      }
      for (const w of (g.walkIns || [])) {
        rows.push(`${w.name}\tWalk-in via ${g.name}\t\t\tSim\t`)
      }
    }
    return rows.join('\n')
  }

  const copyCsv = async () => {
    const tsv = generateTsv()
    try {
      await navigator.clipboard.writeText(tsv)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = tsv
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyFeedback('Copiado!')
    setTimeout(() => setCopyFeedback(''), 2000)
  }

  const downloadCsv = () => {
    const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
    const rows: string[] = ['Nome,Tipo,Email,Restrições,Compareceu,Mensagem']
    for (const g of confirmedGuests) {
      const attended = g.attended === true ? 'Sim' : g.attended === false ? 'Não' : '—'
      rows.push(`${esc(g.name)},Convidado,${esc(g.email)},${esc(g.foodRestrictions)},${attended},${esc(g.message)}`)
      for (const p of (g.plusOnes || [])) {
        const pAttended = p.attended === true ? 'Sim' : p.attended === false ? 'Não' : '—'
        rows.push(`${esc(p.name)},Acompanhante de ${esc(g.name)},${esc(p.email || '')},,${pAttended},`)
      }
      for (const w of (g.walkIns || [])) {
        rows.push(`${esc(w.name)},Walk-in via ${esc(g.name)},,,Sim,`)
      }
    }
    const csv = rows.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'level30-convidados.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateMarkdown = () => {
    const pad = (s: string, len: number) => s.length >= len ? s : s + ' '.repeat(len - s.length)
    const rows: string[][] = [['Nome', 'Tipo', 'Compareceu', 'Restrições']]
    for (const g of confirmedGuests) {
      const att = g.attended === true ? '✅' : g.attended === false ? '❌' : '—'
      rows.push([g.name, 'Convidado', att, g.foodRestrictions || ''])
      for (const p of (g.plusOnes || [])) {
        const pAtt = p.attended === true ? '✅' : p.attended === false ? '❌' : '—'
        rows.push([p.name, `Acomp. de ${g.name}`, pAtt, ''])
      }
      for (const w of (g.walkIns || [])) {
        rows.push([w.name, `Walk-in via ${g.name}`, '✅', ''])
      }
    }
    // Calculate column widths
    const colWidths = rows[0].map((_, ci) => Math.max(...rows.map((r) => r[ci].length)))
    const header = '| ' + rows[0].map((c, ci) => pad(c, colWidths[ci])).join(' | ') + ' |'
    const separator = '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |'
    const body = rows.slice(1).map((r) => '| ' + r.map((c, ci) => pad(c, colWidths[ci])).join(' | ') + ' |')
    return [header, separator, ...body].join('\n')
  }

  const copyMarkdown = async () => {
    const md = generateMarkdown()
    try {
      await navigator.clipboard.writeText(md)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = md
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyFeedback('md')
    setTimeout(() => setCopyFeedback(''), 2000)
  }

  // ── Filtering ──
  const filteredGuests = guests.filter((g) => {
    if (filter === 'confirmed') return g.status === 'confirmed'
    if (filter === 'cancelled') return g.status === 'cancelled'
    if (filter === 'attended') {
      if (g.status !== 'confirmed') return false
      // Show if primary or any plus-one attended
      return g.attended === true || (g.plusOnes || []).some((p) => p.attended === true)
    }
    if (filter === 'noshow') {
      if (g.status !== 'confirmed') return false
      return g.attended === false || (g.plusOnes || []).some((p) => p.attended === false)
    }
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
              >🎮</motion.div>
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
              {(() => {
                const confirmedPlusOnes = confirmedGuests.reduce(
                  (sum, g) => sum + (g.plusOnes?.length || 0), 0
                )
                const totalHeadcount = confirmedGuests.length + confirmedPlusOnes

                // Food restrictions summary
                const foodMap = new Map<string, number>()
                for (const g of confirmedGuests) {
                  if (g.foodRestrictions) {
                    const key = g.foodRestrictions.trim().toLowerCase()
                    foodMap.set(key, (foodMap.get(key) || 0) + 1)
                  }
                }
                const foodList = [...foodMap.entries()].sort((a, b) => b[1] - a[1])

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="border border-gold/15 bg-stage-dark/60 p-4 text-center">
                        <div className="font-mono text-3xl md:text-4xl font-bold text-cream">{stats.total}</div>
                        <div className="font-mono text-[10px] text-gold/40 tracking-wider uppercase mt-1">RSVPs</div>
                      </div>
                      <div className="border border-gold/15 bg-stage-dark/60 p-4 text-center">
                        <div className="font-mono text-3xl md:text-4xl font-bold text-neon-cyan">{totalHeadcount}</div>
                        <div className="font-mono text-[10px] text-gold/40 tracking-wider uppercase mt-1">Pessoas Confirmadas</div>
                        {confirmedPlusOnes > 0 && (
                          <div className="font-mono text-[9px] text-cream/20 mt-0.5">
                            {confirmedGuests.length} + {confirmedPlusOnes} acomp.
                          </div>
                        )}
                      </div>
                      <div className="border border-gold/15 bg-stage-dark/60 p-4 text-center">
                        <div className="font-mono text-3xl md:text-4xl font-bold text-neon-magenta">{stats.cancelled}</div>
                        <div className="font-mono text-[10px] text-gold/40 tracking-wider uppercase mt-1">Cancelados</div>
                      </div>
                      <div className="border border-gold/15 bg-stage-dark/60 p-4 text-center">
                        <div className="font-mono text-3xl md:text-4xl font-bold text-gold">{foodList.length}</div>
                        <div className="font-mono text-[10px] text-gold/40 tracking-wider uppercase mt-1">Restrições</div>
                      </div>
                    </div>

                    {/* Attendance stats row */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="border border-neon-cyan/15 bg-neon-cyan/5 p-3 text-center">
                        <div className="font-mono text-2xl md:text-3xl font-bold text-neon-cyan">{attendedCount}</div>
                        <div className="font-mono text-[10px] text-neon-cyan/40 tracking-wider uppercase mt-1">Compareceram</div>
                      </div>
                      <div className="border border-neon-magenta/15 bg-neon-magenta/5 p-3 text-center">
                        <div className="font-mono text-2xl md:text-3xl font-bold text-neon-magenta">{noshowCount}</div>
                        <div className="font-mono text-[10px] text-neon-magenta/40 tracking-wider uppercase mt-1">Faltaram</div>
                      </div>
                    </div>

                    {/* Food restrictions summary */}
                    {foodList.length > 0 && (
                      <div className="border border-gold/10 bg-stage-dark/40 p-5 mb-8">
                        <div className="font-mono text-xs text-gold/50 tracking-[0.2em] uppercase mb-3">
                          🍽️ Restrições Alimentares
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {foodList.map(([restriction, count]) => (
                            <span
                              key={restriction}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5
                                border border-neon-cyan/20 bg-neon-cyan/5 font-mono text-xs text-neon-cyan/70"
                            >
                              <span className="capitalize">{restriction}</span>
                              <span className="text-neon-cyan/40">×{count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {([
                  { key: 'all' as Filter, label: `Todos (${stats.total})` },
                  { key: 'confirmed' as Filter, label: `Confirmados (${stats.confirmed})` },
                  { key: 'cancelled' as Filter, label: `Cancelados (${stats.cancelled})` },
                  { key: 'attended' as Filter, label: `✓ Vieram (${attendedCount})` },
                  { key: 'noshow' as Filter, label: `✗ Faltaram (${noshowCount})` },
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
                  <div className="text-4xl mb-4">👻</div>
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
                      <div className="p-5 flex flex-col gap-3">
                        {/* Top row: status + name + date + actions */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
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

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {guest.message && (
                              <p className="font-body text-cream/40 text-sm italic truncate">
                                "{guest.message}"
                              </p>
                            )}
                            {guest.foodRestrictions && (
                              <p className="font-mono text-[10px] text-neon-cyan/50 truncate">
                                🍽️ {guest.foodRestrictions}
                              </p>
                            )}
                            {guest.trophies && guest.trophies.length > 0 && (
                              <p className="font-mono text-[10px] text-[#cd7f32]/60" title={guest.trophies.join(', ')}>
                                🏆 {guest.trophies.length}/9:{' '}
                                {guest.trophies.join(', ')}
                                {guest.trophies.length >= 9 && ' 🏅 PLATINA'}
                              </p>
                            )}
                          </div>

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
                            <button
                              onClick={() => handleDelete(guest.id, guest.name)}
                              className="font-mono text-xs text-cream/15 border border-cream/10 px-2.5 py-1
                                hover:text-neon-magenta hover:border-neon-magenta/40 hover:bg-neon-magenta/5
                                transition-all cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Attendance row — only for confirmed guests */}
                        {guest.status === 'confirmed' && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gold/5">
                            <span className="font-mono text-[10px] text-cream/20 tracking-wider uppercase mr-1">
                              Presença:
                            </span>
                            <AttendanceBadge
                              attended={guest.attended}
                              onClick={() => handleToggleAttendance(guest.id, guest.attended)}
                              label={guest.name}
                            />
                            {(guest.plusOnes || []).map((p, pi) => (
                              <AttendanceBadge
                                key={pi}
                                attended={p.attended}
                                onClick={() => handleToggleAttendance(guest.id, p.attended, pi)}
                                label={p.name}
                                small
                              />
                            ))}

                            {/* Walk-ins */}
                            {(guest.walkIns || []).map((w, wi) => (
                              <span
                                key={`w-${wi}`}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 border
                                  border-gold/25 bg-gold/8 font-mono text-[10px] text-gold/70 group/walkin"
                              >
                                <span>★</span>
                                <span className="truncate max-w-[120px]">{w.name}</span>
                                <button
                                  onClick={() => handleRemoveWalkIn(guest.id, wi, w.name)}
                                  className="text-cream/15 hover:text-neon-magenta ml-0.5 cursor-pointer
                                    opacity-0 group-hover/walkin:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}

                            {/* Add walk-in button / inline form */}
                            {walkInForm?.guestId === guest.id ? (
                              <form
                                className="inline-flex items-center gap-1.5"
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  handleAddWalkIn(guest.id, walkInForm.name)
                                }}
                              >
                                <input
                                  type="text"
                                  value={walkInForm.name}
                                  onChange={(e) => setWalkInForm({ guestId: guest.id, name: e.target.value })}
                                  placeholder="Nome..."
                                  autoFocus
                                  className="bg-transparent border border-gold/20 text-cream font-mono text-[10px]
                                    px-2 py-0.5 w-28 placeholder:text-cream/15
                                    focus:outline-none focus:border-gold/50 transition-all"
                                  onKeyDown={(e) => { if (e.key === 'Escape') setWalkInForm(null) }}
                                />
                                <button
                                  type="submit"
                                  className="text-neon-cyan/50 hover:text-neon-cyan font-mono text-[10px]
                                    cursor-pointer transition-colors"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setWalkInForm(null)}
                                  className="text-cream/20 hover:text-cream/40 font-mono text-[10px]
                                    cursor-pointer transition-colors"
                                >
                                  ✕
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => setWalkInForm({ guestId: guest.id, name: '' })}
                                className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed
                                  border-cream/10 text-cream/20 font-mono text-[10px]
                                  cursor-pointer hover:border-gold/30 hover:text-gold/50 transition-all"
                                title="Adicionar walk-in (pessoa que veio sem RSVP)"
                              >
                                <span>+</span>
                                <span>walk-in</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Export section */}
              <div className="mt-8 pt-6 border-t border-gold/10">
                <button
                  onClick={() => setShowExport(!showExport)}
                  className="font-mono text-xs text-gold/40 cursor-pointer hover:text-gold transition-colors mb-4"
                >
                  {showExport ? '▾' : '▸'} Exportar dados
                </button>

                <AnimatePresence>
                  {showExport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-gold/10 bg-stage-dark/40 p-5 mb-6">
                        <div className="font-mono text-xs text-gold/50 tracking-[0.2em] uppercase mb-4">
                          📋 Exportar Confirmados + Presença
                        </div>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <button
                            onClick={copyCsv}
                            className="px-4 py-2 border border-neon-cyan/30 text-neon-cyan/70 font-mono text-xs
                              cursor-pointer hover:bg-neon-cyan/10 hover:border-neon-cyan/50 transition-all"
                          >
                            {copyFeedback === 'Copiado!' ? '✓ Copiado!' : '📋 Copiar tabela (Sheets/Excel)'}
                          </button>
                          <button
                            onClick={copyMarkdown}
                            className="px-4 py-2 border border-neon-cyan/30 text-neon-cyan/70 font-mono text-xs
                              cursor-pointer hover:bg-neon-cyan/10 hover:border-neon-cyan/50 transition-all"
                          >
                            {copyFeedback === 'md' ? '✓ Copiado!' : '📝 Copiar Markdown (Notion)'}
                          </button>
                          <button
                            onClick={downloadCsv}
                            className="px-4 py-2 border border-gold/20 text-gold/60 font-mono text-xs
                              cursor-pointer hover:bg-gold/10 hover:border-gold/40 transition-all"
                          >
                            ⬇ Baixar .csv
                          </button>
                        </div>
                        <p className="font-mono text-[10px] text-cream/20">
                          Inclui: nome, tipo (convidado/acompanhante/walk-in), email, restrições, presença e mensagem.
                          Cada acompanhante e walk-in aparece em sua própria linha.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Refresh + logout */}
              <div className="flex items-center justify-between mt-4 pt-6 border-t border-gold/10">
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
