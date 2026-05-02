import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Play } from 'lucide-react'

export default function VideoIntro() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleContinue = () => {
    if (user?.onboarded) navigate('/app')
    else navigate('/onboarding')
  }

  return (
    <div style={styles.page}>
      {/* Glow */}
      <div style={styles.glow} />

      {/* Logo */}
      <div style={styles.logoWrap} className="fade-up">
        <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#00c896,#00a8ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#04080f' }}>K</div>
        <span style={styles.logoText}>Kalshi Bot</span>
      </div>

      {/* Welcome text */}
      <div style={styles.textBlock} className="fade-up-1">
        <h1 style={styles.heading}>
          Welcome, {user?.name.split(' ')[0] || 'Trader'} 👋
        </h1>
        <p style={styles.sub}>
          Watch this quick intro to learn how prediction markets work — then dive in.
        </p>
      </div>

      {/* Video placeholder */}
      <div style={styles.videoWrap} className="fade-up-2">
        <div style={styles.videoFrame}>
          {/* Placeholder — replace src with real video URL */}
          <div style={styles.videoPlaceholder}>
            <div style={styles.playBtn}>
              <Play size={32} fill="white" style={{ marginLeft: 4 }} />
            </div>
            <p style={styles.placeholderLabel}>Intro video coming soon</p>
            <p style={styles.placeholderSub}>
              This is where your onboarding video will live.
            </p>
          </div>

          {/* When you have a video URL, replace the div above with: */}
          {/* <video
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
            src="YOUR_VIDEO_URL"
            controls
            autoPlay
            poster="YOUR_THUMBNAIL_URL"
          /> */}
        </div>

        {/* Progress / chapter dots */}
        <div style={styles.dots}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ ...styles.dot, ...(i === 0 ? styles.dotActive : {}) }} />
          ))}
        </div>
      </div>

      {/* Skip / Continue */}
      <div style={styles.actions} className="fade-up-3">
        <button style={styles.skipBtn} onClick={handleContinue}>
          Skip for now
        </button>
        <button style={styles.continueBtn} onClick={handleContinue}>
          Continue <ArrowRight size={18} />
        </button>
      </div>
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
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
    gap: 28,
  },
  glow: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 24,
    color: 'var(--purple-light)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  textBlock: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    maxWidth: 480,
  },
  heading: {
    fontSize: 'clamp(24px, 4vw, 36px)',
    fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  videoWrap: {
    width: '100%',
    maxWidth: 720,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  videoFrame: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: 20,
    overflow: 'hidden',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))',
    minHeight: 200,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
  },
  placeholderSub: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  dots: {
    display: 'flex',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--border-bright)',
  },
  dotActive: {
    background: 'var(--purple)',
    width: 24,
    borderRadius: 4,
  },
  actions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  skipBtn: {
    padding: '12px 24px',
    borderRadius: 12,
    background: 'transparent',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 600,
  },
  continueBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 28px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
  },
}
