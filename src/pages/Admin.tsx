import { useState } from 'react'
import { Lock, Users, TrendingUp, Eye, Smartphone, Monitor, ChevronDown, ChevronUp } from 'lucide-react'

interface ActivityEvent {
  step: string
  ts: number
}

interface SelectionRecord {
  userId: string
  email: string
  name: string
  vertical: string
  marketsViewed: string[]
  kalshiConnected: boolean
  depositAmount: number | null
  funnelStep: string
  device: 'mobile' | 'desktop'
  sessions: number
  firstSeen: number
  lastSeen: number
  activity: ActivityEvent[]
  // legacy compat
  timestamp?: number
}

const VERTICAL_LABELS: Record<string, string> = {
  crypto: '₿ Crypto',
  meme:   '🐸 Meme Coins',
  sports: '🏆 Sports',
  viral:  '🔥 Viral & Chaos',
}

const FUNNEL_STEPS = ['vertical', 'tour', 'kalshi', 'deposit', 'done']
const FUNNEL_LABELS: Record<string, string> = {
  vertical: 'Picked vertical',
  tour:     'Watched tour',
  kalshi:   'Kalshi step',
  deposit:  'Deposit step',
  done:     '✅ Completed',
}

function leadScore(r: SelectionRecord): number {
  let score = 0
  if (r.vertical)          score += 10
  if (r.marketsViewed?.length) score += Math.min(r.marketsViewed.length * 5, 20)
  if (r.kalshiConnected)   score += 30
  if (r.depositAmount)     score += 40
  return Math.min(score, 100)
}

