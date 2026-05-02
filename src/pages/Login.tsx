import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }

    setLoading(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password, name)
      navigate('/intro')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background glow */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      {/* Back to landing */}
      <div style={styles.topBar}>
        <Link to="/" style={styles.backLink}>
          <span style={{ color: 'var(--green)', marginRight: 6, fontSize: 18 }}>K</span>
          Kalshi Bot
        </Link>
      </div>

      {/* Card */}
      <div style={styles.card} className="fade-up">
        {/* Header */}
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to continue trading'
              : 'Start with $1,000 in practice chips'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={styles.modeToggle}>
          <button
            style={{ ...styles.modeBtn, ...(mode === 'signin' ? styles.modeBtnActive : {}) }}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            style={{ ...styles.modeBtn, ...(mode === 'signup' ? styles.modeBtnActive : {}) }}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full name</label>
              <div style={styles.inputWrap}>
                <User size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={styles.input}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Google (placeholder) */}
        <button style={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.638-.058-1.252-.166-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.25 17.64 11.9 17.64 9.2z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer note */}
        <p style={styles.footerNote}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--green)', cursor: 'pointer' }}>Terms</span>{' '}
          and{' '}
          <span style={{ color: 'var(--green)', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow1: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute',
    bottom: '10%',
    right: '15%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  topBar: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  backLink: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 24,
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
  },
  cardHeader: { marginBottom: 24, textAlign: 'center' },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  modeToggle: {
    display: 'flex',
    background: 'var(--bg)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: 'transparent',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: 'var(--bg-card)',
    color: 'var(--text)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'transparent',
    color: 'var(--text-muted)',
    padding: 4,
  },
  error: {
    fontSize: 13,
    color: 'var(--red)',
    background: 'var(--red-dim)',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(239,68,68,0.2)',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px',
    borderRadius: 12,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 15,
    fontWeight: 700,
    boxShadow: '0 4px 20px rgba(0,200,150,0.25)',
    marginTop: 4,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'var(--border)',
  },
  dividerText: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px',
    borderRadius: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 20,
  },
  footerNote: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1.6,
  },
}
