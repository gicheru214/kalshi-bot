/**
 * Client-side Kalshi API service.
 * Sends the private key to our Cloudflare Worker which signs requests server-side.
 * The private key is read from sessionStorage (set during onboarding) and
 * never stored permanently on the server.
 */

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? ''

export interface TradeParams {
  ticker: string
  side: 'yes' | 'no'
  action: 'buy' | 'sell'
  count: number       // number of contracts
  price: number       // price in dollars (e.g. 0.61 for 61¢)
}

export interface TradeResult {
  order?: {
    order_id: string
    ticker: string
    status: string
    side: string
    yes_price: number
    count: number
  }
  error?: string
}

function getCredentials(): { keyId: string; privateKey: string } | null {
  const keyId = localStorage.getItem('kalshi_key_id')
  const privateKey = sessionStorage.getItem('kalshi_private_key')
  if (!keyId || !privateKey) return null
  return { keyId, privateKey }
}

export function isKalshiConnected(): boolean {
  return !!localStorage.getItem('kalshi_key_id') && !!sessionStorage.getItem('kalshi_private_key')
}

export async function placeTrade(params: TradeParams): Promise<TradeResult> {
  if (!WORKER_URL) {
    return { error: 'Backend not configured. Deploy the Cloudflare Worker first.' }
  }

  const creds = getCredentials()
  if (!creds) {
    return { error: 'Kalshi API key not connected. Please reconnect.' }
  }

  const res = await fetch(`${WORKER_URL}/api/trade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...creds, ...params }),
  })

  return res.json()
}

export async function getPortfolio() {
  if (!WORKER_URL) return null
  const creds = getCredentials()
  if (!creds) return null

  const url = new URL(`${WORKER_URL}/api/portfolio`)
  url.searchParams.set('keyId', creds.keyId)
  url.searchParams.set('privateKey', encodeURIComponent(creds.privateKey))

  const res = await fetch(url.toString())
  return res.json()
}
