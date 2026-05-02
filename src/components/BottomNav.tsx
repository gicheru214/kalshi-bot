import { Link, useLocation } from 'react-router-dom'
import { BarChart2, TrendingUp, PlusCircle, User } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app',           icon: BarChart2,  label: 'Markets' },
  { to: '/app/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { to: '/app/create',    icon: PlusCircle, label: 'Create', highlight: true },
  { to: '/app/profile',   icon: User,       label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav style={s.nav}>
      {NAV_ITEMS.map(({ to, icon: Icon, label, highlight }) => {
        const active = location.pathname === to
        return (
          <Link key={to} to={to} style={s.item}>
            <div style={{
              ...s.iconWrap,
              ...(highlight ? s.iconWrapHighlight : {}),
              ...(active && !highlight ? s.iconWrapActive : {}),
            }}>
              <Icon
                size={highlight ? 20 : 19}
                style={{ color: highlight ? '#04080f' : active ? 'var(--green)' : 'var(--text-muted)' }}
              />
            </div>
            {!highlight && (
              <span style={{
                ...s.label,
                color: active ? 'var(--green)' : 'var(--text-muted)',
              }}>
                {label}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: 68,
    background: 'rgba(4,8,15,0.96)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    padding: '0 8px', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 99,
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, flex: 1, textDecoration: 'none', padding: '4px 0',
  },
  iconWrap: {
    width: 38, height: 34, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  iconWrapActive: { background: 'var(--green-dim)' },
  iconWrapHighlight: {
    width: 42, height: 38,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    borderRadius: 11,
    boxShadow: '0 4px 16px rgba(0,200,150,0.4)',
  },
  label: { fontSize: 10, fontWeight: 600, letterSpacing: '0.2px' },
}
