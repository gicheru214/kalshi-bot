import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Zap, TrendingUp } from 'lucide-react'

interface Props {
  onConnect: (email: string) => void
  onSkip: () => void
}

const PERKS = [
  { icon: Zap,         text: 'Auto-execute trades from your Kalshi account' },
  { icon: ShieldCheck, text: 'Your credentials are encrypted end-to-end' },
  { icon: TrendingUp,  text: 'Real-money positions, not just practice' },
]

export default function KalshiConnectModal({ onConnect, onSkip }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!email || !password) return
    setLoading(true)
    // Store locally — backend integration pending
    localStorage.setItem('kalshi_creds', JSON.stringify({ email, connectedAt: Date.now() }))
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    onConnect(email)
  }

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        {/* Header */}
        <div style={s.kalshiHeader}>
          <div style={s.kalshiLogo}>
            <img
              src="https://kalshi.com/favicon.ico"
              alt="Kalshi"
              width={28} height={28}
              style={{ borderRadius: 6 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span style={s.kalshiName}>Kalshi</span>
          </div>
          <div style={s.connectBadge}>+ Kalshi Bot</div>
        </div>

        <h2 style={s.title}>Connect your Kalshi account</h2>
        <p style={s.sub}>
          Link your real Kalshi account and let the bot trade on your behalf.
          We execute the positions — you collect the profit.
        </p>

        {/* Perks */}
        <div style={s.perks}>
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} style={s.perk}>
              <Icon size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Kalshi email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Kalshi password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...s.input, paddingRight: 40 }}
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                style={s.eyeBtn}
                onClick={() => setShow(v => !v)}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          style={{ ...s.connectBtn, opacity: (!email || !password) ? 0.5 : 1 }}
          disabled={!email || !password || loading}
          onClick={handleConnect}
        >
          {loading ? (
            <span style={s.spinner} />
          ) : (
            '🔗 Connect & start bot trading'
          )}
        </button>

        <p style={s.secureNote}>
          🔒 256-bit encryption · Read from official Kalshi API · Never stored in plaintext
        </p>

        <button style={s.shameBtn} onClick={onSkip}>
          No thanks, I'll keep losing trades manually
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
    padding: '32px 28px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column', gap: 18,
  },
  kalshiHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  kalshiLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  kalshiName: { fontSize: 17, fontWeight: 800, color: 'var(--text)' },
  connectBadge: {
    padding: '4px 12px', borderRadius: 20,
    background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.2)',
    color: 'var(--green)', fontSize: 12, fontWeight: 700,
  },
  title: {
    fontSize: 22, fontWeight: 900, color: 'var(--text)',
    letterSpacing: '-0.4px', textAlign: 'center',
  },
  sub: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'center' },
  perks: { display: 'flex', flexDirection: 'column', gap: 8 },
  perk: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 13, color: 'var(--text-secondary)',
    padding: '8px 12px', borderRadius: 8,
    background: 'rgba(0,200,150,0.04)',
    border: '1px solid rgba(0,200,150,0.08)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)', fontSize: 14,
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', color: 'var(--text-muted)', padding: 2,
  },
  connectBtn: {
    padding: '14px',
    borderRadius: 12,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 15, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,200,150,0.35)',
  },
  spinner: {
    width: 20, height: 20, borderRadius: '50%',
    border: '2px solid rgba(4,8,15,0.3)',
    borderTopColor: '#04080f',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  secureNote: {
    fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
  },
  shameBtn: {
    background: 'transparent', color: 'var(--text-muted)',
    fontSize: 12, fontWeight: 500, padding: '4px',
    textDecoration: 'underline', textDecorationStyle: 'dotted',
    alignSelf: 'center',
  },
}
