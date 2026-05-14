import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Star, ChevronDown, ChevronUp, X, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'

const STATS = [
  { value: '$2.4B+', label: 'Total Volume Traded' },
  { value: '340K+', label: 'Active Traders' },
  { value: '99.9%', label: 'Uptime Reliability' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Bank-Level Security' },
  { icon: Zap,         label: 'Instant Payouts' },
  { icon: TrendingUp,  label: 'Real-Time Prices' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    desc: 'Sign up free in 60 seconds. No credit card required. Start with $1,000 in practice balance.',
  },
  {
    step: '02',
    title: 'Pick a market',
    desc: 'Browse crypto, stocks, politics, sports — or create your own custom prediction market.',
  },
  {
    step: '03',
    title: 'Trade YES or NO',
    desc: 'Buy a position for as little as $1. Cash out any time before resolution at market price.',
  },
]

const MARKETS_PREVIEW = [
  { title: 'Will Bitcoin hit $200K in 2025?',    yes: 61, vol: '$4.8M', category: 'Crypto',   hot: true },
  { title: 'Will Ethereum reach $5,000 in 2025?',yes: 72, vol: '$3.1M', category: 'Crypto',   hot: true },
  { title: 'Will the S&P 500 close above 6,500?', yes: 58, vol: '$5.2M', category: 'Stocks',   hot: false },
  { title: 'Will the Fed cut rates twice in 2025?',yes: 49, vol: '$3.8M', category: 'Macro',    hot: false },
]

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    handle: '@marcust_trades',
    avatar: 'M',
    text: 'Finally a prediction market that actually pays out fast. Made $4,200 on the BTC ETF approval call. The UI is clean and the prices feel real.',
    stars: 5,
  },
  {
    name: 'Priya K.',
    handle: '@priyak',
    avatar: 'P',
    text: "I've been on Kalshi and Polymarket. This platform's mobile experience is 10x better. I trade during my lunch break every day.",
    stars: 5,
  },
  {
    name: 'Jason L.',
    handle: '@jasonlai_fin',
    avatar: 'J',
    text: 'The custom market feature is insane. I created a market on our office March Madness bracket and we all traded on it. So much fun.',
    stars: 5,
  },
]

const FAQS = [
  {
    q: 'How do payouts work?',
    a: 'When a market resolves, winners receive $1.00 per share they hold on the correct side. Payouts are instant and reflected in your balance immediately.',
  },
  {
    q: 'What markets can I trade?',
    a: 'Crypto (BTC, ETH, SOL and more), stocks & indices, politics, sports, macro economics — and any custom market you create yourself.',
  },
  {
    q: 'Can I withdraw my winnings?',
    a: 'Yes. Connect your bank account or crypto wallet and withdraw any time. Most withdrawals process within 1 business day.',
  },
]

const TICKER_ITEMS = [
  { label: 'BTC $200K?', price: '61¢', up: true },
  { label: 'ETH $5K?',   price: '72¢', up: true },
  { label: 'SOL $1K?',   price: '44¢', up: false },
  { label: 'S&P >6500?', price: '58¢', up: true },
  { label: 'Fed Cuts 2×?',price: '49¢', up: false },
  { label: 'XRP SEC Win?',price: '78¢', up: true },
  { label: 'DOGE $1?',   price: '38¢', up: false },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={faqStyles.item} onClick={() => setOpen(v => !v)}>
      <div style={faqStyles.question}>
        <span style={faqStyles.qText}>{q}</span>
        {open ? <ChevronUp size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
               : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </div>
      {open && <p style={faqStyles.answer}>{a}</p>}
    </div>
  )
}