function scoreColor(score: number) {
  if (score >= 80) return '#00c896'
  if (score >= 50) return '#f59e0b'
  return '#f43f5e'
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getRecords(): SelectionRecord[] {
  try {
    return JSON.parse(localStorage.getItem('admin_selections') || '[]')
  } catch { return [] }
}

function LeadRow({ r }: { r: SelectionRecord }) {
  const [open, setOpen] = useState(false)
  const score = leadScore(r)

  return (
    <>
      <tr style={s.tr} onClick={() => setOpen(v => !v)}>
        {/* Lead */}
        <td style={s.td}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>
              {r.name || '—'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email || '—'}</span>
          </div>
        </td>
        {/* Device */}
        <td style={s.td}>
          {r.device === 'mobile'
            ? <Smartphone size={14} style={{ color: 'var(--green)' }} />
            : <Monitor size={14} style={{ color: 'var(--text-muted)' }} />}
        </td>
        {/* Vertical */}
        <td style={s.td}>{VERTICAL_LABELS[r.vertical] ?? r.vertical ?? '—'}</td>
        {/* Funnel stage */}
        <td style={s.td}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: r.funnelStep === 'done' ? 'rgba(0,200,150,0.1)' : 'rgba(245,158,11,0.1)',
            color: r.funnelStep === 'done' ? 'var(--green)' : '#f59e0b',
          }}>
            {FUNNEL_LABELS[r.funnelStep] ?? r.funnelStep ?? '—'}
          </span>
        </td>
        {/* Score */}
        <td style={s.td}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `conic-gradient(${scoreColor(score)} ${score}%, var(--border) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: scoreColor(score) }}>
                {score}
              </div>
            </div>
          </div>
        </td>
        {/* Kalshi */}
        <td style={s.td}>
          <span style={{ color: r.kalshiConnected ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
            {r.kalshiConnected ? '✓' : '✗'}
          </span>
        </td>
        {/* Deposit */}
        <td style={s.td}>
          {r.depositAmount
            ? <span style={{ color: 'var(--green)', fontWeight: 800 }}>${r.depositAmount}</span>
            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </td>
        {/* Last seen */}
        <td style={s.td}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {timeAgo(r.lastSeen ?? r.timestamp ?? Date.now())}
          </span>
        </td>
        {/* Expand */}
        <td style={s.td}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>

      {/* Expanded detail */}
      {open && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={9} style={{ padding: '0 14px 16px', background: 'var(--bg)' }}>
            <div style={s.detail}>
              {/* Lead info */}
              <div style={s.detailSection}>
                <p style={s.detailTitle}>Lead Info</p>
                <div style={s.detailGrid}>
                  <DetailItem label="Name"      value={r.name || '—'} />
                  <DetailItem label="Email"     value={r.email || '—'} />
                  <DetailItem label="Device"    value={r.device ?? '—'} />
                  <DetailItem label="Sessions"  value={String(r.sessions ?? 1)} />
                  <DetailItem label="First seen" value={r.firstSeen ? new Date(r.firstSeen).toLocaleString() : '—'} />
                  <DetailItem label="Last seen"  value={r.lastSeen ? new Date(r.lastSeen).toLocaleString() : '—'} />
                  <DetailItem label="Markets viewed" value={`${r.marketsViewed?.length ?? 0} markets`} />
                  <DetailItem label="Vertical"  value={VERTICAL_LABELS[r.vertical] ?? r.vertical ?? '—'} />
                </div>
              </div>

              {/* Funnel progress */}
              <div style={s.detailSection}>
                <p style={s.detailTitle}>Funnel Progress</p>
                <div style={s.funnelRow}>
                  {FUNNEL_STEPS.map((step, i) => {
                    const reached = FUNNEL_STEPS.indexOf(r.funnelStep) >= i || r.funnelStep === 'done'
                    return (
                      <div key={step} style={s.funnelStep}>
                        <div style={{ ...s.funnelDot, background: reached ? 'var(--green)' : 'var(--border-bright)' }} />
                        <span style={{ fontSize: 10, color: reached ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                          {FUNNEL_LABELS[step]}
                        </span>
                        {i < FUNNEL_STEPS.length - 1 && (
                          <div style={{ ...s.funnelLine, background: reached ? 'var(--green)' : 'var(--border)' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Activity log */}
              {r.activity?.length > 0 && (
                <div style={s.detailSection}>
                  <p style={s.detailTitle}>Activity Log</p>
                  <div style={s.activityLog}>
                    {[...r.activity].reverse().map((ev, i) => (
                      <div key={i} style={s.activityItem}>
                        <span style={s.activityDot} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {FUNNEL_LABELS[ev.step] ?? ev.step}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                          {timeAgo(ev.ts)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.detailItem}>
      <span style={s.detailLabel}>{label}</span>
      <span style={s.detailValue}>{value}</span>
    </div>
  )
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const records = getRecords()
  const totalDeposits = records.reduce((s, r) => s + (r.depositAmount ?? 0), 0)
  const connected = records.filter(r => r.kalshiConnected).length
  const mobileUsers = records.filter(r => r.device === 'mobile').length
  const completed = records.filter(r => r.funnelStep === 'done').length
  const verticalCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.vertical] = (acc[r.vertical] ?? 0) + 1; return acc
  }, {})

  const filtered = records
    .filter(r => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (r.email ?? '').toLowerCase().includes(q) || (r.name ?? '').toLowerCase().includes(q)
    })
    .slice()
    .sort((a, b) => (b.lastSeen ?? b.timestamp ?? 0) - (a.lastSeen ?? a.timestamp ?? 0))

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
          <p style={s.lockSub}>Enter admin password to view leads</p>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={s.title}>Lead Dashboard</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {records.length} leads
        </span>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <StatCard icon={<Users size={15} style={{ color: 'var(--green)' }} />} val={records.length} label="Total Leads" />
        <StatCard icon={<TrendingUp size={15} style={{ color: 'var(--green)' }} />} val={`$${totalDeposits}`} label="Deposits" />
        <StatCard icon={<Eye size={15} style={{ color: 'var(--green)' }} />} val={connected} label="Kalshi Connected" />
        <StatCard icon={<span style={{ fontSize: 14 }}>✅</span>} val={completed} label="Completed" />
        <StatCard icon={<Smartphone size={15} style={{ color: 'var(--green)' }} />} val={mobileUsers} label="Mobile" />
        <StatCard icon={<span style={{ fontSize: 14 }}>🎯</span>} val={`${records.length ? Math.round((connected / records.length) * 100) : 0}%`} label="Connect Rate" />
      </div>

      {/* Vertical breakdown */}
      {Object.keys(verticalCounts).length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Vertical Breakdown</p>
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
      )}

      {/* Lead table */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={s.sectionTitle}>All Leads</p>
          <input
            style={s.searchInput}
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {records.length === 0 ? 'No leads yet. Users appear here after starting onboarding.' : 'No results.'}
          </p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Lead', 'Device', 'Vertical', 'Stage', 'Score', 'Kalshi', 'Deposit', 'Last Seen', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => <LeadRow key={r.userId} r={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}

function StatCard({ icon, val, label }: { icon: React.ReactNode; val: string | number; label: string }) {
  return (
    <div style={s.statCard}>
      {icon}
      <p style={s.statVal}>{val}</p>
      <p style={s.statLabel}>{label}</p>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  lockPage: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  lockCard: {
    width: '100%', maxWidth: 360, background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)', borderRadius: 20, padding: '36px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  },
  lockTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 6 },
  lockSub: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' },
  lockForm: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  lockInput: {
    padding: '12px 14px', borderRadius: 10, background: 'var(--bg)',
    border: '1px solid var(--border-bright)', color: 'var(--text)', fontSize: 15,
    textAlign: 'center', letterSpacing: '2px',
  },
  lockError: { fontSize: 12, color: 'var(--red)', textAlign: 'center' },
  lockBtn: { padding: '12px', borderRadius: 10, background: 'var(--green)', color: '#04080f', fontSize: 14, fontWeight: 800 },
  page: { maxWidth: 1200, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, margin: '20px 0 24px' },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
    padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center',
  },
  statVal: { fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' },
  statLabel: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' },
  verticalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 },
  vertCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', textAlign: 'center' },
  vertLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  vertCount: { fontSize: 24, fontWeight: 900, color: 'var(--green)' },
  vertPct: { fontSize: 11, color: 'var(--text-muted)' },
  searchInput: {
    padding: '7px 12px', borderRadius: 8, background: 'var(--bg-card)',
    border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, width: 220,
  },
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    color: 'var(--text-muted)', letterSpacing: '0.5px', background: 'var(--bg-card)',
    textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid var(--border)', cursor: 'pointer' },
  td: { padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg)', whiteSpace: 'nowrap' },
  // Expanded detail
  detail: { display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0 4px' },
  detailSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  detailTitle: { fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 },
  detailItem: {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)',
  },
  detailLabel: { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  funnelRow: { display: 'flex', alignItems: 'flex-start', gap: 0 },
  funnelStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, position: 'relative' },
  funnelDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  funnelLine: { position: 'absolute', top: 6, left: '50%', width: '100%', height: 2, zIndex: 0 } as React.CSSProperties,
  activityLog: { display: 'flex', flexDirection: 'column', gap: 4 },
  activityItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', borderRadius: 6, background: 'var(--bg-card)',
  },
  activityDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, display: 'inline-block' },
}
