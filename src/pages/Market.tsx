import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Info, Check } from 'lucide-react'
import { MARKETS } from '../data/markets'
import { useAuth } from '../context/AuthContext'

type Side = 'YES' | 'NO'

const FAKE_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h ago`,
  yes: Math.max(10, Math.min(90, 55 + Math.sin(i * 0.6) * 15 + (Math.random() - 0.5) * 8)),
}))

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function Market() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const market = useMemo(() => MARKETS.find(m => m.id === id), [id])
  const [side, setSide] = useState<Side>((searchParams.get('side') as Side) ?? 'YES')
  const [amount, setAmount] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!market) {
    return (
      <div style={styles.notFound}>
        <p style={{ fontSize: 40 }}>🔍</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Market not found</p>
        <button style={styles.backBtn2} onClick={() => navigate('/app')}>Back to markets</button>
      </div>
    )
  }

  const price = side === 'YES' ? market.yesPrice : market.noPrice
  const amountNum = parseFloat(amount) || 0
  const shares = amountNum > 0 ? (amountNum / (price / 100)).toFixed(2) : '—'
  const potentialPayout = amountNum > 0 ? (amountNum / (price / 100)).toFixed(2) : '—'

  const handleBuy = () => {
    if (!user || amountNum <= 0 || amountNum > user.balance) return
    updateUser({ balance: Math.round((user.balance - amountNum) * 100) / 100 })
    setShowSuccess(true)
    setAmount('')
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const trending = market.change24h > 0

  return (
    <div style={styles.page}>
      {/* Back */}
      <button style={styles.backBtn} onClick={() => navigate('/app')}>
        <ArrowLeft size={16} />
        All Markets
      </button>

      <div className="market-layout" style={styles.layout}>
        {/* Left: market info */}
        <div style={styles.leftCol}>
          {/* Category & title */}
          <div style={styles.categoryRow}>
            <span style={styles.categoryBadge}>{market.category}</span>
            {market.trending && <span style={styles.trendBadge}>🔥 Trending</span>}
          </div>
          <h1 style={styles.title}>{market.title}</h1>
          <p style={styles.description}>{market.description}</p>

          {/* Stats row */}
          <div className="market-stats-row" style={styles.statsRow}>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{fmt(market.volume)}</p>
              <p style={styles.statLbl}>Volume</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{fmt(market.liquidity)}</p>
              <p style={styles.statLbl}>Liquidity</p>
            </div>
            <div style={styles.statBox}>
              <p style={{
                ...styles.statVal,
                color: trending ? 'var(--green)' : 'var(--red)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                {trending ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(market.change24h)}%
              </p>
              <p style={styles.statLbl}>24h Change</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{market.endDate}</p>
              <p style={styles.statLbl}>Closes</p>
            </div>
          </div>

          {/* Probability chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <span style={styles.chartTitle}>Probability over 24h</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>YES price</span>
            </div>
            {/* Simple bar chart visualization */}
            <div style={styles.chartBars}>
              {FAKE_HISTORY.slice(-12).map((pt, i) => (
                <div key={i} style={styles.chartBarCol}>
                  <div style={styles.chartBarTrack}>
                    <div
                      style={{
                        ...styles.chartBarFill,
                        height: `${pt.yes}%`,
                        background: pt.yes > 50
                          ? `rgba(16,185,129,${0.4 + (pt.yes - 50) / 100})`
                          : `rgba(239,68,68,${0.4 + (50 - pt.yes) / 100})`,
                      }}
                    />
                  </div>
                  <span style={styles.chartBarLabel}>{12 - i}h</span>
                </div>
              ))}
            </div>
            {/* Price line */}
            <div style={styles.priceDisplay}>
              <div style={styles.priceYes}>
                <span>YES</span>
                <span style={styles.priceYesVal}>{market.yesPrice}¢</span>
              </div>
              <div style={styles.probBar}>
                <div style={{ ...styles.probBarFill, width: `${market.yesPrice}%` }} />
              </div>
              <div style={styles.priceNo}>
                <span style={styles.priceNoVal}>{market.noPrice}¢</span>
                <span>NO</span>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div style={styles.infoBox}>
            <Info size={14} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <p style={styles.infoText}>
              This market resolves based on publicly verifiable data. Winners receive $1.00 per share at resolution.
              Trading is 24/7 until market close.
            </p>
          </div>
        </div>

        {/* Right: trading panel */}
        <div style={styles.rightCol}>
          {showSuccess && (
            <div style={styles.successBanner}>
              <Check size={16} />
              Order placed successfully!
            </div>
          )}

          <div style={styles.tradingCard}>
            <h2 style={styles.tradingTitle}>Place Order</h2>

            {/* Side toggle */}
            <div style={styles.sideToggle}>
              <button
                style={{ ...styles.sideBtn, ...styles.sideBtnYes, ...(side === 'YES' ? styles.sideBtnYesActive : {}) }}
                onClick={() => setSide('YES')}
              >
                YES · {market.yesPrice}¢
              </button>
              <button
                style={{ ...styles.sideBtn, ...styles.sideBtnNo, ...(side === 'NO' ? styles.sideBtnNoActive : {}) }}
                onClick={() => setSide('NO')}
              >
                NO · {market.noPrice}¢
              </button>
            </div>

            {/* Amount input */}
            <div style={styles.amountSection}>
              <label style={styles.inputLabel}>Amount (USD)</label>
              <div style={styles.amountWrap}>
                <span style={styles.currencySign}>$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={user?.balance}
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={styles.amountInput}
                />
              </div>
              {/* Quick amounts */}
              <div style={styles.quickAmounts}>
                {[10, 25, 50, 100].map(v => (
                  <button
                    key={v}
                    style={styles.quickBtn}
                    onClick={() => setAmount(String(Math.min(v, user?.balance ?? v)))}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLbl}>Price per share</span>
                <span style={styles.summaryVal}>{price}¢</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLbl}>Shares</span>
                <span style={styles.summaryVal}>{shares}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLbl}>Potential payout</span>
                <span style={{ ...styles.summaryVal, color: 'var(--green)' }}>
                  ${potentialPayout}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.summaryLbl}>Your balance</span>
                <span style={styles.summaryVal}>${user?.balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Buy button */}
            <button
              style={{
                ...styles.buyBtn,
                ...(side === 'YES' ? styles.buyBtnYes : styles.buyBtnNo),
                ...(!amountNum || amountNum > (user?.balance ?? 0) ? styles.buyBtnDisabled : {}),
              }}
              disabled={!amountNum || amountNum > (user?.balance ?? 0)}
              onClick={handleBuy}
            >
              Buy {side} · ${amountNum > 0 ? amountNum : '—'}
            </button>

            {amountNum > (user?.balance ?? 0) && (
              <p style={styles.errorMsg}>Insufficient balance</p>
            )}

            {/* Risk note */}
            <p style={styles.riskNote}>
              You could lose your entire investment if this position is wrong. Trade responsibly.
            </p>
          </div>

          {/* Related tags */}
          <div style={styles.tagsCard}>
            <p style={styles.tagsTitle}>Tags</p>
            <div style={styles.tagsList}>
              {market.tags.map(t => (
                <span key={t} style={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 80 }} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px 16px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
    padding: '6px 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 24,
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  categoryRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: 'rgba(251,146,60,0.15)',
    color: '#fb923c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trendBadge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(251,146,60,0.1)',
    color: '#fb923c',
  },
  title: {
    fontSize: 'clamp(20px, 3vw, 28px)',
    fontWeight: 800,
    color: 'var(--text)',
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  },
  description: {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  statBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px',
  },
  statVal: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
  },
  statLbl: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  // Chart
  chartCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
  },
  chartBars: {
    display: 'flex',
    gap: 4,
    alignItems: 'flex-end',
    height: 80,
  },
  chartBarCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    height: '100%',
  },
  chartBarTrack: {
    flex: 1,
    width: '100%',
    background: 'var(--border)',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 3,
    transition: 'height 0.3s ease',
  },
  chartBarLabel: {
    fontSize: 9,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  priceDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  priceYes: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    minWidth: 36,
  },
  priceYesVal: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--green)',
  },
  probBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    background: 'var(--red-dim)',
    overflow: 'hidden',
  },
  probBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  priceNo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    minWidth: 36,
  },
  priceNoVal: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--red)',
  },
  infoBox: {
    display: 'flex',
    gap: 10,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'var(--cyan-dim)',
    border: '1px solid rgba(6,182,212,0.15)',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  // Right col
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    background: 'var(--green-dim)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: 'var(--green)',
    fontSize: 14,
    fontWeight: 600,
  },
  tradingCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 20,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  tradingTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--text)',
  },
  sideToggle: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    background: 'var(--bg)',
    borderRadius: 14,
    padding: 4,
  },
  sideBtn: {
    padding: '12px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    transition: 'all 0.15s',
    background: 'transparent',
  },
  sideBtnYes: { color: 'var(--text-muted)' },
  sideBtnYesActive: {
    background: 'var(--green-dim)',
    color: 'var(--green)',
    border: '1px solid rgba(16,185,129,0.3)',
  },
  sideBtnNo: { color: 'var(--text-muted)' },
  sideBtnNoActive: {
    background: 'var(--red-dim)',
    color: 'var(--red)',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  amountSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  inputLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  amountWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencySign: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  amountInput: {
    width: '100%',
    padding: '14px 14px 14px 30px',
    borderRadius: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)',
    fontSize: 20,
    fontWeight: 800,
  },
  quickAmounts: {
    display: 'flex',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    padding: '7px',
    borderRadius: 8,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 700,
    transition: 'all 0.15s',
  },
  summary: {
    background: 'var(--bg)',
    borderRadius: 12,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLbl: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text)',
  },
  summaryDivider: {
    height: 1,
    background: 'var(--border)',
    margin: '4px 0',
  },
  buyBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    transition: 'all 0.15s',
  },
  buyBtnYes: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
  },
  buyBtnNo: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
  },
  buyBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  errorMsg: {
    fontSize: 12,
    color: 'var(--red)',
    textAlign: 'center',
  },
  riskNote: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  tagsCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tagsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    padding: '4px 10px',
    borderRadius: 20,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  // Not found
  notFound: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 12,
  },
  backBtn2: {
    padding: '10px 20px',
    borderRadius: 10,
    background: 'var(--green)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    marginTop: 8,
  },
}
