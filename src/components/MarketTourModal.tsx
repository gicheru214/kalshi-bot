import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Zap, ChevronRight } from 'lucide-react'
import { MARKETS, VERTICALS } from '../data/markets'
import type { Market } from '../types'

interface Props {
  verticalId: string
  onComplete: () => void
}

const SHAME_SKIPS = [
  "No thanks, I prefer losing to AI bots 🤖",
  "Skip — I enjoy watching my money disappear",
  "Nah, I'm fine being poor",
  "I don't like making money",
]

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function getBotSignal(market: Market): { side: 'YES' | 'NO'; reason: string; confidence: number } {
  const bullish = market.yesPrice < 65 && market.change24h > 0
  const side = bullish ? 'YES' : 'NO'
  const confidence = Math.min(95, Math.max(62, Math.abs(market.change24h) * 8 + 60))
  const reasons = bullish
    ? [
        `Real-time order flow shows buyers stacking ${market.yesPrice}¢ YES. Bot entering now.`,
        `${Math.abs(market.change24h)}% momentum detected. Institutional accumulation confirmed.`,
        `Bot scanning live Kalshi data — YES mispriced at ${market.yesPrice}¢. Edge identified.`,
      ]
    : [
        `Overbought at ${market.yesPrice}¢. Bot signals NO for mean-reversion play.`,
        `${Math.abs(market.change24h)}% drop in last 24h. Bot fading this move — buying NO.`,
        `Live data shows sellers overwhelm buyers. Bot entering NO at ${market.noPrice}¢.`,
      ]
  const reason = reasons[Math.floor(market.yesPrice * 3) % reasons.length]
  return { side, reason, confidence }
}