const faqStyles: Record<string, React.CSSProperties> = {
  item: {
    padding: '18px 20px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  },
  question: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  qText: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  answer: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 10 },
}

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const go = () => { if (user) navigate('/app'); else navigate('/login') }

  const [showTimedPopup, setShowTimedPopup] = useState(false)
  const [showScrollPopup, setShowScrollPopup] = useState(false)
  const scrollPopupFired = useRef(false)

  // 3-second timed popup — show once per visitor (persists across sessions)
  useEffect(() => {
    if (localStorage.getItem('timed_popup_seen')) return
    const t = setTimeout(() => setShowTimedPopup(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Scroll-to-bottom popup — show once per visitor
  useEffect(() => {
    const onScroll = () => {
      if (scrollPopupFired.current) return
      if (localStorage.getItem('scroll_popup_seen')) return
      const scrolled = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop
      const total = document.body.scrollHeight
      const threshold = total - window.innerHeight - 300
      if (scrolled >= threshold && threshold > 0) {
        scrollPopupFired.current = true
        setShowScrollPopup(true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  const dismissTimedPopup = () => {
    setShowTimedPopup(false)
    localStorage.setItem('timed_popup_seen', '1')
  }

  const dismissScrollPopup = () => {
    setShowScrollPopup(false)
    localStorage.setItem('scroll_popup_seen', '1')
  }

  const goFromPopup = () => {
    localStorage.setItem('timed_popup_seen', '1')
    localStorage.setItem('scroll_popup_seen', '1')
    go()
  }

  return (
    <div style={s.page}>

      {/* ── STICKY NAV ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>K</div>
            <span style={s.logoText}>Kalshi Bot</span>
          </div>
          <div style={s.navRight}>
            <button style={s.navGhost} onClick={() => navigate('/login')}>Sign in</button>
            <button style={s.navCTA} onClick={go}>
              Get started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── LIVE TICKER ── */}
      <div style={s.ticker}>
        <span style={s.tickerPill}>LIVE</span>
        <div style={s.tickerTrack}>
          <div style={s.tickerInner}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={s.tickerItem}>
                <span style={{ ...s.tickerDot, background: item.up ? 'var(--green)' : 'var(--red)' }} />
                {item.label}
                <strong style={{ color: item.up ? 'var(--green)' : 'var(--red)', marginLeft: 2 }}>
                  {item.price}
                </strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroGlow1} />
        <div style={s.heroGlow2} />

        {/* Social proof pill */}
        <div className="fade-up" style={s.socialPill}>
          <span style={s.socialPillDots}>
            {['A','B','C','D','E'].map((l,i) => (
              <span key={i} style={{ ...s.socialAvatar, zIndex: 5-i, marginLeft: i ? -8 : 0 }}>{l}</span>
            ))}
          </span>
          <span style={s.socialPillText}>
            <strong style={{ color: 'var(--green)' }}>340,000+</strong> traders already on the platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up-1" style={s.heroTitle}>
          The smartest way<br />
          to <span className="grad-text">trade predictions</span>
        </h1>
        <p className="fade-up-2" style={s.heroSub}>
          Bet YES or NO on crypto, markets, politics, and sports.
          Real prices. Instant payouts. Custom markets on anything.
        </p>

        {/* CTA */}
        <div className="fade-up-3" style={s.heroCTAs}>
          <button style={s.heroBtn} onClick={go}>
            Start trading free
            <ArrowRight size={18} />
          </button>
          <p style={s.heroNote}>No credit card · $1,000 practice balance · Takes 60 seconds</p>
        </div>

        {/* Trust badges */}
        <div className="fade-up-4" style={s.trustRow}>
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} style={s.trustBadge}>
              <Icon size={14} style={{ color: 'var(--green)' }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Market card preview (mobile-optimized) */}
        <div className="fade-up-5" style={s.previewCard}>
          <div style={s.previewHeader}>
            <span style={s.previewCategory}>₿ CRYPTO</span>
            <span style={s.previewLive}>● LIVE</span>
          </div>
          <p style={s.previewTitle}>Will Bitcoin hit $200,000 before end of 2025?</p>
          <div style={s.previewBar}>
            <div style={s.previewBarFill} />
          </div>
          <div style={s.previewPrices}>
            <div style={s.previewYes}>
              <span style={s.previewSideLabel}>YES</span>
              <span style={s.previewPrice}>61¢</span>
            </div>
            <div style={s.previewDivide} />
            <div style={s.previewNo}>
              <span style={s.previewPrice}>39¢</span>
              <span style={s.previewSideLabel}>NO</span>
            </div>
          </div>
          <div style={s.previewFooter}>
            <span style={s.previewVol}>$4.8M volume</span>
            <span style={{ ...s.previewVol, color: 'var(--green)' }}>▲ 3.2% today</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={s.statsSection}>
        <div style={s.statsInner}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={s.statItem}>
              <p style={s.statValue}>{value}</p>
              <p style={s.statLabel}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>How it works</p>
          <h2 style={s.sectionTitle}>
            From zero to trading<br className="hide-desktop" /> in three steps
          </h2>
          <div style={s.stepsGrid}>
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} style={s.stepCard}>
                <div style={s.stepNumber}>{step}</div>
                <h3 style={s.stepTitle}>{title}</h3>
                <p style={s.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE MARKETS PREVIEW ── */}
      <section style={{ ...s.section, background: 'rgba(0,200,150,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>Live markets</p>
          <h2 style={s.sectionTitle}>What people are trading right now</h2>
          <div style={s.marketsGrid}>
            {MARKETS_PREVIEW.map((m, i) => (
              <div key={i} style={s.mCard} onClick={go}>
                <div style={s.mTop}>
                  <span style={s.mCat}>{m.category}</span>
                  {m.hot && <span style={s.mHot}>🔥 Hot</span>}
                </div>
                <p style={s.mTitle}>{m.title}</p>
                <div style={s.mBar}>
                  <div style={{ ...s.mBarFill, width: `${m.yes}%` }} />
                </div>
                <div style={s.mPrices}>
                  <button style={s.mYes}>YES {m.yes}¢</button>
                  <button style={s.mNo}>NO {100 - m.yes}¢</button>
                </div>
                <p style={s.mVol}>{m.vol} volume</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button style={s.viewAllBtn} onClick={go}>
              View all markets <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>What traders say</p>
          <h2 style={s.sectionTitle}>Real results from real people</h2>
          <div style={s.testimonialsGrid}>
            {TESTIMONIALS.map(({ name, handle, avatar, text, stars }) => (
              <div key={name} style={s.tCard}>
                <div style={s.tStars}>
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p style={s.tText}>"{text}"</p>
                <div style={s.tAuthor}>
                  <div style={s.tAvatar}>{avatar}</div>
                  <div>
                    <p style={s.tName}>{name}</p>
                    <p style={s.tHandle}>{handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={s.section}>
        <div style={{ ...s.sectionInner, maxWidth: 680 }}>
          <p style={s.sectionEyebrow}>FAQ</p>
          <h2 style={s.sectionTitle}>Common questions</h2>
          <div style={s.faqBox}>
            {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <div style={s.ctaInner}>
          <p style={s.ctaEyebrow}>Ready to trade?</p>
          <h2 style={s.ctaTitle}>
            Turn your predictions<br />into profit
          </h2>
          <p style={s.ctaSub}>
            Join 340,000+ traders. Start free. No risk. $1,000 practice balance on signup.
          </p>
          <button style={s.ctaBtn} onClick={go}>
            Create free account
            <ArrowRight size={20} />
          </button>
          <p style={s.ctaNote}>Takes less than 60 seconds · No credit card required</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerTop}>
            <div style={s.logo}>
              <div style={s.logoMark}>K</div>
              <span style={s.logoText}>Kalshi Bot</span>
            </div>
            <p style={s.footerTagline}>The future is tradeable.</p>
          </div>
          <div style={s.footerDivider} />
          <p style={s.footerDisclaimer}>
            Kalshi Bot is an entertainment and practice trading platform. Not financial advice.
            Practice trading only. Always trade responsibly.
          </p>
          <p style={s.footerCopy}>© 2025 Kalshi Bot. All rights reserved.</p>
        </div>
      </footer>

      {/* ── TIMED POPUP (3 seconds) ── */}
      {showTimedPopup && (
        <div style={p.timedWrap}>
          <div style={p.timedCard}>
            <button style={p.closeBtn} onClick={dismissTimedPopup} aria-label="Close">
              <X size={15} />
            </button>
            <div style={p.timedBadge}>🔥 Markets moving now</div>
            <p style={p.timedTitle}>Turn your predictions<br />into real money</p>
            <p style={p.timedSub}>
              340,000+ traders are live right now on crypto, politics &amp; sports.
              Start with $1,000 free practice balance.
            </p>
            <button style={p.timedCTA} onClick={goFromPopup}>
              Start trading free <ArrowRight size={15} />
            </button>
            <p style={p.timedNote}>No credit card · 60 seconds to sign up</p>
          </div>
        </div>
      )}

      {/* ── SCROLL-TO-BOTTOM POPUP (free trading manual) ── */}
      {showScrollPopup && (
        <div style={p.scrollOverlay} onClick={dismissScrollPopup}>
          <div style={p.scrollCard} onClick={e => e.stopPropagation()}>
            <button style={p.closeBtn} onClick={dismissScrollPopup} aria-label="Close">
              <X size={15} />
            </button>
            <div style={p.manualIconWrap}>
              <BookOpen size={28} style={{ color: 'var(--green)' }} />
            </div>
            <p style={p.manualEyebrow}>FREE DOWNLOAD</p>
            <p style={p.manualTitle}>The Prediction Market Edge</p>
            <p style={p.manualSub}>
              Our 47-page trader manual covers everything you need to consistently profit:
            </p>
            <ul style={p.manualList}>
              <li>📈 How to find mispriced markets before the crowd</li>
              <li>🧠 Bayesian thinking for YES/NO decisions</li>
              <li>💰 Bankroll management & position sizing</li>
              <li>⚡ Reading order flow and volume signals</li>
              <li>🏆 The 5 edge patterns pros use every day</li>
            </ul>
            <button style={p.manualCTA} onClick={goFromPopup}>
              Get the free manual <ArrowRight size={15} />
            </button>
            <p style={p.manualNote}>Included free with your account — no upsell, ever</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll { animation: ticker 28s linear infinite; }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    overflowX: 'hidden',
  },

  /* NAV */
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(4,8,15,0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 20px',
    height: 58,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 900,
    color: '#04080f',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 10 },
  navGhost: {
    padding: '7px 14px',
    borderRadius: 8,
    background: 'transparent',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 600,
  },
  navCTA: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 13,
    fontWeight: 700,
  },

  /* TICKER */
  ticker: {
    background: 'rgba(0,200,150,0.05)',
    borderBottom: '1px solid rgba(0,200,150,0.1)',
    height: 34,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tickerPill: {
    padding: '0 12px',
    fontSize: 10,
    fontWeight: 800,
    color: '#04080f',
    letterSpacing: '1px',
    background: 'var(--green)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  tickerTrack: { flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' },
  tickerInner: {
    display: 'flex',
    whiteSpace: 'nowrap',
    animation: 'ticker 28s linear infinite',
  },
  tickerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '0 20px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    borderRight: '1px solid var(--border)',
  },
  tickerDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    display: 'inline-block',
  },

  /* HERO */
  hero: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '56px 20px 48px',
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  heroGlow1: {
    position: 'absolute',
    top: -60,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(0,200,150,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: 0,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  socialPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 14px 6px 6px',
    borderRadius: 100,
    background: 'rgba(0,200,150,0.08)',
    border: '1px solid rgba(0,200,150,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  socialPillDots: { display: 'flex', alignItems: 'center' },
  socialAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: '#04080f',
    border: '1px solid rgba(4,8,15,0.6)',
    position: 'relative',
  },
  socialPillText: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  heroTitle: {
    fontSize: 'clamp(34px, 6vw, 58px)',
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    color: 'var(--text)',
    position: 'relative',
    zIndex: 1,
  },
  heroSub: {
    fontSize: 'clamp(15px, 2vw, 18px)',
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
    maxWidth: 480,
    position: 'relative',
    zIndex: 1,
  },
  heroCTAs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 1,
    width: '100%',
  },
  heroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 32px',
    borderRadius: 12,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 16,
    fontWeight: 800,
    animation: 'glow 3s ease infinite',
    width: '100%',
    maxWidth: 360,
    justifyContent: 'center',
  },
  heroNote: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  trustRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },

  /* MARKET PREVIEW CARD */
  previewCard: {
    width: '100%',
    maxWidth: 400,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 18,
    padding: '20px',
    boxShadow: '0 0 0 1px rgba(0,200,150,0.08), 0 32px 80px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'relative',
    zIndex: 1,
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCategory: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 20,
    background: 'rgba(251,146,60,0.12)',
    color: '#fb923c',
    letterSpacing: '0.5px',
  },
  previewLive: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--green)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.4,
    textAlign: 'left',
  },
  previewBar: {
    height: 6,
    borderRadius: 3,
    background: 'var(--red-dim)',
    overflow: 'hidden',
  },
  previewBarFill: {
    width: '61%',
    height: '100%',
    background: 'linear-gradient(90deg, #00c896, #00e5ab)',
    borderRadius: 3,
  },
  previewPrices: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  previewYes: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 10,
    background: 'var(--green-dim)',
    border: '1px solid rgba(0,200,150,0.2)',
  },
  previewNo: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 10,
    background: 'var(--red-dim)',
    border: '1px solid rgba(244,63,94,0.2)',
  },
  previewDivide: { width: 1, height: 30, background: 'var(--border)' },
  previewSideLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' },
  previewPrice: { fontSize: 20, fontWeight: 900, color: 'var(--text)' },
  previewFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewVol: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },

  /* STATS */
  statsSection: {
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    padding: '32px 20px',
  },
  statsInner: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    textAlign: 'center',
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  statValue: {
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 900,
    color: 'var(--green)',
    letterSpacing: '-1px',
  },
  statLabel: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },

  /* SECTIONS */
  section: { padding: '60px 20px' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--green)',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 'clamp(24px, 3.5vw, 40px)',
    fontWeight: 900,
    letterSpacing: '-0.8px',
    color: 'var(--text)',
    lineHeight: 1.15,
    marginBottom: 36,
  },

  /* HOW IT WORKS */
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  stepCard: {
    padding: '28px 24px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--green)',
    letterSpacing: '1px',
    marginBottom: 14,
    fontFamily: 'monospace',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: 10,
  },
  stepDesc: { fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' },

  /* MARKETS GRID */
  marketsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  },
  mCard: {
    padding: '18px',
    borderRadius: 14,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'border-color 0.15s',
  },
  mTop: { display: 'flex', gap: 8, alignItems: 'center' },
  mCat: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(251,146,60,0.12)',
    color: '#fb923c',
    letterSpacing: '0.5px',
  },
  mHot: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(251,146,60,0.08)',
    color: '#fb923c',
  },
  mTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 },
  mBar: {
    height: 5,
    borderRadius: 3,
    background: 'var(--red-dim)',
    overflow: 'hidden',
  },
  mBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00c896, #00e5ab)',
    borderRadius: 3,
  },
  mPrices: { display: 'flex', gap: 8 },
  mYes: {
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    background: 'var(--green-dim)',
    border: '1px solid rgba(0,200,150,0.2)',
    color: 'var(--green)',
    fontSize: 13,
    fontWeight: 700,
  },
  mNo: {
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    background: 'var(--red-dim)',
    border: '1px solid rgba(244,63,94,0.2)',
    color: 'var(--red)',
    fontSize: 13,
    fontWeight: 700,
  },
  mVol: { fontSize: 12, color: 'var(--text-muted)' },
  viewAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    borderRadius: 10,
    background: 'transparent',
    border: '1px solid var(--green)',
    color: 'var(--green)',
    fontSize: 14,
    fontWeight: 700,
  },

  /* TESTIMONIALS */
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  tCard: {
    padding: '24px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  tStars: { display: 'flex', gap: 3 },
  tText: { fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', flex: 1 },
  tAuthor: { display: 'flex', gap: 10, alignItems: 'center' },
  tAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#04080f',
    flexShrink: 0,
  },
  tName: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  tHandle: { fontSize: 12, color: 'var(--text-muted)' },

  /* FAQ */
  faqBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflow: 'hidden',
  },

  /* CTA */
  ctaSection: {
    padding: '72px 20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(0,200,150,0.12) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  ctaInner: {
    maxWidth: 560,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  ctaEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--green)',
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 46px)',
    fontWeight: 900,
    letterSpacing: '-1px',
    lineHeight: 1.1,
    color: 'var(--text)',
  },
  ctaSub: {
    fontSize: 15,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  ctaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 36px',
    borderRadius: 12,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 16,
    fontWeight: 800,
    boxShadow: '0 8px 40px rgba(0,200,150,0.35)',
    width: '100%',
    maxWidth: 340,
    justifyContent: 'center',
  },
  ctaNote: { fontSize: 12, color: 'var(--text-muted)' },

  /* FOOTER */
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '32px 20px',
  },
  footerInner: { maxWidth: 1100, margin: '0 auto' },
  footerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  footerTagline: { fontSize: 13, color: 'var(--text-muted)' },
  footerDivider: { height: 1, background: 'var(--border)', marginBottom: 16 },
  footerDisclaimer: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    marginBottom: 8,
    maxWidth: 680,
  },
  footerCopy: { fontSize: 12, color: 'var(--text-muted)' },
}

