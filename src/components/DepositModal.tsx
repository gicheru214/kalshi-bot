import { useState } from 'react'
import { ArrowRight, TrendingUp, Zap, Gift } from 'lucide-react'

interface Props {
  onDeposit: (amount: number) => void
  onSkip: () => void
}

const AMOUNTS = [
  { value: 50,   label: '$50',   badge: '' },
  { value: 100,  label: '$100',  badge: '⚡ Popular' },
  { value: 250,  label: '$250',  badge: '🔥 Best value' },
  { value: 500,  label: '$500',  badge: '💎 Max alpha' },
]

const SOCIAL_PROOF = [
  { name: 'Marcus T.', action: 'just won $420 on PEPE →', time: '2m ago' },
  { name: 'Priya K.',  action: 'turned $100 into $380',   time: '5m ago' },
  { name: 'Jason L.',  action: 'up 310% on BTC call',     time: '9m ago' },
]

export default function DepositModal({ onDeposit, onSkip }: Props) {
  const [selected, setSelected] = useState(100)
  const [proofIdx, setProofIdx] = useState(0)

  // Cycle social proof every 3 seconds
  useState(() => {
    const t = setInterval(() => setProofIdx(i => (i + 1) % SOCIAL_PROOF.length), 3000)
    return () => clearInterval(t)
  })

  const proof = SOCIAL_PROOF[proofIdx]

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        {/* Live activity ticker */}
        <div style={s.activityBar}>
          <span style={s.activityDot} />
          <span style={s.activityText}>
            <strong style={{ color: 'var(--green)' }}>{proof.name}</strong>
            {' '}{proof.action}{' '}
            <span style={{ color: 'var(--text-muted)' }}>{proof.time}</span>
          </span>
        </div>

        <div style={s.header}>
          <div style={s.trophy}>💰</div>
          <h2 style={s.title}>Fund your account</h2>
          <p style={s.sub}>
            Markets are moving <em>right now.</em> Your practice account has limits —
            deposit real funds and start capturing real wins.
          </p>
        </div>

        {/* Bonus callout */}
        <div style={s.bonusBanner}>
          <Gift size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#f59e0b' }}>First deposit bonus:</strong>
            {' '}100% match up to $50. Limited time.
          </span>
        </div>

        {/* Amount grid */}
        <div style={s.amountGrid}>
          {AMOUNTS.map(({ value, label, badge }) => (
            <button
              key={value}
              style={{
                ...s.amountBtn,
                ...(selected === value ? s.amountBtnActive : {}),
              }}
              onClick={() => setSelected(value)}
            >
              {badge && <span style={s.amountBadge}>{badge}</span>}
              <span style={s.amountLabel}>{label}</span>
            </button>
          ))}
        </div>

        {/* Projected return */}
        <div style={s.projRow}>
          <div style={s.projItem}>
            <TrendingUp size={13} style={{ color: 'var(--green)' }} />
            <span>Avg return on ${ selected}</span>
            <strong style={{ color: 'var(--green)' }}>+${Math.round(selected * 0.82)}</strong>
          </div>
          <div style={s.projItem}>
            <Zap size={13} style={{ color: '#f59e0b' }} />
            <span>Instant access</span>
            <strong style={{ color: '#f59e0b' }}>Yes</strong>
          </div>
        </div>

        <button style={s.depositBtn} onClick={() => onDeposit(selected)}>
          Deposit ${selected} and start winning
          <ArrowRight size={18} />
        </button>

        <button style={s.shameBtn} onClick={onSkip}>
          No thanks — I like watching others win while I sit out 😬
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>
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
    width: '100%', maxWidth: 460,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 24,
    padding: '28px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column', gap: 18,
  },
  activityBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderRadius: 8,
    background: 'rgba(0,200,150,0.06)',
    border: '1px solid rgba(0,200,150,0.12)',
    fontSize: 12, color: 'var(--text-secondary)',
  },
  activityDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse 1.5s ease infinite',
    flexShrink: 0,
    display: 'inline-block',
  },
  activityText: { flex: 1 },
  header: { textAlign: 'center' },
  trophy: { fontSize: 40, lineHeight: 1, marginBottom: 10 },
  title: {
    fontSize: 24, fontWeight: 900, color: 'var(--text)',
    letterSpacing: '-0.5px', marginBottom: 8,
  },
  sub: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 },
  bonusBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    fontSize: 13, color: 'var(--text-secondary)',
  },
  amountGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
  },
  amountBtn: {
    padding: '16px 12px',
    borderRadius: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'all 0.15s',
  },
  amountBtnActive: {
    border: '2px solid var(--green)',
    background: 'var(--green-dim)',
    boxShadow: '0 0 16px rgba(0,200,150,0.2)',
  },
  amountBadge: {
    position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
    padding: '2px 8px', borderRadius: 20,
    background: 'var(--green)', color: '#04080f',
    fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
  },
  amountLabel: { fontSize: 22, fontWeight: 900, color: 'var(--text)' },
  projRow: {
    display: 'flex', gap: 10,
  },
  projItem: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 12px', borderRadius: 10,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    fontSize: 12, color: 'var(--text-muted)',
  },
  depositBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px',
    borderRadius: 14,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 15, fontWeight: 800,
    boxShadow: '0 4px 24px rgba(0,200,150,0.4)',
  },
  shameBtn: {
    background: 'transparent', color: 'var(--text-muted)',
    fontSize: 12, fontWeight: 500, padding: '4px',
    textDecoration: 'underline', textDecorationStyle: 'dotted',
    alignSelf: 'center',
  },
}
