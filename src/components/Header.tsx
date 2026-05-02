import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronDown, LogOut, User, Wallet, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <header style={s.header}>
      <div style={s.inner}>
        <Link to="/app" style={s.logo}>
          <img src="/logo.png" alt="Kalshibot" style={s.logoImg} />
        </Link>

        <nav className="header-nav" style={s.nav}>
          {[
            { to: '/app', label: 'Markets' },
            { to: '/app/portfolio', label: 'Portfolio' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...s.navLink,
                ...(location.pathname === to ? s.navLinkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={s.right}>
          <button style={s.iconBtn}><Search size={17} /></button>
          <button style={s.iconBtn}><Bell size={17} /></button>
          <button style={s.iconBtn} onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div style={s.balanceChip}>
            <Wallet size={12} style={{ color: 'var(--green)' }} />
            <span style={s.balanceText}>${user?.balance.toLocaleString()}</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button style={s.avatarBtn} onClick={() => setMenuOpen(v => !v)}>
              <div style={s.avatarCircle}>{user?.name.charAt(0).toUpperCase()}</div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)', marginLeft: 3 }} />
            </button>

            {menuOpen && (
              <div style={s.dropdown}>
                <div style={s.dropdownHeader}>
                  <p style={s.dropdownName}>{user?.name}</p>
                  <p style={s.dropdownEmail}>{user?.email}</p>
                </div>
                <div style={s.dropdownDivider} />
                <button style={s.dropdownItem}><User size={13} /> Profile</button>
                <button style={s.dropdownItem} onClick={handleSignOut}><LogOut size={13} /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const s: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(4,8,15,0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 20px',
    height: 58, display: 'flex', alignItems: 'center', gap: 20,
  },
  logo: {
    display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0,
    background: 'white', borderRadius: 8, padding: '2px 8px',
  },
  logoImg: { height: 30, width: 'auto' },
  nav: { display: 'flex', gap: 2, flex: 1 },
  navLink: {
    padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)', transition: 'all 0.15s',
  },
  navLinkActive: { color: 'var(--text)', background: 'var(--bg-elevated)' },
  right: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 8, background: 'transparent',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  balanceChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 20,
    background: 'var(--green-dim2)', border: '1px solid rgba(0,200,150,0.18)',
  },
  balanceText: { fontSize: 13, fontWeight: 700, color: 'var(--green)' },
  avatarBtn: { display: 'flex', alignItems: 'center', background: 'transparent', padding: '3px 6px', borderRadius: 8 },
  avatarCircle: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#04080f',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 210,
    background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
    borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  dropdownHeader: { padding: '12px 14px' },
  dropdownName: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  dropdownEmail: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  dropdownDivider: { height: 1, background: 'var(--border)' },
  dropdownItem: {
    width: '100%', padding: '9px 14px', background: 'transparent',
    color: 'var(--text-secondary)', fontSize: 13, display: 'flex',
    alignItems: 'center', gap: 8, textAlign: 'left',
  },
}