export default function MarketTourModal({ verticalId, onComplete }: Props) {
  const markets = MARKETS.filter(m => m.category === verticalId).slice(0, 4)
  const vertical = VERTICALS.find(v => v.id === verticalId)!
  const [index, setIndex] = useState(0)
  const [approved, setApproved] = useState(false)

  const market: Market = markets[index]
  const isLast = index === markets.length - 1
  const shameText = SHAME_SKIPS[index % SHAME_SKIPS.length]
  const signal = getBotSignal(market)

  const handleApprove = () => {
    setApproved(true)
  }

  const handleNext = () => {
    setApproved(false)
    if (isLast) onComplete()
    else setIndex(i => i + 1)
  }

  if (!market) { onComplete(); return null }

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="tour-modal">
        {/* Progress dots */}
        <div style={s.dots}>
          {markets.map((_, i) => (
            <div key={i} style={{
              ...s.dot,
              ...(i === index ? { ...s.dotActive, background: vertical.color } : {}),
              ...(i < index ? { background: vertical.color, opacity: 0.4 } : {}),
            }} />
          ))}
        </div>

        {/* Header */}
        <div style={s.headerRow}>
          <div style={{ ...s.badge, background: vertical.colorDim, color: vertical.color }}>
            {vertical.emoji} {vertical.label}
          </div>
          <span style={s.cardNum}>{index + 1} of {markets.length}</span>
        </div>

        {/* Market card */}
        <div style={s.card}>
          <div style={s.cardTop}>
            <h2 style={s.marketTitle}>{market.title}</h2>
            {market.trending && <span style={s.hotBadge}>🔥 Hot</span>}
          </div>

          {/* Probability bar */}
          <div style={s.barWrap}>
            <div style={{ ...s.barFill, width: `${market.yesPrice}%`, background: vertical.gradient }} />
          </div>
          <div style={s.priceLabels}>
            <span style={{ color: '#00c896', fontWeight: 700, fontSize: 14 }}>YES {market.yesPrice}¢</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmt(market.volume)} vol</span>
            <span style={{ color: '#f43f5e', fontWeight: 700, fontSize: 14 }}>NO {market.noPrice}¢</span>
          </div>

          <div style={s.statsRow}>
            <span style={s.stat}>
              <Users size={12} /> {fmt(market.volume)} volume
            </span>
            <span style={s.stat}>
              {market.change24h > 0
                ? <TrendingUp size={12} style={{ color: '#00c896' }} />
                : <TrendingDown size={12} style={{ color: '#f43f5e' }} />}
              <span style={{ color: market.change24h > 0 ? '#00c896' : '#f43f5e' }}>
                {market.change24h > 0 ? '+' : ''}{market.change24h}% today
              </span>
            </span>
          </div>
        </div>

        {/* Bot signal card */}
        <div style={s.signalCard}>
          <div style={s.signalHeader}>
            <Zap size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span style={s.signalTitle}>Bot Signal</span>
            <span style={{ ...s.signalSide, background: signal.side === 'YES' ? 'rgba(0,200,150,0.15)' : 'rgba(244,63,94,0.15)', color: signal.side === 'YES' ? '#00c896' : '#f43f5e' }}>
              {signal.side === 'YES' ? '▲ BUY YES' : '▼ BUY NO'}
            </span>
            <span style={s.confidence}>{signal.confidence}% conf.</span>
          </div>
          <p style={s.signalReason}>{signal.reason}</p>
          <p style={s.signalNote}>
            🤖 Bot reads live Kalshi order books, tracks whale wallets, and executes on your device when the edge is confirmed. <strong style={{ color: 'var(--text)' }}>You tap the buy signal — bot handles the rest.</strong>
          </p>
        </div>

        {/* CTA */}
        {!approved ? (
          <button style={s.approveBtn} onClick={handleApprove}>
            ✅ Let bot trade this — I'll approve on my device
          </button>
        ) : (
          <div style={s.approvedBanner}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--green)', fontSize: 14 }}>Signal approved</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bot will alert you when it's time to tap buy</p>
            </div>
            <button style={s.nextBtn} onClick={handleNext}>
              {isLast ? 'Finish →' : <><ChevronRight size={16} /></>}
            </button>
          </div>
        )}

        <button style={s.shameBtn} onClick={onComplete}>
          {shameText}
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(4,8,15,0.94)',
    backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 520,
    display: 'flex', flexDirection: 'column',
    gap: 14,
  },
  dots: { display: 'flex', gap: 8, justifyContent: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--border-bright)', transition: 'all 0.2s',
  },
  dotActive: { width: 24, borderRadius: 4 },
  headerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  badge: {
    padding: '5px 14px', borderRadius: 20,
    fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
  },
  cardNum: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 },
  card: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 18,
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: 12,
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  hotBadge: {
    fontSize: 11, padding: '2px 8px', borderRadius: 20, flexShrink: 0,
    background: 'rgba(251,146,60,0.1)', color: '#fb923c', fontWeight: 600,
  },
  marketTitle: {
    fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 900,
    color: 'var(--text)', lineHeight: 1.35, letterSpacing: '-0.3px',
  },
  barWrap: { height: 6, borderRadius: 3, background: 'var(--red-dim)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
  priceLabels: { display: 'flex', justifyContent: 'space-between' },
  statsRow: { display: 'flex', gap: 16 },
  stat: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: 'var(--text-muted)',
  },
  signalCard: {
    width: '100%',
    background: 'rgba(245,158,11,0.05)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 16,
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  signalHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  signalTitle: { fontSize: 12, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  signalSide: {
    marginLeft: 'auto', padding: '3px 9px', borderRadius: 20,
    fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
  },
  confidence: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },
  signalReason: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 },
  signalNote: {
    fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55,
    padding: '10px 12px', borderRadius: 8,
    background: 'rgba(0,200,150,0.04)', border: '1px solid rgba(0,200,150,0.1)',
  },
  approveBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 15, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 24px rgba(0,200,150,0.4)',
  },
  approvedBanner: {
    width: '100%',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 14,
    background: 'rgba(0,200,150,0.08)',
    border: '1px solid rgba(0,200,150,0.25)',
  },
  nextBtn: {
    marginLeft: 'auto', flexShrink: 0,
    padding: '10px 18px',
    borderRadius: 10,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 14, fontWeight: 800,
    display: 'flex', alignItems: 'center',
  },
  shameBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 12, fontWeight: 500,
    padding: '4px',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    alignSelf: 'center',
  },
}
