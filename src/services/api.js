import { decodeMessage } from './yahoo-proto'
import { apiManager } from './api-manager'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const ASSETS = [
  { symbol: 'NVDA', name: 'Nvidia', type: 'stock', tvName: 'nvidia' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', tvName: 'tesla' },
  { symbol: 'AMD', name: 'AMD', type: 'stock', tvName: 'advanced-micro-devices' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', tvName: 'apple' },
  { symbol: 'PLTR', name: 'Palantir', type: 'stock', tvName: 'palantir' },
  { symbol: 'F', name: 'Ford', type: 'stock', tvName: 'ford' },
  { symbol: 'SOFI', name: 'SoFi', type: 'stock', tvName: 'sofi' },
  { symbol: 'INTC', name: 'Intel', type: 'stock', tvName: 'intel' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', tvName: 'amazon' },
  { symbol: 'META', name: 'Meta', type: 'stock', tvName: 'meta' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', tvName: 'microsoft' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock', tvName: 'alphabet' },
  { symbol: 'NFLX', name: 'Netflix', type: 'stock', tvName: 'netflix' },
  { symbol: 'UBER', name: 'Uber', type: 'stock', tvName: 'uber' },
  { symbol: 'BA', name: 'Boeing', type: 'stock', tvName: 'boeing' },
  { symbol: 'SNAP', name: 'Snap', type: 'stock', tvName: 'snap' },
  { symbol: 'ABNB', name: 'Airbnb', type: 'stock', tvName: 'airbnb' },
  { symbol: 'RBLX', name: 'Roblox', type: 'stock', tvName: 'roblox' },
  { symbol: 'DKNG', name: 'DraftKings', type: 'stock', tvName: 'draftkings' },
  { symbol: 'WMT', name: 'Walmart', type: 'stock', tvName: 'walmart' },
  { symbol: 'BAC', name: 'Bank of America', type: 'stock', tvName: 'bank-of-america' },
  { symbol: 'JPM', name: 'JPMorgan', type: 'stock', tvName: 'jpmorgan' },
  { symbol: 'V', name: 'Visa', type: 'stock', tvName: 'visa' },
  { symbol: 'MA', name: 'Mastercard', type: 'stock', tvName: 'mastercard' },
  { symbol: 'KO', name: 'Coca-Cola', type: 'stock', tvName: 'coca-cola' },
  { symbol: 'PEP', name: 'PepsiCo', type: 'stock', tvName: 'pepsico' },
  { symbol: 'DIS', name: 'Disney', type: 'stock', tvName: 'walt-disney' },
  { symbol: 'MCD', name: "McDonald's", type: 'stock', tvName: 'mcdonalds' },
  { symbol: 'NKE', name: 'Nike', type: 'stock', tvName: 'nike' },
  { symbol: 'RGTI', name: 'Rigetti Computing', type: 'stock', tvName: 'rigetti-computing-redeemable--big' },
  { symbol: 'DUOL', name: 'Duolingo', type: 'stock', tvName: 'duolingo' },
  { symbol: 'COIN', name: 'Coinbase', type: 'stock', tvName: 'coinbase' },
  { symbol: 'SHOP', name: 'Shopify', type: 'stock', tvName: 'shopify' },
  { symbol: 'PYPL', name: 'PayPal', type: 'stock', tvName: 'paypal' },
  { symbol: 'RIOT', name: 'Riot Platforms', type: 'stock', tvName: 'riot-blockchain' },
  { symbol: 'MARA', name: 'Marathon Digital', type: 'stock', tvName: 'marathon' },
  { symbol: 'NIO', name: 'Nio', type: 'stock', tvName: 'nio' },
  { symbol: 'BB', name: 'BlackBerry', type: 'stock', tvName: 'blackberry' },
  { symbol: 'IONQ', name: 'IonQ', type: 'stock', tvName: 'ionq' },
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', display: 'BTC', binanceSymbol: 'BTCUSDT' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', display: 'ETH', binanceSymbol: 'ETHUSDT' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', display: 'SOL', binanceSymbol: 'SOLUSDT' },
  { symbol: 'BNB-USD', name: 'Binance Coin', type: 'crypto', display: 'BNB', binanceSymbol: 'BNBUSDT' },
  { symbol: 'XRP-USD', name: 'Ripple', type: 'crypto', display: 'XRP', binanceSymbol: 'XRPUSDT' },
  { symbol: '^GSPC', name: 'S&P 500', type: 'index', display: 'SPX', tvName: 'spx' },
  { symbol: '^IXIC', name: 'Nasdaq', type: 'index', display: 'NDX', tvName: 'nasdaq' },
  { symbol: '^DJI', name: 'Dow Jones', type: 'index', display: 'DJI', tvName: 'dow' },
  { symbol: '^VIX', name: 'Volatility Index', type: 'index', display: 'VIX' },
  { symbol: 'GC=F', name: 'Gold', type: 'futures', display: 'GOLD' },
  { symbol: 'SI=F', name: 'Silver', type: 'futures', display: 'SILVER' },
  { symbol: 'CL=F', name: 'Crude Oil', type: 'futures', display: 'OIL', tvName: 'crude-oil' },
  { symbol: 'NG=F', name: 'Natural Gas', type: 'futures', display: 'GAS', tvName: 'natural-gas' },
  { symbol: 'EURUSD=X', name: 'Euro', type: 'forex', display: 'EUR', currencySymbol: '€' },
  { symbol: 'JPYUSD=X', name: 'Japanese Yen', type: 'forex', display: 'JPY', currencySymbol: '¥', wsSymbol: 'JPY=X', invertPrice: true },
  { symbol: 'GBPUSD=X', name: 'British Pound', type: 'forex', display: 'GBP', currencySymbol: '£' },
  { symbol: 'AUDUSD=X', name: 'Australian Dollar', type: 'forex', display: 'AUD', currencySymbol: 'A$' },
  { symbol: 'CADUSD=X', name: 'Canadian Dollar', type: 'forex', display: 'CAD', currencySymbol: 'C$', wsSymbol: 'CAD=X', invertPrice: true },
  { symbol: 'CHFUSD=X', name: 'Swiss Franc', type: 'forex', display: 'CHF', currencySymbol: '₣', wsSymbol: 'CHF=X', invertPrice: true },
  { symbol: 'CNHUSD=X', name: 'Chinese Yuan', type: 'forex', display: 'CNY', currencySymbol: '¥', wsSymbol: 'CNH=X', invertPrice: true },
]

function getYahooApiUrl(path) {
  return `${BACKEND_URL}/api/yahoo${path}`
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function isValidPrice(price) {
  return typeof price === 'number' && 
         !isNaN(price) && 
         isFinite(price) && 
         price > 0 && 
         price < 1000000000
}

let isMarketCurrentlyOpen = true

export function setMarketOpen(isOpen) {
  isMarketCurrentlyOpen = isOpen
}

export function connectWebSockets(onUpdate) {
  const connections = []
  let yahooReconnectTimer = null
  let binanceReconnectTimer = null
  
  const assetLastUpdate = new Map()
  const assetsNeedingFallback = new Set()
  
  function trackUpdate(symbol) {
    assetLastUpdate.set(symbol, Date.now())
    assetsNeedingFallback.delete(symbol)
  }
  
  function connectYahoo() {
    if (yahooReconnectTimer) return
    
    try {
      const yahooWs = new WebSocket('wss://streamer.finance.yahoo.com/')
      
      yahooWs.onopen = () => {
        const symbols = ASSETS.filter(a => a.type !== 'crypto').map(a => a.wsSymbol || a.symbol)
        yahooWs.send(JSON.stringify({ subscribe: symbols }))
      }
      
      yahooWs.onmessage = (event) => {
        try {
          const buffer = typeof event.data === 'string' 
            ? base64ToArrayBuffer(event.data)
            : event.data
          
          const decoded = decodeMessage(buffer)
          
          if (decoded?.id && decoded.price && isValidPrice(decoded.price)) {
            const asset = ASSETS.find(a => a.symbol === decoded.id || a.wsSymbol === decoded.id)
            
            if (!asset) {
              return
            }
            
            const rawPrice = decoded.price
            const rawPreviousClose = decoded.previousClose
            const rawChange = decoded.change || 0
            const rawChangePercent = decoded.changePercent || 0
            
            const price = asset.invertPrice && rawPrice > 0 ? 1 / rawPrice : rawPrice
            const previousClose = asset.invertPrice && rawPreviousClose > 0 ? 1 / rawPreviousClose : rawPreviousClose
            const changePercent = asset.invertPrice ? -rawChangePercent : rawChangePercent
            
            trackUpdate(asset.symbol)
            
            onUpdate(asset.symbol, price, {
              previousClose: previousClose && isValidPrice(previousClose) 
                ? previousClose 
                : price - (price * changePercent / 100),
              change: previousClose && isValidPrice(previousClose) ? price - previousClose : 0,
              changePercent: changePercent
            })
          }
        } catch (e) {}
      }
      
      yahooWs.onerror = () => {}
      
      yahooWs.onclose = () => {
        yahooReconnectTimer = setTimeout(() => {
          yahooReconnectTimer = null
          connectYahoo()
        }, 5000)
      }
      
      connections.push(yahooWs)
      return yahooWs
    } catch (e) {
      yahooReconnectTimer = setTimeout(() => {
        yahooReconnectTimer = null
        connectYahoo()
      }, 5000)
    }
  }
  
  function connectBinance() {
    if (binanceReconnectTimer) return
    
    try {
      const cryptos = ASSETS.filter(a => a.type === 'crypto')
      const streams = cryptos.map(c => `${c.binanceSymbol.toLowerCase()}@ticker`).join('/')
      const binanceWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
      
      binanceWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.data?.s && msg.data?.c) {
            const binanceSymbol = msg.data.s
            const asset = cryptos.find(c => c.binanceSymbol === binanceSymbol)
            if (asset) {
              const price = parseFloat(msg.data.c)
              const prevClose = parseFloat(msg.data.x)
              
              if (isValidPrice(price) && isValidPrice(prevClose)) {
                trackUpdate(asset.symbol)
                
                onUpdate(asset.symbol, price, {
                  previousClose: prevClose,
                  change: price - prevClose,
                  changePercent: ((price - prevClose) / prevClose) * 100
                })
              }
            }
          }
        } catch (e) {}
      }
      
      binanceWs.onerror = () => {}
      
      binanceWs.onclose = () => {
        binanceReconnectTimer = setTimeout(() => {
          binanceReconnectTimer = null
          connectBinance()
        }, 5000)
      }
      
      connections.push(binanceWs)
      return binanceWs
    } catch (e) {
      binanceReconnectTimer = setTimeout(() => {
        binanceReconnectTimer = null
        connectBinance()
      }, 5000)
    }
  }
  
  connectYahoo()
  connectBinance()
  
  const checkAndFetchStaleAssets = () => {
    if (!isMarketCurrentlyOpen) return
    
    const now = Date.now()
    const staleThreshold = 30000
    const allNonCryptoAssets = ASSETS.filter(a => a.type !== 'crypto')
    
    assetsNeedingFallback.clear()
    
    allNonCryptoAssets.forEach(asset => {
      const lastUpdate = assetLastUpdate.get(asset.symbol)
      
      if (!lastUpdate || (now - lastUpdate) > staleThreshold) {
        assetsNeedingFallback.add(asset.symbol)
      }
    })
    
    if (assetsNeedingFallback.size > 0) {
      fetchFallbackPrices()
    }
  }
  
  setTimeout(checkAndFetchStaleAssets, 5000)
  
  const fallbackCheckInterval = setInterval(checkAndFetchStaleAssets, 30000)
  
  const fetchFallbackPrices = async () => {
    if (!isMarketCurrentlyOpen) {
      return
    }
    
    const symbolsToFetch = Array.from(assetsNeedingFallback)
    if (symbolsToFetch.length === 0) return
    
    const batchSize = 15
    
    for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
      const batch = symbolsToFetch.slice(i, i + batchSize)
      
      const promises = batch.map(async (symbol) => {
      try {
        const asset = ASSETS.find(a => a.symbol === symbol)
        if (!asset) return null
        
        const url = getYahooApiUrl(`/v8/finance/chart/${symbol}?interval=1m&range=1d`)
        
        const data = await apiManager.fetch(url, {
          maxAge: 60000,
          useCache: true,
          retries: 2,
          logPrefix: `[FALLBACK ${symbol}]`
        })
        
        const result = data?.chart?.result?.[0]
        if (!result) return null
        
        const meta = result.meta
        const quotes = result.indicators?.quote?.[0]
        const timestamps = result.timestamp || []
        
        if (!quotes || timestamps.length === 0) return null
        
        const lastIdx = timestamps.length - 1
        let rawPrice = quotes.close?.[lastIdx]
        let rawPreviousClose = meta?.previousClose
        
        if (!rawPrice || !isValidPrice(rawPrice)) return null
        
        const price = rawPrice
        const previousClose = rawPreviousClose
        
        const change = previousClose ? price - previousClose : 0
        const changePercent = previousClose ? ((price - previousClose) / previousClose) * 100 : 0
        
        trackUpdate(asset.symbol)
        
        onUpdate(asset.symbol, price, {
          previousClose: previousClose && isValidPrice(previousClose) ? previousClose : price,
          change: change,
          changePercent: changePercent
        })
        
        return symbol
      } catch (e) {
        return null
      }
      })
      
      await Promise.allSettled(promises)
      
      if (i + batchSize < symbolsToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }
  
  return {
    connections,
    cleanup: () => {
      connections.forEach(ws => ws.close())
      if (yahooReconnectTimer) clearTimeout(yahooReconnectTimer)
      if (binanceReconnectTimer) clearTimeout(binanceReconnectTimer)
      clearInterval(fallbackCheckInterval)
    }
  }
}


export function getAsset(symbol) {
  return ASSETS.find(a => a.symbol === symbol)
}

export function searchAssets(query) {
  const q = query.toLowerCase().trim()
  if (!q) return ASSETS
  return ASSETS.filter(a => 
    a.name.toLowerCase().includes(q) || 
    a.symbol.toLowerCase().includes(q) ||
    a.display?.toLowerCase().includes(q)
  )
}

export function getNYTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
}

export function getMarketCountdown(nyTime) {
  if (!nyTime) return null
  
  const day = nyTime.getDay()
  const hour = nyTime.getHours()
  const minute = nyTime.getMinutes()
  const second = nyTime.getSeconds()
  
  const currentSeconds = hour * 3600 + minute * 60 + second
  const marketOpenSeconds = 9 * 3600 + 30 * 60
  const marketCloseSeconds = 16 * 3600
  
  const formatCountdown = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`
    } else {
      return `${m}m ${s}s`
    }
  }
  
  if (day === 0) {
    const secondsUntilMonday = (24 * 3600) + (marketOpenSeconds - currentSeconds)
    return { isOpen: false, countdown: formatCountdown(secondsUntilMonday) }
  }
  
  if (day === 6) {
    const secondsUntilMonday = (2 * 24 * 3600) + (marketOpenSeconds - currentSeconds)
    return { isOpen: false, countdown: formatCountdown(secondsUntilMonday) }
  }
  
  if (currentSeconds >= marketOpenSeconds && currentSeconds < marketCloseSeconds) {
    const secondsLeft = marketCloseSeconds - currentSeconds
    return { isOpen: true, countdown: formatCountdown(secondsLeft) }
  }
  
  if (currentSeconds < marketOpenSeconds) {
    const secondsLeft = marketOpenSeconds - currentSeconds
    return { isOpen: false, countdown: formatCountdown(secondsLeft) }
  }
  
  if (day === 5) {
    const secondsUntilMonday = (2 * 24 * 3600) + (marketOpenSeconds - currentSeconds)
    return { isOpen: false, countdown: formatCountdown(secondsUntilMonday) }
  }
  
  const secondsUntilTomorrow = (24 * 3600) + (marketOpenSeconds - currentSeconds)
  return { isOpen: false, countdown: formatCountdown(secondsUntilTomorrow) }
}

export function isMarketOpen(asset, nyTime) {
  if (!nyTime) return true
  
  if (asset.type === 'crypto') return true
  
  const day = nyTime.getDay()
  const hour = nyTime.getHours()
  const minute = nyTime.getMinutes()
  
  if (day === 0 || day === 6) return false
  
  const currentMinutes = hour * 60 + minute
  const marketOpen = 9 * 60 + 30
  const marketClose = 16 * 60
  
  return currentMinutes >= marketOpen && currentMinutes < marketClose
}

function getSecondsUntilMarketOpen() {
  const nyTime = getNYTime()
  const day = nyTime.getDay()
  const hour = nyTime.getHours()
  const minute = nyTime.getMinutes()
  const second = nyTime.getSeconds()
  
  const currentSeconds = hour * 3600 + minute * 60 + second
  const marketOpenSeconds = 9 * 3600 + 30 * 60
  
  if (day === 0) {
    return (24 * 3600 - currentSeconds) + marketOpenSeconds
  }
  
  if (day === 6) {
    return (2 * 24 * 3600 - currentSeconds) + marketOpenSeconds
  }
  
  if (currentSeconds < marketOpenSeconds) {
    return marketOpenSeconds - currentSeconds
  }
  
  if (day === 5) {
    return (2 * 24 * 3600 - currentSeconds) + marketOpenSeconds
  }
  
  return (24 * 3600 - currentSeconds) + marketOpenSeconds
}

async function fetchSingleClosingPrice(symbol, forceRefresh = false) {
  try {
    const url = getYahooApiUrl(`/v8/finance/chart/${symbol}?interval=1d&range=2d`)
    
    const cacheMaxAge = forceRefresh ? 0 : (getSecondsUntilMarketOpen() * 1000)
    
    const data = await apiManager.fetch(url, {
      maxAge: cacheMaxAge,
      useCache: !forceRefresh,
      retries: 3
    })
    
    if (data?.chart?.result?.[0]) {
      const result = data.chart.result[0]
      const meta = result.meta
      const price = meta.regularMarketPrice || meta.chartPreviousClose
      const prevClose = meta.chartPreviousClose || price
      
      if (price && prevClose && isValidPrice(price) && isValidPrice(prevClose)) {
        const change = price - prevClose
        const changePercent = (change / prevClose) * 100
        
        return {
          symbol,
          data: {
            price,
            prevClose,
            change,
            changePercent
          }
        }
      }
    }
    
    return null
  } catch (err) {
    return null
  }
}

export async function fetchClosingPricesFromYahoo(forceRefresh = false) {
  try {
    const symbols = ASSETS.filter(a => a.type !== 'crypto').map(a => a.symbol)
    
    const prices = {}
    const batchSize = 10
    const batchDelay = 500
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize)
      
      const results = await Promise.allSettled(
        batch.map(symbol => fetchSingleClosingPrice(symbol, forceRefresh))
      )
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          prices[result.value.symbol] = result.value.data
        }
      }
      
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay))
      }
    }
    
    return prices
  } catch (err) {
    return {}
  }
}

export async function fetchHistoricalData(symbol, range = '1d') {
  try {
    const asset = ASSETS.find(a => a.symbol === symbol)
    const shouldInvert = asset?.invertPrice || false
    
    const rangeMap = {
      '24h': '1d',
      '7d': '7d',
      '1m': '1mo',
      '1y': '1y',
      'all': 'max'
    }
    
    const yahooRange = rangeMap[range] || '1d'
    const interval = range === '24h' ? '5m' : (range === '7d' ? '30m' : (range === '1m' ? '1h' : (range === '1y' ? '1d' : '1d')))
    
    const cacheMaxAge = range === '24h' ? 60000 : (range === '7d' ? 300000 : (range === '1m' ? 600000 : 3600000))
    
    const url = getYahooApiUrl(`/v8/finance/chart/${symbol}?interval=${interval}&range=${yahooRange}`)
    
    const data = await apiManager.fetch(url, {
      maxAge: cacheMaxAge,
      useCache: true,
      retries: 2
    })
    
    if (data?.chart?.error) {
      return []
    }
    
    if (data?.chart?.result?.[0]) {
      const result = data.chart.result[0]
      const timestamps = result.timestamp || []
      const closes = result.indicators?.quote?.[0]?.close || []
      
      const chartData = timestamps.map((time, i) => ({
        time,
        value: shouldInvert && closes[i] > 0 ? 1 / closes[i] : closes[i]
      })).filter(d => d.value != null)
      
      return chartData
    }
    
    return []
  } catch (err) {
    return []
  }
}

export function getLogoUrl(asset) {
  if (asset.type === 'crypto') {
    const cryptoSymbol = asset.symbol.replace('-USD', '')
    return `https://s3-symbol-logo.tradingview.com/crypto/XTVC${cryptoSymbol}.svg`
  }
  
  if (asset.type === 'index' && asset.tvName) {
    return `https://s3-symbol-logo.tradingview.com/${asset.tvName}.svg`
  }
  
  if (asset.type === 'futures') {
    if (asset.display === 'GOLD') {
      return `https://s3-symbol-logo.tradingview.com/metal/gold--big.svg`
    }
    if (asset.display === 'SILVER') {
      return `https://s3-symbol-logo.tradingview.com/metal/silver--big.svg`
    }
    if (asset.tvName) {
      return `https://s3-symbol-logo.tradingview.com/${asset.tvName}.svg`
    }
  }
  
  if (asset.type === 'forex') {
    const forexLogos = {
      'EURUSD=X': 'https://s3-symbol-logo.tradingview.com/country/EU.svg',
      'JPYUSD=X': 'https://s3-symbol-logo.tradingview.com/country/JP.svg',
      'GBPUSD=X': 'https://s3-symbol-logo.tradingview.com/country/GB.svg',
      'AUDUSD=X': 'https://s3-symbol-logo.tradingview.com/country/AU.svg',
      'CADUSD=X': 'https://s3-symbol-logo.tradingview.com/country/CA.svg',
      'CHFUSD=X': 'https://s3-symbol-logo.tradingview.com/country/CH.svg',
      'CNHUSD=X': 'https://s3-symbol-logo.tradingview.com/country/CN.svg'
    }
    
    if (forexLogos[asset.symbol]) {
      return forexLogos[asset.symbol]
    }
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="20" fill="#18181b"/>
        <text x="20" y="27" font-family="system-ui" font-size="16" font-weight="600" fill="#fafafa" text-anchor="middle">${asset.currencySymbol}</text>
      </svg>
    `)}`
  }
  
  if (asset.tvName) {
    return `https://s3-symbol-logo.tradingview.com/${asset.tvName}.svg`
  }
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="#18181b"/>
      <text x="20" y="25" font-family="system-ui" font-size="11" font-weight="700" fill="#fafafa" text-anchor="middle">${asset.display || asset.symbol.slice(0, 3)}</text>
    </svg>
  `)}`
}

