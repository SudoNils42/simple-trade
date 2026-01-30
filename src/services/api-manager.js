class ApiManager {
  constructor() {
    this.cache = new Map()
    this.rateLimit = {
      maxRequests: 2000,
      perWindow: 3600000,
      requestCount: 0,
      windowStart: Date.now()
    }
    this.circuitBreaker = {
      failures: 0,
      threshold: 10,
      resetTimeout: 60000,
      state: 'closed',
      nextRetry: null
    }
    this.requestQueue = []
    this.isProcessing = false
  }

  loadCacheFromStorage(key) {
    try {
      const stored = localStorage.getItem(`api_cache_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Date.now() - parsed.timestamp < parsed.maxAge) {
          return parsed.data
        }
        localStorage.removeItem(`api_cache_${key}`)
      }
    } catch (e) {}
    return null
  }

  saveCacheToStorage(key, data, maxAge) {
    try {
      localStorage.setItem(`api_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        maxAge
      }))
    } catch (e) {}
  }

  getCacheKey(url) {
    return btoa(url).substring(0, 50)
  }

  canMakeRequest() {
    const now = Date.now()
    
    if (this.circuitBreaker.state === 'open') {
      if (now >= this.circuitBreaker.nextRetry) {
        this.circuitBreaker.state = 'half-open'
        return true
      }
      return false
    }
    
    if (now - this.rateLimit.windowStart > this.rateLimit.perWindow) {
      this.rateLimit.requestCount = 0
      this.rateLimit.windowStart = now
    }
    
    return this.rateLimit.requestCount < this.rateLimit.maxRequests
  }

  recordSuccess() {
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'closed'
      this.circuitBreaker.failures = 0
    }
  }

  recordFailure() {
    this.circuitBreaker.failures++
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'open'
      this.circuitBreaker.nextRetry = Date.now() + this.circuitBreaker.resetTimeout
      console.error('[API] Circuit breaker OUVERT - trop d\'erreurs')
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetch(url, options = {}) {
    const {
      maxAge = 0,
      useCache = true,
      retries = 3,
      logPrefix = '[API]'
    } = options

    const cacheKey = this.getCacheKey(url)
    
    if (useCache && maxAge > 0) {
      const memCached = this.cache.get(cacheKey)
      if (memCached && Date.now() - memCached.timestamp < maxAge) {
        return memCached.data
      }

      const storageCached = this.loadCacheFromStorage(cacheKey)
      if (storageCached) {
        this.cache.set(cacheKey, { data: storageCached, timestamp: Date.now() })
        return storageCached
      }
    }

    if (!this.canMakeRequest()) {
      throw new Error('Rate limit atteint ou circuit breaker ouvert')
    }

    return this.fetchWithRetry(url, options, 0, logPrefix)
  }

  async fetchWithRetry(url, options, attempt, logPrefix) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      this.rateLimit.requestCount++
      
      const res = await fetch(url, {
        signal: controller.signal,
        ...options.fetchOptions
      })
      
      clearTimeout(timeout)

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60')
        const delay = Math.min(retryAfter * 1000, 120000)
        
        console.warn(`${logPrefix} HTTP 429 - Retry dans ${delay}ms`)
        
        if (attempt < options.retries) {
          await this.sleep(delay)
          return this.fetchWithRetry(url, options, attempt + 1, logPrefix)
        }
        throw new Error(`HTTP 429 après ${attempt + 1} tentatives`)
      }

      if (res.status === 500 || res.status === 502 || res.status === 503) {
        if (options.onProxyError) {
          options.onProxyError(url)
        }
        throw new Error(`HTTP ${res.status} - Proxy error`)
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      
      this.recordSuccess()
      
      if (options.onProxySuccess) {
        options.onProxySuccess()
      }

      if (options.useCache && options.maxAge > 0) {
        const cacheKey = this.getCacheKey(url)
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        this.saveCacheToStorage(cacheKey, data, options.maxAge)
      }

      return data

    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`${logPrefix} Timeout après 10s`)
      }
      
      if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        if (options.onProxyError) {
          options.onProxyError(url)
        }
      }

      if (attempt < options.retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
        console.warn(`${logPrefix} Erreur: ${err.message} - Retry dans ${delay}ms`)
        await this.sleep(delay)
        return this.fetchWithRetry(url, options, attempt + 1, logPrefix)
      }

      this.recordFailure()
      throw err
    }
  }

  clearCache() {
    this.cache.clear()
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key)
      }
    })
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      requestCount: this.rateLimit.requestCount,
      circuitState: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures
    }
  }
}

export const apiManager = new ApiManager()