/* ── POPUP STYLES ── */
const p: Record<string, React.CSSProperties> = {
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  /* Timed popup — bottom-right slide-up */
  timedWrap: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 999,
    animation: 'slideUp 0.35s ease',
  },
  timedCard: {
    width: 300,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 18,
    padding: '22px 20px 18px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,200,150,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
  },
  timedBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fb923c',
    background: 'rgba(251,146,60,0.1)',
    border: '1px solid rgba(251,146,60,0.2)',
    padding: '3px 10px',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timedTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: 'var(--text)',
    lineHeight: 1.25,
    letterSpacing: '-0.4px',
  },
  timedSub: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  timedCTA: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    borderRadius: 10,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 14,
    fontWeight: 800,
    boxShadow: '0 4px 20px rgba(0,200,150,0.35)',
  },
  timedNote: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
  },

  /* Scroll popup — centered overlay */
  scrollOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(4,8,15,0.85)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    animation: 'fadeIn 0.25s ease',
  },
  scrollCard: {
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 24,
    padding: '32px 28px 24px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    animation: 'slideUp 0.35s ease',
  },
  manualIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'rgba(0,200,150,0.1)',
    border: '1px solid rgba(0,200,150,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualEyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '2px',
    color: 'var(--green)',
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  manualSub: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  manualList: {
    listStyle: 'none',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    background: 'var(--bg)',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: '14px 16px',
  } as React.CSSProperties,
  manualCTA: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px',
    borderRadius: 12,
    background: 'var(--green)',
    color: '#04080f',
    fontSize: 15,
    fontWeight: 800,
    boxShadow: '0 4px 20px rgba(0,200,150,0.35)',
  },
  manualNote: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
}
