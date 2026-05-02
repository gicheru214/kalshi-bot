import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus, X, ArrowRight, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CRYPTO_SUGGESTIONS } from '../data/markets'

const STEPS = ['interests', 'crypto', 'custom', 'done'] as const
type Step = (typeof STEPS)[number]

const INTEREST_OPTIONS = [
  { id: 'crypto',        emoji: '₿',  label: 'Crypto',         desc: 'Bitcoin, ETH, altcoins' },
  { id: 'stocks',        emoji: '📈', label: 'Stocks & ETFs',  desc: 'S&P 500, tech, earnings' },
  { id: 'politics',      emoji: '🏛️', label: 'Politics',       desc: 'Elections, policy, rates' },
  { id: 'sports',        emoji: '⚽', label: 'Sports',         desc: 'NFL, NBA, World Cup' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment',  desc: 'Awards, box office' },
  { id: 'science',       emoji: '🔬', label: 'Science & Tech', desc: 'AI, space, biotech' },
]

const CRYPTO_MARKETS = [
  { id: 'btc200k',  emoji: '₿',  label: 'BTC hits $200K in 2025?',   yes: 61, hot: true },
  { id: 'eth5k',    emoji: 'Ξ',  label: 'ETH reaches $5K in 2025?',  yes: 72, hot: true },
  { id: 'sol1k',    emoji: '◎',  label: 'SOL exceeds $1K by Q3?',    yes: 44, hot: false },
  { id: 'xrpsec',   emoji: 'X',  label: 'XRP wins SEC case?',         yes: 78, hot: false },
  { id: 'doge1',    emoji: 'D',  label: 'DOGE reaches $1?',           yes: 38, hot: false },
  { id: 'etf100b',  emoji: '📊', label: 'BTC ETFs hit $100B AUM?',   yes: 55, hot: true },
]

export default function Onboarding() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('interests')
  const [interests, setInterests] = useState<string[]>(['crypto'])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [customMarkets, setCustomMarkets] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleWatch = (id: string) => {
    setWatchlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustom = (text: string) => {
    const trimmed = text.trim()
    if (trimmed && !customMarkets.includes(trimmed)) {
      setCustomMarkets(prev => [...prev, trimmed])
    }
    setCustomInput('')
  }

  const removeCustom = (text: string) => {
    setCustomMarkets(prev => prev.filter(m => m !== text))
  }

  const handleNext = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const handleFinish = () => {
    updateUser({ onboarded: true, interests })
    navigate('/app')
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      {/* Progress */}
      <div style={styles.progress} className="fade-up">
        <div style={styles.logoRow}>
          <span style={{ color: 'var(--purple-light)' }}>⬡</span>
          <span style={styles.logoText}>PredictFlow</span>
        </div>
        <div style={styles.progressBarWrap}>
          <div style={{ ...styles.progressBarFill, width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span style={styles.progressLabel}>Step {stepIndex + 1} of {STEPS.length}</span>
      </div>

      {/* Step: interests */}
      {step === 'interests' && (
        <div style={styles.content} className="fade-up-1">
          <h1 style={styles.stepTitle}>What do you want to trade?</h1>
          <p style={styles.stepSub}>Pick your interests — we'll personalize your feed.</p>

          <div style={styles.interestGrid}>
            {INTEREST_OPTIONS.map(({ id, emoji, label, desc }) => {
              const active = interests.includes(id)
              return (
                <button
                  key={id}
                  style={{ ...styles.interestCard, ...(active ? styles.interestCardActive : {}) }}
                  onClick={() => toggleInterest(id)}
                >
                  <div style={{ ...styles.interestCheck, ...(active ? styles.interestCheckActive : {}) }}>
                    {active ? <Check size={12} /> : null}
                  </div>
                  <span style={styles.interestEmoji}>{emoji}</span>
                  <p style={styles.interestLabel}>{label}</p>
                  <p style={styles.interestDesc}>{desc}</p>
                </button>
              )
            })}
          </div>

          <button
            style={{ ...styles.nextBtn, ...(interests.length === 0 ? styles.nextBtnDisabled : {}) }}
            onClick={handleNext}
            disabled={interests.length === 0}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step: crypto markets */}
      {step === 'crypto' && (
        <div style={styles.content} className="fade-up-1">
          <div style={styles.stepBadge}>₿ Crypto Markets</div>
          <h1 style={styles.stepTitle}>Hot crypto markets</h1>
          <p style={styles.stepSub}>
            Add the ones you want to follow to your watchlist.
          </p>

          <div style={styles.marketList}>
            {CRYPTO_MARKETS.map(({ id, emoji, label, yes, hot }) => {
              const watching = watchlist.includes(id)
              return (
                <div key={id} style={{ ...styles.marketRow, ...(watching ? styles.marketRowActive : {}) }}>
                  <div style={styles.marketEmoji}>{emoji}</div>
                  <div style={styles.marketInfo}>
                    <p style={styles.marketLabel}>{label}</p>
                    <div style={styles.marketMeta}>
                      {hot && <span style={styles.hotBadge}>🔥 Hot</span>}
                      <div style={styles.miniBar}>
                        <div style={{ ...styles.miniBarFill, width: `${yes}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>YES {yes}¢</span>
                    </div>
                  </div>
                  <button
                    style={{ ...styles.watchBtn, ...(watching ? styles.watchBtnActive : {}) }}
                    onClick={() => toggleWatch(id)}
                  >
                    {watching ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={styles.navRow}>
            <button style={styles.backBtn} onClick={() => setStep('interests')}>Back</button>
            <button style={styles.nextBtn} onClick={handleNext}>
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step: custom markets */}
      {step === 'custom' && (
        <div style={styles.content} className="fade-up-1">
          <div style={styles.stepBadge}>⭐ Custom</div>
          <h1 style={styles.stepTitle}>Create your own markets</h1>
          <p style={styles.stepSub}>
            Type any question you want to bet on — we'll add it to the prediction queue.
          </p>

          {/* Input */}
          <div style={styles.customInputWrap}>
            <input
              style={styles.customInput}
              type="text"
              placeholder="e.g. Will BTC hit $300K in 2026?"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom(customInput)}
            />
            <button style={styles.addBtn} onClick={() => addCustom(customInput)}>
              <Plus size={18} />
            </button>
          </div>

          {/* Suggestions */}
          <div style={styles.suggestionsWrap}>
            <p style={styles.suggestLabel}>Suggestions:</p>
            <div style={styles.suggestionChips}>
              {CRYPTO_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  style={styles.suggestionChip}
                  onClick={() => addCustom(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Added markets */}
          {customMarkets.length > 0 && (
            <div style={styles.customList}>
              <p style={styles.suggestLabel}>Your markets ({customMarkets.length}):</p>
              {customMarkets.map(m => (
                <div key={m} style={styles.customItem}>
                  <span style={styles.customItemText}>{m}</span>
                  <button style={styles.removeBtn} onClick={() => removeCustom(m)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.navRow}>
            <button style={styles.backBtn} onClick={() => setStep('crypto')}>Back</button>
            <button style={styles.nextBtn} onClick={handleNext}>
              {customMarkets.length > 0 ? 'Continue' : 'Skip for now'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div style={styles.content} className="fade-up-1">
          <div style={styles.doneIcon}>🎉</div>
          <h1 style={styles.stepTitle}>You're all set!</h1>
          <p style={styles.stepSub}>
            Your personalized feed is ready. You have $1,000 in practice chips — start trading.
          </p>

          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Interests selected</span>
              <span style={styles.summaryValue}>{interests.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Watchlist markets</span>
              <span style={styles.summaryValue}>{watchlist.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Custom markets</span>
              <span style={styles.summaryValue}>{customMarkets.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Starting balance</span>
              <span style={{ ...styles.summaryValue, color: 'var(--green)' }}>$1,000</span>
            </div>
          </div>

          <button style={styles.launchBtn} onClick={handleFinish}>
            Go to Markets <ArrowRight size={20} />
          </button>
        </div>
      )}
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
    padding: '32px 24px 80px',
    position: 'relative',
    overflow: 'hidden',
    gap: 0,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 700,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  progress: {
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 40,
    position: 'relative',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text)',
  },
  logoText: { letterSpacing: '-0.3px' },
  progressBarWrap: {
    height: 4,
    borderRadius: 2,
    background: 'var(--border)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00c896, #00a8ff)',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'relative',
    zIndex: 1,
  },
  stepBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: 20,
    background: 'var(--purple-dim)',
    border: '1px solid rgba(0,200,150,0.25)',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--green)',
    letterSpacing: '0.3px',
  },
  stepTitle: {
    fontSize: 'clamp(22px, 3vw, 32px)',
    fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  stepSub: {
    fontSize: 15,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginTop: -8,
  },
  // Interests grid
  interestGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },
  interestCard: {
    position: 'relative',
    padding: '16px',
    borderRadius: 14,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  interestCardActive: {
    border: '1px solid rgba(124,58,237,0.5)',
    background: 'var(--purple-dim)',
  },
  interestCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '1px solid var(--border-bright)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
    transition: 'all 0.15s',
  },
  interestCheckActive: {
    background: 'var(--green)',
    border: '1px solid var(--green)',
  },
  interestEmoji: {
    fontSize: 24,
    display: 'block',
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 4,
  },
  interestDesc: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  // Market list
  marketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  marketRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 14,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    transition: 'all 0.15s',
  },
  marketRowActive: {
    border: '1px solid rgba(0,200,150,0.3)',
    background: 'rgba(124,58,237,0.06)',
  },
  marketEmoji: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(251,146,60,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#fb923c',
    flexShrink: 0,
  },
  marketInfo: {
    flex: 1,
  },
  marketLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 6,
  },
  marketMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  hotBadge: {
    fontSize: 11,
    background: 'rgba(251,146,60,0.1)',
    color: '#fb923c',
    padding: '2px 6px',
    borderRadius: 10,
    fontWeight: 600,
  },
  miniBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    background: 'var(--red-dim)',
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    background: 'var(--green)',
    borderRadius: 2,
  },
  watchBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  watchBtnActive: {
    background: 'var(--green)',
    border: '1px solid var(--green)',
    color: '#fff',
  },
  // Custom markets
  customInputWrap: {
    display: 'flex',
    gap: 10,
  },
  customInput: {
    flex: 1,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)',
    fontSize: 14,
    transition: 'border-color 0.15s',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'var(--green)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionsWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  suggestLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  suggestionChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    padding: '6px 12px',
    borderRadius: 20,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  customList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  customItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 10,
    background: 'var(--green-dim)',
    border: '1px solid rgba(16,185,129,0.2)',
    gap: 10,
  },
  customItemText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text)',
    flex: 1,
  },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Nav
  navRow: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    padding: '12px 20px',
    borderRadius: 12,
    background: 'transparent',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 600,
  },
  nextBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '13px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
  },
  nextBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  // Done
  doneIcon: {
    fontSize: 56,
    textAlign: 'center',
    lineHeight: 1,
  },
  summaryCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
  },
  launchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '16px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #00c896, #00a8ff)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
  },
}
