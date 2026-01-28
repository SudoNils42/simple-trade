import { Link } from 'react-router-dom'
import { getAsset, getLogoUrl } from '../services/api'
import { toggleFavorite } from '../services/favorites'
import { useState, useRef } from 'react'

export function AssetRow({ symbol, name, display, price, changePercent, isFavorite, onFavoriteChange, onBuy, marketClosed }) {
  const isUp = changePercent >= 0
  const asset = getAsset(symbol)
  const logoUrl = asset ? getLogoUrl(asset) : null
  const [swipeX, setSwipeX] = useState(0)
  const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false)
  const [showBuyConfirm, setShowBuyConfirm] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const swipeDirection = useRef(null)
  
  const fmt = (n) => {
    if (!n && n !== 0) return '—'
    return n.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    swipeDirection.current = null
  }

  const handleTouchMove = (e) => {
    const diffX = e.touches[0].clientX - startX.current
    const diffY = e.touches[0].clientY - startY.current
    
    if (swipeDirection.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      swipeDirection.current = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical'
    }
    
    if (swipeDirection.current === 'horizontal') {
      e.preventDefault()
      setIsSwipingHorizontal(true)
      currentX.current = e.touches[0].clientX
      const diff = currentX.current - startX.current
      setSwipeX(Math.max(-80, Math.min(80, diff)))
    }
  }

  const handleTouchEnd = () => {
    if (isSwipingHorizontal && Math.abs(swipeX) > 50) {
      if (swipeX > 0) {
        toggleFavorite(symbol)
        if (onFavoriteChange) onFavoriteChange()
      } else {
        if (onBuy && price) {
          onBuy(symbol, name, 1, price)
          setShowBuyConfirm(true)
          setTimeout(() => setShowBuyConfirm(false), 2000)
        }
      }
    }
    setSwipeX(0)
    setIsSwipingHorizontal(false)
    swipeDirection.current = null
  }

  const favoriteOpacity = Math.min(1, Math.abs(swipeX) / 50)

  return (
    <div 
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {swipeX > 0 && (
        <div 
          className="absolute left-0 inset-y-0 flex items-center justify-center text-amber-400"
          style={{ 
            width: `${Math.abs(swipeX)}px`,
            opacity: favoriteOpacity 
          }}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
      )}
      
      {swipeX < 0 && (
        <div 
          className="absolute right-0 inset-y-0 flex items-center justify-center text-[#30d158]"
          style={{ 
            width: `${Math.abs(swipeX)}px`,
            opacity: favoriteOpacity 
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      )}

      {showBuyConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 pointer-events-none">
          <div className="bg-[#30d158] text-black px-6 py-3 rounded-xl font-bold text-[17px] flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Bought +1
          </div>
        </div>
      )}
      
      <div 
        className="relative bg-black transition-transform"
        style={{ transform: `translateX(${swipeX}px)` }}
      >
        <Link 
          to={`/asset/${encodeURIComponent(symbol)}`}
          className="flex items-center justify-between active:opacity-60 transition-opacity"
          style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden p-2.5 flex-shrink-0 bg-zinc-900">
              <img 
                src={logoUrl} 
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-zinc-300">${(display || symbol).slice(0, 2).toUpperCase()}</span>`
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2">
                <div className="font-semibold text-[17px] leading-tight">{name}</div>
                {isFavorite && (
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ marginTop: '1px' }}>
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                )}
              </div>
              <div className="text-[15px] text-zinc-500">{display || symbol}</div>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-4 flex gap-2">
            {!price || price === 0 ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {marketClosed && (
                  <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ marginTop: '1px' }}>
                    <path d="M12 1a5 5 0 015 5v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 015-5zm0 2a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
                  </svg>
                )}
                <div>
                  <div className="font-semibold text-[18px] leading-tight">{fmt(price)}</div>
                  <div className={`text-[15px] font-semibold ${isUp ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                    {isUp ? '+' : ''}{changePercent?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
