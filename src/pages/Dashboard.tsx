import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, TrendingUp, Flame, Clock, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import MarketCard from '../components/MarketCard'
import VerticalSelectModal from '../components/VerticalSelectModal'
import MarketTourModal from '../components/MarketTourModal'
import KalshiConnectModal from '../components/KalshiConnectModal'
import DepositModal from '../components/DepositModal'
import { MARKETS, CATEGORIES } from '../data/markets'
import type { Category } from '../types'

type SortKey = 'volume' | 'trending' | 'newest' | 'endDate'
type Step = 'vertical' | 'tour' | 'kalshi' | 'deposit' | 'done'

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.FC<{ size: number }> }[] = [
  { key: 'volume',   label: 'Volume',       icon: TrendingUp },
  { key: 'trending', label: 'Trending',     icon: Flame },
  { key: 'newest',   label: 'New',          icon: Star },
  { key: 'endDate',  label: 'Ending Soon',  icon: Clock },
]

function trackSelection(userId: string, email: string, vertical: string, marketsViewed: string[], kalshiConnected: boolean, depositAmount: number | null) {
  try {
    const existing = JSON.parse(localStorage.getItem('admin_selections') || '[]')
    const idx = existing.findIndex((r: { userId: string }) => r.userId === userId)
    const record = { userId, email, vertical, marketsViewed, kalshiConnected, depositAmount, timestamp: Date.now() }
    if (idx >= 0) existing[idx] = record
    else existing.push(record)
    localStorage.setItem('admin_selections', JSON.stringify(existing))
  } catch {}
}

