import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Users } from 'lucide-react'
import type { Market } from '../types'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function MarketCard({ market }: { market: Market }) {
  const navigate = useNavigate()
  const yes = market.yesPrice
  const no = market.noPrice
  const up = market.change24h > 0

  return (
    <div
      style={s.card}
      onClick={() => navigate(`/app/market/${market.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/app/market/${market.id}`)}
    >
      <div style={s.topRow}>
        <span style={{ ...s.catBadge, ...catColor(market.category) }}>{market.category}</span>
        {market.trending && <span style={s.hotBadge}>🔥 Trending</span>}
        <span style={{ ...s.change, color: up ? 'var(--green)' : 'var(--red)' }}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(market.change24h)}%
        </span>
      </div>

      <p style={s.title}>{market.title}</p>

      <div style={s.barWrap}>
        <div style={{ ...s.barFill, width: `${yes}%` }} />
      </div>

      <div style={s.priceRow}>
        <button
          style={s.yesBtn}
          onClick={e => { e.stopPropagation(); navigate(`/app/market/${market.id}?side=YES`) }}
        >
          Yes {yes}¢
        </button>
        <button
          style={s.noBtn}
          onClick={e => { e.stopPropagation(); navigate(`/app/market/${market.id}?side=NO`) }}
        >
          No {no}¢
        </button>
      </div>

      <div style={s.footer}>
        <span style={s.footerItem}><Users size={11} /> {fmt(market.volume)} vol</span>
        <span style={s.footerItem}>Ends {market.endDate}</span>
      </div>
    </div>
  )
}

function catColor(cat: string): React.CSSProperties {
  const m: Record<string, React.CSSProperties> = {
    crypto:  { background: 'rgba(251,146,60,0.12)',  color: '#fb923c' },
    meme:    { background: 'rgba(168,85,247,0.12)',  color: '#a855f7' },
    sports:  { background: 'rgba(37,99,235,0.12)',   color: 'var(--blue)' },
    viral:   { background: 'rgba(244,63,94,0.12)',   color: 'var(--red)' },
    stocks:  { background: 'rgba(0,200,150,0.12)',   color: 'var(--green)' },
    politics:{ background: 'rgba(244,63,94,0.12)',   color: 'var(--red)' },
    entertainment: { background: 'rgba(168,85,247,0.12)', color: '#a855f7' },
    science: { background: 'rgba(0,168,255,0.12)',   color: '#00a8ff' },
    custom:  { background: 'rgba(245,158,11,0.12)',  color: 'var(--yellow)' },
  }
  return m[cat] ?? { background: 'var(--border)', color: 'var(--text-secondary)' }
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: 11,
  },
  topRow: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  catBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px',
    borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  hotBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
    background: 'rgba(251,146,60,0.1)', color: '#fb923c',
  },
  change: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 2,
  },
  title: { fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 },
  barWrap: { height: 5, borderRadius: 3, background: 'var(--red-dim)', overflow: 'hidden' },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00c896, #00e5ab)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  priceRow: { display: 'flex', gap: 7 },
  yesBtn: {
    flex: 1, padding: '8px', borderRadius: 9,
    background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.2)',
    color: 'var(--green)', fontSize: 13, fontWeight: 700,
  },
  noBtn: {
    flex: 1, padding: '8px', borderRadius: 9,
    background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.2)',
    color: 'var(--red)', fontSize: 13, fontWeight: 700,
  },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: {
    fontSize: 11, color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: 3,
  },
}
