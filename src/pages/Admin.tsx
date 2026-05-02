import { useState } from 'react'
import { Lock, Users, TrendingUp, Eye } from 'lucide-react'

interface SelectionRecord {
  userId: string
  email: string
  vertical: string
  marketsViewed: string[]
  kalshiConnected: boolean
  depositAmount: number | null
  timestamp: number
}

function getRecords(): SelectionRecord[] {
  try {
    return JSON.parse(localStorage.getItem('admin_selections') || '[]')
  } catch { return [] }
}

const VERTICAL_LABELS: Record<string, string> = {
  crypto: '₿ Crypto',
  meme:   '🐸 Meme Coins',
  sports: '🏆 Sports',
  viral:  '🔥 Viral & Chaos',
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const records = getRecords()
  const totalDeposits = records.reduce((s, r) => s + (r.depositAmount ?? 0), 0)
  const connected = records.filter(r => r.kalshiConnected).length
  const verticalCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.vertical] = (acc[r.vertical] ?? 0) + 1; return acc
  }, {})

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === 'get rich') setUnlocked(true)
    else { setError('Wrong password'); setTimeout(() => setError(''), 2000) }
  }

  if (!unlocked) {
    return (
      <div style={s.lockPage}>
        <div style={s.lockCard}>
          <Lock size={28} style={{ color: 'var(--green)', marginBottom: 12 }} />
          <h2 style={s.lockTitle}>Admin Access</h2>
          <p style={s.lockSub}>Enter admin password to view user selections</p>
          <form onSubmit={handleUnlock} style={s.lockForm}>
            <input
              style={s.lockInput}
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoFocus
            />
            {error && <p style={s.lockError}>{error}</p>}
            <button type="submit" style={s.lockBtn}>Unlock</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Admin Dashboard</h1>
      <p style={s.sub}>{records.length} total users tracked</p>

      {/* Summary stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <Users size={16} style={{ color: 'var(--green)' }} />
          <p style={s.statVal}>{records.length}</p>
          <p style={s.statLabel}>Total Users</p>
        </div>
        <div style={s.statCard}>
          <TrendingUp size={16} style={{ color: 'var(--green)' }} />
          <p style={s.statVal}>${totalDeposits}</p>
          <p style={s.statLabel}>Total Deposits</p>
        </div>
        <div style={s.statCard}>
          <Eye size={16} style={{ color: 'var(--green)' }} />
          <p style={s.statVal}>{connected}</p>
          <p style={s.statLabel}>Kalshi Connected</p>
        </div>
        <div style={s.statCard}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <p style={s.statVal}>{records.length ? Math.round((connected / records.length) * 100) : 0}%</p>
          <p style={s.statLabel}>Connect Rate</p>
        </div>
      </div>

      {/* Vertical breakdown */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Vertical Selections</h2>
        <div style={s.verticalGrid}>
          {Object.entries(verticalCounts).map(([v, count]) => (
            <div key={v} style={s.vertCard}>
              <p style={s.vertLabel}>{VERTICAL_LABELS[v] ?? v}</p>
              <p style={s.vertCount}>{count}</p>
              <p style={s.vertPct}>{Math.round((count / records.length) * 100)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* User table */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>User Records</h2>
        {records.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No records yet. Users will appear here after completing onboarding.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Email', 'Vertical', 'Markets Viewed', 'Kalshi', 'Deposit', 'Time'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice().reverse().map((r, i) => (
                  <tr key={i} style={s.tr}>
                    <td style={s.td}>{r.email || '—'}</td>
                    <td style={s.td}>{VERTICAL_LABELS[r.vertical] ?? r.vertical}</td>
                    <td style={s.td}>{r.marketsViewed.length} markets</td>
                    <td style={s.td}>
                      <span style={{ color: r.kalshiConnected ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {r.kalshiConnected ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td style={s.td}>
                      {r.depositAmount ? (
                        <span style={{ color: 'var(--green)', fontWeight: 700 }}>${r.depositAmount}</span>
                      ) : '—'}
                    </td>
                    <td style={s.td}>
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 80 }} />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  lockPage: {
    minHeight: '80vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px',
  },
  lockCard: {
    width: '100%', maxWidth: 360,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 20,
    padding: '36px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  },
  lockTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 6 },
  lockSub: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' },
  lockForm: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  lockInput: {
    padding: '12px 14px', borderRadius: 10,
    background: 'var(--bg)', border: '1px solid var(--border-bright)',
    color: 'var(--text)', fontSize: 15, textAlign: 'center',
    letterSpacing: '2px',
  },
  lockError: { fontSize: 12, color: 'var(--red)', textAlign: 'center' },
  lockBtn: {
    padding: '12px', borderRadius: 10,
    background: 'var(--green)', color: '#04080f',
    fontSize: 14, fontWeight: 800,
  },
  page: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12, marginBottom: 28,
  },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    textAlign: 'center',
  },
  statVal: { fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' },
  statLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14 },
  verticalGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10,
  },
  vertCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px', textAlign: 'center',
  },
  vertLabel: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  vertCount: { fontSize: 26, fontWeight: 900, color: 'var(--green)' },
  vertPct: { fontSize: 11, color: 'var(--text-muted)' },
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    color: 'var(--text-muted)', letterSpacing: '0.5px',
    background: 'var(--bg-card)', textAlign: 'left',
    borderBottom: '1px solid var(--border)',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: {
    padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)',
    background: 'var(--bg)',
  },
}
