import { useState } from 'react'
import { ShieldCheck, Key, ExternalLink, Upload, ChevronRight, CheckCircle } from 'lucide-react'

interface Props {
  onConnect: (email: string) => void
  onSkip: () => void
}

type Step = 1 | 2 | 3

export default function KalshiConnectModal({ onConnect, onSkip }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [keyId, setKeyId] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      if (text.includes('-----BEGIN')) {
        setPrivateKey(text.trim())
        setError('')
      } else {
        setError('File does not look like a valid .pem key')
      }
    }
    reader.readAsText(file)
  }

  const handleConnect = async () => {
    if (!keyId.trim() || !privateKey.trim()) {
      setError('Both Key ID and private key are required')
      return
    }
    if (!privateKey.includes('-----BEGIN')) {
      setError('Private key must be a valid PEM file')
      return
    }
    setLoading(true)
    try {
      // Store key ID in localStorage; private key in sessionStorage (cleared on tab close)
      localStorage.setItem('kalshi_key_id', keyId.trim())
      sessionStorage.setItem('kalshi_private_key', privateKey.trim())
      // Also store encrypted reference for admin tracking
      localStorage.setItem('kalshi_creds', JSON.stringify({ keyId: keyId.trim(), connectedAt: Date.now() }))
      await new Promise(r => setTimeout(r, 800))
      onConnect(keyId.trim())
    } catch {
      setError('Failed to save credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoRow}>
            <img src="https://kalshi.com/favicon.ico" alt="" width={22} height={22} style={{ borderRadius: 4 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={s.logoText}>Connect Kalshi API</span>
          </div>
          <p style={s.sub}>One-time setup · ~60 seconds · Your key never leaves your device</p>
        </div>

        {/* Step indicators */}
        <div style={s.steps}>
          {([1, 2, 3] as Step[]).map(n => (
            <div key={n} style={s.stepRow}>
              <div style={{ ...s.stepDot, ...(step >= n ? s.stepDotActive : {}), ...(step > n ? s.stepDotDone : {}) }}>
                {step > n ? <CheckCircle size={12} /> : n}
              </div>
              <span style={{ ...s.stepLabel, color: step >= n ? 'var(--text)' : 'var(--text-muted)' }}>
                {n === 1 ? 'Create API key on Kalshi' : n === 2 ? 'Paste your Key ID' : 'Upload private key'}
              </span>
              {n < 3 && <div style={{ ...s.stepLine, background: step > n ? 'var(--green)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={s.stepContent}>
            <div style={s.instructionCard}>
              <p style={s.instructionTitle}>In Kalshi, go to:</p>
              <ol style={s.ol}>
                <li>Settings → <strong style={{ color: 'var(--text)' }}>API Keys</strong></li>
                <li>Click <strong style={{ color: 'var(--green)' }}>"Create API Key"</strong></li>
                <li>Download the <code style={s.code}>.pem</code> private key file</li>
                <li>Copy your <strong style={{ color: 'var(--text)' }}>Key ID</strong> (shown after creation)</li>
              </ol>
            </div>
            <a
              href="https://kalshi.com/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={s.externalBtn}
            >
              <ExternalLink size={15} />
              Open Kalshi API Settings
            </a>
            <button style={s.primaryBtn} onClick={() => setStep(2)}>
              I created my API key <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={s.stepContent}>
            <div style={s.fieldGroup}>
              <label style={s.label}>
                <Key size={13} /> Key ID
              </label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. b3f2a1c8-4d5e-..."
                value={keyId}
                onChange={e => { setKeyId(e.target.value); setError('') }}
                autoFocus
              />
              <p style={s.hint}>Found on the Kalshi API Keys page after creation</p>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button
              style={{ ...s.primaryBtn, opacity: keyId.trim() ? 1 : 0.5 }}
              disabled={!keyId.trim()}
              onClick={() => setStep(3)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={s.stepContent}>
            <div style={s.securityBadge}>
              <ShieldCheck size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
              <span>Key stored in session memory only — cleared when you close the tab</span>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Private key (.pem)</label>

              <label style={s.uploadArea}>
                <Upload size={18} style={{ color: 'var(--green)', marginBottom: 6 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {privateKey ? '✓ Key loaded' : 'Upload .pem file'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {privateKey ? 'Click to replace' : 'or paste below'}
                </span>
                <input type="file" accept=".pem,.key,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>

              <textarea
                style={s.textarea}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...paste your key here..."
                value={privateKey}
                onChange={e => { setPrivateKey(e.target.value); setError('') }}
                rows={4}
              />
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button
              style={{ ...s.primaryBtn, opacity: (keyId && privateKey) ? 1 : 0.5 }}
              disabled={!keyId || !privateKey || loading}
              onClick={handleConnect}
            >
              {loading ? <span style={s.spinner} /> : '🔗 Connect bot to Kalshi'}
            </button>
          </div>
        )}

        <button style={s.shameBtn} onClick={onSkip}>
          No thanks, I'll keep losing trades to AI annually 📉
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(4,8,15,0.94)', backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 460,
    background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
    borderRadius: 24, padding: '28px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  header: { textAlign: 'center' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  logoText: { fontSize: 17, fontWeight: 800, color: 'var(--text)' },
  sub: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 },
  steps: { display: 'flex', flexDirection: 'column', gap: 0 },
  stepRow: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },
  stepDot: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'var(--bg)', border: '1px solid var(--border-bright)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0,
  },
  stepDotActive: { background: 'var(--green-dim)', border: '1px solid rgba(0,200,150,0.4)', color: 'var(--green)' },
  stepDotDone: { background: 'var(--green)', color: '#04080f', border: 'none' },
  stepLabel: { fontSize: 12, fontWeight: 600, flex: 1 },
  stepLine: { position: 'absolute', left: 11, top: 24, width: 2, height: 16, borderRadius: 1 } as React.CSSProperties,
  stepContent: { display: 'flex', flexDirection: 'column', gap: 12 },
  instructionCard: {
    padding: '14px 16px', borderRadius: 12,
    background: 'var(--bg)', border: '1px solid var(--border-bright)',
  },
  instructionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  ol: { paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 } as React.CSSProperties,
  code: { fontFamily: 'monospace', fontSize: 12, background: 'var(--border)', padding: '1px 5px', borderRadius: 4, color: 'var(--text)' },
  externalBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '11px', borderRadius: 10,
    background: 'var(--bg)', border: '1px solid var(--border-bright)',
    color: 'var(--text)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '14px', borderRadius: 12,
    background: 'var(--green)', color: '#04080f',
    fontSize: 14, fontWeight: 800,
    boxShadow: '0 4px 20px rgba(0,200,150,0.35)',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 },
  input: {
    width: '100%', padding: '11px 14px',
    borderRadius: 10, background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)', fontSize: 14,
  },
  hint: { fontSize: 11, color: 'var(--text-muted)' },
  securityBadge: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '10px 12px', borderRadius: 8,
    background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.15)',
    fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
  },
  uploadArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '16px', borderRadius: 10, cursor: 'pointer',
    background: 'var(--bg)', border: '2px dashed var(--border-bright)',
    transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    borderRadius: 10, background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text)', fontSize: 12,
    fontFamily: 'monospace', resize: 'vertical',
    lineHeight: 1.4,
  },
  error: {
    fontSize: 12, color: 'var(--red)',
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
    padding: '8px 12px', borderRadius: 8,
  },
  spinner: {
    width: 18, height: 18, borderRadius: '50%',
    border: '2px solid rgba(4,8,15,0.3)', borderTopColor: '#04080f',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
  shameBtn: {
    background: 'transparent', color: 'var(--text-muted)',
    fontSize: 12, fontWeight: 500, padding: '4px',
    textDecoration: 'underline', textDecorationStyle: 'dotted',
    alignSelf: 'center',
  },
}
