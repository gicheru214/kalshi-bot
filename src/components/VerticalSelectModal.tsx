import { VERTICALS } from '../data/markets'

interface Props {
  onSelect: (verticalId: string) => void
}

export default function VerticalSelectModal({ onSelect }: Props) {
  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoRow}>
            <img src="/logo.png" alt="Kalshibot" style={{ height: 44, width: 'auto', borderRadius: 8, background: 'white', padding: '2px 8px' }} />
          </div>
          <p style={s.eyebrow}>Welcome to the platform</p>
          <h1 style={s.title}>What do you want to trade?</h1>
          <p style={s.sub}>Pick your poison. We'll build your feed around it.</p>
        </div>

        {/* Vertical cards */}
        <div style={s.grid}>
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              style={s.card}
              onClick={() => onSelect(v.id)}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = v.color
                el.style.background = v.colorDim
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = `0 12px 40px ${v.colorDim}`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border-bright)'
                el.style.background = 'var(--bg-card)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <span style={s.emoji}>{v.emoji}</span>
              <p style={{ ...s.cardLabel, color: v.color }}>{v.label}</p>
              <p style={s.cardTagline}>{v.tagline}</p>
              <div style={{ ...s.pill, background: v.colorDim, color: v.color }}>
                Trade now →
              </div>
            </button>
          ))}
        </div>

        <p style={s.disclaimer}>
          You can always switch verticals later from your dashboard.
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(4,8,15,0.92)',
    backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 680,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 24,
    padding: '36px 32px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logoRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 20,
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 900, color: '#04080f',
  },
  logoText: { fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' },
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8,
  },
  title: {
    fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900,
    color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8,
  },
  sub: { fontSize: 14, color: 'var(--text-secondary)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    padding: '22px 18px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 8,
    transition: 'all 0.2s ease',
  },
  emoji: { fontSize: 32, lineHeight: 1 },
  cardLabel: { fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' },
  cardTagline: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 },
  pill: {
    alignSelf: 'flex-start',
    padding: '4px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700, marginTop: 4,
  },
  disclaimer: {
    fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
  },
}
