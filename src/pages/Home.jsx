import { useState, useMemo, useEffect } from 'react'
import { ASSETS, searchAssets, getAsset, getNYTime, getMarketCountdown } from '../services/api'
import { AssetRow } from '../components/AssetRow'
import { loadFavorites, isFavorite } from '../services/favorites'

export function Home({ prices, onBuy }) {
  const [query, setQuery] = useState('')
  const [favoritesUpdate, setFavoritesUpdate] = useState(0)
  const [nyTime, setNyTime] = useState(null)
  const [localCountdown, setLocalCountdown] = useState(null)
  
  const marketStatus = useMemo(() => {
    if (!nyTime) return null
    return getMarketCountdown(nyTime)
  }, [nyTime])
  
  useEffect(() => {
    if (marketStatus) {
      setLocalCountdown(marketStatus.countdown)
    }
  }, [marketStatus])

  const filtered = useMemo(() => searchAssets(query), [query])
  const favoriteSymbols = useMemo(() => loadFavorites(), [favoritesUpdate])
  const favorites = useMemo(() => {
    return favoriteSymbols
      .map(symbol => getAsset(symbol))
      .filter(asset => asset && (!query || filtered.includes(asset)))
  }, [favoriteSymbols, query, filtered])
  
  const stocks = filtered.filter(a => a.type === 'stock')
  const crypto = filtered.filter(a => a.type === 'crypto')
  const indices = filtered.filter(a => a.type === 'index')
  const futures = filtered.filter(a => a.type === 'futures')
  const forex = filtered.filter(a => a.type === 'forex')
  
  useEffect(() => {
    setNyTime(getNYTime())
    
    const syncInterval = setInterval(() => {
      setNyTime(getNYTime())
    }, 60000)
    
    return () => clearInterval(syncInterval)
  }, [])
  
  useEffect(() => {
    if (!localCountdown || !marketStatus) return
    
    const decrementInterval = setInterval(() => {
      setLocalCountdown(prevCountdown => {
        if (!prevCountdown) return prevCountdown
        
        const parts = prevCountdown.match(/(\d+)h\s*(\d+)m\s*(\d+)s|(\d+)m\s*(\d+)s/)
        if (!parts) return prevCountdown
        
        let hours = 0
        let minutes = 0
        let seconds = 0
        
        if (parts[1]) {
          hours = parseInt(parts[1])
          minutes = parseInt(parts[2])
          seconds = parseInt(parts[3])
        } else if (parts[4]) {
          minutes = parseInt(parts[4])
          seconds = parseInt(parts[5])
        }
        
        let totalSeconds = hours * 3600 + minutes * 60 + seconds - 1
        
        if (totalSeconds <= 0) {
          setNyTime(getNYTime())
          return prevCountdown
        }
        
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        
        if (h > 0) {
          return `${h}h ${m}m ${s}s`
        } else {
          return `${m}m ${s}s`
        }
      })
    }, 1000)
    
    return () => clearInterval(decrementInterval)
  }, [localCountdown, marketStatus])

  const handleFavoriteChange = () => {
    setFavoritesUpdate(prev => prev + 1)
  }

  return (
    <div className="min-h-screen overflow-y-auto scrollbar-hide">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl pt-14 pb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        <h1 className="text-[34px] font-bold tracking-tight mb-2">Markets</h1>
        {marketStatus && localCountdown && (
          <div className="flex items-center gap-2 mb-6">
            {marketStatus.isOpen ? (
              <>
                <div className="w-2 h-2 bg-[#ff453a] rounded-full animate-pulse-record flex-shrink-0"></div>
                <span className="text-[15px] font-semibold text-white">Open</span>
                <span className="text-zinc-600 text-[15px]">•</span>
                <span className="text-[15px] text-zinc-600">Closes in {localCountdown}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a5 5 0 015 5v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 015-5zm0 2a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
                </svg>
                <span className="text-[15px] font-semibold text-[#ff453a]">Closed</span>
                <span className="text-zinc-600 text-[15px]">•</span>
                <span className="text-[15px] text-zinc-600">Opens in {localCountdown}</span>
              </>
            )}
          </div>
        )}
        <div className="relative w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-500 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-zinc-900 text-white placeholder:text-zinc-500 rounded-xl py-3 pr-4 text-[17px] focus:outline-none"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </header>

      <main>
        <div className="h-6"></div>
        
        {favorites.length > 0 && (
          <>
            <section>
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                Favorites
              </h2>
            <div className="divide-y divide-zinc-800">
              {favorites.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={true}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={prices[a.symbol]?.marketClosed || false}
                />
              ))}
            </div>
          </section>
          <div style={{ height: '48px' }}></div>
          </>
        )}

        {stocks.length > 0 && (
          <>
            <section>
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                Stocks
              </h2>
            <div className="divide-y divide-zinc-800">
              {stocks.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={isFavorite(a.symbol)}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={prices[a.symbol]?.marketClosed || false}
                />
              ))}
            </div>
          </section>
          <div style={{ height: '48px' }}></div>
          </>
        )}

        {crypto.length > 0 && (
          <>
            <section>
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                Crypto
              </h2>
            <div className="divide-y divide-zinc-800">
              {crypto.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={isFavorite(a.symbol)}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={false}
                />
              ))}
            </div>
          </section>
          <div style={{ height: '48px' }}></div>
          </>
        )}

        {indices.length > 0 && (
          <>
            <section>
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                Indices
              </h2>
            <div className="divide-y divide-zinc-800">
              {indices.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={isFavorite(a.symbol)}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={prices[a.symbol]?.marketClosed || false}
                />
              ))}
            </div>
          </section>
          <div style={{ height: '48px' }}></div>
          </>
        )}

        {futures.length > 0 && (
          <>
            <section>
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                Futures
              </h2>
            <div className="divide-y divide-zinc-800">
              {futures.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={isFavorite(a.symbol)}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={prices[a.symbol]?.marketClosed || false}
                />
              ))}
            </div>
          </section>
          <div style={{ height: '48px' }}></div>
          </>
        )}

        {forex.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              Forex
            </h2>
            <div className="divide-y divide-zinc-800">
              {forex.map(a => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  display={a.display}
                  price={prices[a.symbol]?.price}
                  changePercent={prices[a.symbol]?.changePercent}
                  isFavorite={isFavorite(a.symbol)}
                  onFavoriteChange={handleFavoriteChange}
                  onBuy={onBuy}
                  marketClosed={prices[a.symbol]?.marketClosed || false}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            No results
          </div>
        )}
        
        <div style={{ height: '90px' }}></div>
      </main>
    </div>
  )
}
