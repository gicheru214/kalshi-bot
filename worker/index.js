/**
 * Kalshi Bot — Cloudflare Worker
 * Signs Kalshi API requests server-side using RSA-PSS (SHA-256)
 *
 * Routes:
 *   GET  /api/markets          → proxy Kalshi public markets (avoids CORS)
 *   POST /api/trade            → sign + place order on Kalshi
 *   GET  /api/portfolio        → sign + fetch user portfolio
 */

const KALSHI_BASE = 'https://api.elections.kalshi.com/trade-api/v2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ── RSA-PSS signing via Web Crypto ──────────────────────────────────────────
async function buildHeaders(method, path, privateKeyPem) {
  const timestamp = Date.now().toString()
  const message = `${timestamp}${method.toUpperCase()}${path}`

  // Import PEM private key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s/g, '')
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const msgBuffer = new TextEncoder().encode(message)
  const sigBuffer = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 }, // saltLength = hash length for SHA-256
    cryptoKey,
    msgBuffer
  )

  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))

  return {
    'KALSHI-ACCESS-KEY': '',  // filled in per request from body
    'KALSHI-ACCESS-SIGNATURE': signature,
    'KALSHI-ACCESS-TIMESTAMP': timestamp,
    'Content-Type': 'application/json',
  }
}

// ── Handlers ─────────────────────────────────────────────────────────────────
async function handleMarkets() {
  const res = await fetch(
    `${KALSHI_BASE}/markets?status=open&limit=1000`,
    { headers: { Accept: 'application/json' } }
  )
  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function handleTrade(req) {
  const body = await req.json()
  const { keyId, privateKey, ticker, side, action, count, price } = body

  if (!keyId || !privateKey || !ticker || !side || !action || !count || !price) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const path = '/trade-api/v2/portfolio/orders'

  let headers
  try {
    headers = await buildHeaders('POST', path, privateKey)
    headers['KALSHI-ACCESS-KEY'] = keyId
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid private key', detail: err.message }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const orderBody = {
    ticker,
    side,           // "yes" or "no"
    action,         // "buy" or "sell"
    count,          // number of contracts
    yes_price: Math.round(price * 100), // Kalshi uses cents (integer)
    time_in_force: 'fill_or_kill',
    client_order_id: crypto.randomUUID(),
  }

  const kalshiRes = await fetch(`https://api.elections.kalshi.com${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderBody),
  })

  const result = await kalshiRes.json()
  return new Response(JSON.stringify(result), {
    status: kalshiRes.status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function handlePortfolio(req) {
  const url = new URL(req.url)
  const keyId = url.searchParams.get('keyId') || req.headers.get('X-Key-Id') || ''
  const privateKey = decodeURIComponent(url.searchParams.get('privateKey') || '')

  if (!keyId || !privateKey) {
    return new Response(JSON.stringify({ error: 'keyId and privateKey required' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const path = '/trade-api/v2/portfolio/positions'
  const headers = await buildHeaders('GET', path, privateKey)
  headers['KALSHI-ACCESS-KEY'] = keyId

  const kalshiRes = await fetch(`https://api.elections.kalshi.com${path}`, { headers })
  const result = await kalshiRes.json()
  return new Response(JSON.stringify(result), {
    status: kalshiRes.status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// ── Router ────────────────────────────────────────────────────────────────────
export default {
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (url.pathname === '/api/markets' && req.method === 'GET') {
      return handleMarkets()
    }
    if (url.pathname === '/api/trade' && req.method === 'POST') {
      return handleTrade(req)
    }
    if (url.pathname === '/api/portfolio' && req.method === 'GET') {
      return handlePortfolio(req)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  },
}
