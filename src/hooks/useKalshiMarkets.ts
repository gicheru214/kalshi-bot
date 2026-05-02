import { useState, useEffect, useRef } from 'react'
import type { Market, Category } from '../types'
import { MARKETS } from '../data/markets'

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? ''
const KALSHI_API = 'https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=1000'
const PROXY_API = WORKER_URL ? `${WORKER_URL}/api/markets` : KALSHI_API
const POLL_INTERVAL = 60_000 // 1 minute
const CACHE_KEY = 'kalshi_live_markets'
const CACHE_TTL = 55_000

// ── Category inference from title + ticker ──────────────────────────────────
function inferCategory(title: string, ticker: string): Category {
  const text = (title + ' ' + ticker).toLowerCase()
  if (/pepe|wif|shib|shiba|bonk|floki|brett|wojak|meme coin|memecoin/i.test(text)) return 'meme'
  if (/bitcoin|btc|ethereum|eth|solana|sol|xrp|ripple|dogecoin|doge|crypto|bnb|avax|avalanche|chainlink|link|usdc|usdt|stablecoin/i.test(text)) return 'crypto'
  if (/nba|nfl|mlb|nhl|ufc|mls|pga|fifa|super bowl|world cup|ncaa|playoff|championship|league title|game [0-9]|series|tournament|win the|beat the|points|score/i.test(text)) return 'sports'
  return 'viral'
}

// ── Map Kalshi API market → our Market type ─────────────────────────────────
function mapMarket(m: Record<string, unknown>, idx: number): Market {
  const yesBid = typeof m.yes_bid === 'number' ? m.yes_bid
    : typeof m.yes_ask === 'number' ? m.yes_ask : 0.5
  const yesPrice = Math.min(99, Math.max(1, Math.round(yesBid * 100)))
  const noPrice = 100 - yesPrice

  // volume_fp is in cents on Kalshi — convert to dollars
  const volumeRaw = typeof m.volume_fp === 'number' ? m.volume_fp : 0
  const vol24hRaw = typeof m.volume_24h_fp === 'number' ? m.volume_24h_fp : 0
  // If values look like dollars already (> typical cents), use as-is
  const divisor = volumeRaw > 1_000_000 ? 100 : 1
  const volume = Math.round(volumeRaw / divisor)
  const vol24h = Math.round(vol24hRaw / divisor)

  const ticker = typeof m.ticker === 'string' ? m.ticker : `market-${idx}`
  const title = typeof m.title === 'string' ? m.title : 'Unknown Market'
  const subtitle = typeof m.subtitle === 'string' ? m.subtitle : title
  const closeTime = typeof m.close_time === 'string' ? m.close_time : ''
  const endDate = closeTime ? closeTime.split('T')[0] : '2025-12-31'

  const category = inferCategory(title, ticker)

  // Rough change proxy: 24h vol as % of total — clamp to ±15
  const change24h = volume > 0
    ? Math.min(15, Math.max(-15, Math.round((vol24h / volume) * 20 - 5)))
    : 0

  return {
    id: ticker,
    title,
    description: subtitle,
    category,
    yesPrice,
    noPrice,
    volume,
    liquidity: Math.round(volume * 0.1),
    endDate,
    trending: idx < 8,
    featured: idx < 3,
    tags: [category],
    change24h,
  }
}

// ── Cache helpers ────────────────────────────────────────────────────────────
function readCache(): Market[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
  } catch {}
  return null
}

function writeCache(markets: Market[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: markets }))
  } catch {}
}

// ── Fetch + sort ─────────────────────────────────────────────────────────────
async function fetchTop30(): Promise<Market[]> {
  const res = await fetch(PROXY_API, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Kalshi API ${res.status}`)
  const json = await res.json()
  const raw: Record<string, unknown>[] = Array.isArray(json.markets) ? json.markets : []

  const sorted = raw
    .filter(m => typeof m.volume_24h_fp === 'number' && (m.volume_24h_fp as number) > 0)
    .sort((a, b) => (b.volume_24h_fp as number) - (a.volume_24h_fp as number))
    .slice(0, 30)

  return sorted.map(mapMarket)
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useKalshiMarkets() {
  const cached = readCache()
  const [markets, setMarkets] = useState<Market[]>(cached ?? MARKETS)
  const [live, setLive] = useState(!!cached)
  const [loading, setLoading] = useState(!cached)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = async () => {
    try {
      const data = await fetchTop30()
      if (data.length > 0) {
        writeCache(data)
        setMarkets(data)
        setLive(true)
      }
    } catch {
      // CORS or network — silently keep existing data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!cached) load()
    timerRef.current = setInterval(load, POLL_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  return { markets, live, loading }
}
