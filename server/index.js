import express from 'express'
import cors from 'cors'
import NodeCache from 'node-cache'

const app = express()
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 })

app.use(cors())
app.use(express.json())

const YAHOO_BASE = 'https://query2.finance.yahoo.com'

let requestCount = 0
let windowStart = Date.now()
const MAX_REQUESTS = 2000
const WINDOW_MS = 3600000

function canMakeRequest() {
  const now = Date.now()
  if (now - windowStart > WINDOW_MS) {
    requestCount = 0
    windowStart = now
  }
  return requestCount < MAX_REQUESTS
}

app.get('/api/yahoo/v8/finance/chart/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { interval, range } = req.query
  
  const cacheKey = `${symbol}_${interval}_${range}`
  const cached = cache.get(cacheKey)
  
  if (cached) {
    console.log(`[CACHE HIT] ${symbol}`)
    return res.json(cached)
  }
  
  if (!canMakeRequest()) {
    console.log(`[RATE LIMIT] Requêtes/heure dépassées`)
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }
  
  try {
    const url = `${YAHOO_BASE}/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    console.log(`[FETCH] ${symbol} (${interval}, ${range})`)
    
    requestCount++
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`[ERROR] ${symbol}: HTTP ${response.status}`)
      return res.status(response.status).json({ error: `Yahoo API returned ${response.status}` })
    }
    
    const data = await response.json()
    
    const ttl = interval === '1m' ? 60 : (interval === '5m' ? 300 : (interval === '1h' ? 3600 : 3600))
    cache.set(cacheKey, data, ttl)
    
    console.log(`[SUCCESS] ${symbol}`)
    res.json(data)
    
  } catch (error) {
    console.error(`[ERROR] ${symbol}:`, error.message)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    cache: {
      keys: cache.keys().length,
      stats: cache.getStats()
    },
    rateLimit: {
      requests: requestCount,
      max: MAX_REQUESTS,
      windowStart: new Date(windowStart).toISOString()
    }
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy démarré sur port ${PORT}`)
  console.log(`📊 Cache: TTL 60s, vérification toutes les 120s`)
  console.log(`🔒 Rate limit: ${MAX_REQUESTS} req/h`)
})