export default function Dashboard() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('volume')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Onboarding flow state
  const [step, setStep] = useState<Step>(() =>
    localStorage.getItem(`onboard_done_${user?.id}`) ? 'done' : 'vertical'
  )
  const [selectedVertical, setSelectedVertical] = useState('')
  const [kalshiEmail, setKalshiEmail] = useState('')
  const [marketsViewed, setMarketsViewed] = useState<string[]>([])

  // Track as user progresses
  useEffect(() => {
    if (selectedVertical && user) {
      trackSelection(user.id, user.email, selectedVertical, marketsViewed, !!kalshiEmail, null)
    }
  }, [selectedVertical, marketsViewed, kalshiEmail])

  const handleVerticalSelect = (v: string) => {
    setSelectedVertical(v)
    setActiveCategory(v)
    setStep('tour')
  }

  const handleTourComplete = () => {
    const toured = MARKETS.filter(m => m.category === selectedVertical).slice(0, 4).map(m => m.id)
    setMarketsViewed(toured)
    setStep('kalshi')
  }

  const handleKalshiConnect = (email: string) => {
    setKalshiEmail(email)
    setStep('deposit')
  }

  const handleDeposit = (amount: number) => {
    if (user) trackSelection(user.id, user.email, selectedVertical, marketsViewed, !!kalshiEmail, amount)
    localStorage.setItem(`onboard_done_${user?.id}`, '1')
    setStep('done')
  }

  const handleSkipToEnd = () => {
    localStorage.setItem(`onboard_done_${user?.id}`, '1')
    setStep('done')
  }

  const filtered = useMemo(() => {
    let list = [...MARKETS]
    if (activeCategory !== 'all') list = list.filter(m => m.category === activeCategory as Category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)))
    }
    switch (sortKey) {
      case 'volume':   list.sort((a, b) => b.volume - a.volume); break
      case 'trending': list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0)); break
      case 'endDate':  list.sort((a, b) => a.endDate.localeCompare(b.endDate)); break
      case 'newest':   list.sort((a, b) => b.volume - a.volume); break
    }
    return list
  }, [activeCategory, sortKey, search])

  const featured = MARKETS.filter(m => m.featured)

  return (
    <>
      {/* ── Modal sequence ── */}
      {step === 'vertical' && (
        <VerticalSelectModal onSelect={handleVerticalSelect} />
      )}
      {step === 'tour' && selectedVertical && (
        <MarketTourModal
          verticalId={selectedVertical}
          onComplete={handleTourComplete}
        />
      )}
      {step === 'kalshi' && (
        <KalshiConnectModal
          onConnect={handleKalshiConnect}
          onSkip={() => setStep('deposit')}
        />
      )}
      {step === 'deposit' && (
        <DepositModal
          onDeposit={handleDeposit}
          onSkip={handleSkipToEnd}
        />
      )}

      {/* ── Main dashboard ── */}
      <div style={styles.page}>
        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div style={styles.welcomeLeft}>
            <p style={styles.welcomeGreet}>
              👋 Welcome back, <strong>{user?.name.split(' ')[0]}</strong>
            </p>
            <p style={styles.welcomeSub}>Markets are live · {MARKETS.length} open positions</p>
          </div>
          <div style={styles.balancePill}>
            <span style={styles.balanceLabel}>Balance</span>
            <span style={styles.balanceVal}>${user?.balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Featured strip */}
        {featured.length > 0 && (
          <section style={styles.featuredSection}>
            <div style={styles.sectionHeader}>
              <Flame size={14} style={{ color: '#fb923c' }} />
              <span style={styles.sectionTitle}>Featured</span>
            </div>
            <div className="featured-grid">
              {featured.map(m => <MarketCard key={m.id} market={m} />)}
            </div>
          </section>
        )}

        {/* All markets */}
        <section style={styles.allSection}>
          {/* Search + filter */}
          <div style={styles.controls}>
            <div style={styles.searchWrap}>
              <Search size={15} style={styles.searchIcon} />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search markets…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              style={{ ...styles.filterBtn, ...(showFilters ? styles.filterBtnActive : {}) }}
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {/* Category tabs */}
          <div style={styles.categoryTabs} className="no-scrollbar">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                style={{ ...styles.catTab, ...(activeCategory === id ? styles.catTabActive : {}) }}
                onClick={() => setActiveCategory(id)}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Sort (mobile filter toggle) */}
          {showFilters && (
            <div style={styles.sortTabs}>
              {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  style={{ ...styles.sortTab, ...(sortKey === key ? styles.sortTabActive : {}) }}
                  onClick={() => setSortKey(key)}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}

          {/* Results header */}
          <div style={styles.resultsHeader}>
            <span style={styles.resultsCount}>{filtered.length} markets</span>
            <div className="sort-inline" style={styles.sortInline}>
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  style={{ ...styles.sortInlineBtn, ...(sortKey === key ? styles.sortInlineBtnActive : {}) }}
                  onClick={() => setSortKey(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="market-grid">
              {filtered.map(m => <MarketCard key={m.id} market={m} />)}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 36 }}>🔍</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>No markets found</p>
            </div>
          )}
        </section>

        <div style={{ height: 80 }} />
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 },
  welcomeBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    padding: '18px 20px', borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(0,168,255,0.05))',
    border: '1px solid rgba(0,200,150,0.15)',
  },
  welcomeLeft: { display: 'flex', flexDirection: 'column', gap: 3 },
  welcomeGreet: { fontSize: 15, fontWeight: 500, color: 'var(--text)' },
  welcomeSub: { fontSize: 12, color: 'var(--text-muted)' },
  balancePill: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 },
  balanceLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  balanceVal: { fontSize: 20, fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.5px' },
  featuredSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' },
  allSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  controls: { display: 'flex', gap: 10, alignItems: 'center' },
  searchWrap: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 13, color: 'var(--text-muted)', pointerEvents: 'none' } as React.CSSProperties,
  searchInput: {
    width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14,
  },
  filterBtn: {
    width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card)',
    border: '1px solid var(--border)', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  filterBtnActive: { background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.3)', color: 'var(--green)' },
  categoryTabs: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 },
  catTab: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 20,
    background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)',
    fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
  },
  catTabActive: { background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.3)', color: 'var(--green)' },
  sortTabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  sortTab: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px',
    borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  },
  sortTabActive: { background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.3)', color: 'var(--green)' },
  resultsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  resultsCount: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' },
  sortInline: { display: 'flex', gap: 4 },
  sortInlineBtn: { padding: '5px 9px', borderRadius: 6, background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 },
  sortInlineBtnActive: { background: 'var(--bg-card)', color: 'var(--text)' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 8 },
}
