import { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAsset, getLogoUrl } from '../services/api'

export function Portfolio({ portfolio, prices, onClearNotifications }) {
  useEffect(() => {
    if (onClearNotifications) {
      onClearNotifications()
    }
  }, [onClearNotifications])
  const stats = useMemo(() => {
    let invested = 0
    let current = 0

    portfolio.positions.forEach(pos => {
      const price = prices[pos.symbol]?.price || pos.avg
      invested += pos.qty * pos.avg
      current += pos.qty * price
    })

    const pnl = current - invested
    const pct = invested > 0 ? (pnl / invested) * 100 : 0
    const total = portfolio.balance + current

    return { total, pnl, pct, invested, current }
  }, [portfolio, prices])

  const isUp = stats.pnl >= 0
  const fmt = (n) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00'

  const sortedPositions = useMemo(() => {
    return [...portfolio.positions].sort((a, b) => {
      const priceA = prices[a.symbol]?.price || a.avg
      const priceB = prices[b.symbol]?.price || b.avg
      const pnlA = (priceA - a.avg) * a.qty
      const pnlB = (priceB - b.avg) * b.qty
      return pnlB - pnlA
    })
  }, [portfolio.positions, prices])

  return (
    <div className="min-h-screen">
      <header className="pt-14 pb-6" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        <h1 className="text-[34px] font-bold tracking-tight mb-6">Portfolio</h1>
        
        <div>
          <div className="text-zinc-500 text-[13px] uppercase tracking-wider mb-2">Total Value</div>
          <div className="text-[42px] font-bold tracking-tight">{fmt(stats.total)}</div>
          {stats.invested > 0 && (
            <div className={`text-[20px] font-semibold ${isUp ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
              {isUp ? '+' : ''}{fmt(stats.pnl)} ({isUp ? '+' : ''}{stats.pct.toFixed(2)}%)
            </div>
          )}
        </div>
      </header>

      <main>
        <div className="h-6"></div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-800" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                  <span className="text-zinc-500">Available Cash</span>
                  <span className="text-[17px] font-semibold">{fmt(portfolio.balance)}</span>
                </div>

                <div style={{ height: '48px' }}></div>

                {portfolio.positions.length > 0 ? (
                  <section>
                    <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                      Positions ({portfolio.positions.length})
            </h2>
            <div className="divide-y divide-zinc-800">
                      {sortedPositions.map(pos => {
                        const asset = getAsset(pos.symbol)
                        const logoUrl = asset ? getLogoUrl(asset) : null
                        const price = prices[pos.symbol]?.price || pos.avg
                        const value = pos.qty * price
                        const pnl = (price - pos.avg) * pos.qty
                        const pct = ((price - pos.avg) / pos.avg) * 100
                        const up = pnl >= 0

                        return (
                          <Link
                            key={pos.symbol}
                            to={`/asset/${encodeURIComponent(pos.symbol)}`}
                            className="block active:opacity-60 transition-opacity"
                            style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                          >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        <img 
                          src={logoUrl} 
                          alt={pos.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-zinc-300">${pos.symbol.slice(0, 2).toUpperCase()}</span>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-[17px]">{pos.name}</div>
                          <div className="font-semibold text-[17px] flex-shrink-0 ml-4">{fmt(value)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-zinc-500 text-[15px]">
                            Shares: {parseFloat(pos.qty.toFixed(4))}  Avg price: {fmt(pos.avg)}
                          </div>
                          <div className={`text-[15px] font-semibold flex-shrink-0 ml-4 ${up ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                            {up ? '+' : ''}{fmt(pnl)} ({up ? '+' : ''}{pct.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
                ) : (
                  <div className="text-center py-16" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                    <p className="text-zinc-500 text-[17px] mb-4">No positions</p>
                    <Link to="/" className="text-blue-500 text-[17px] font-medium">
                      Start investing
                    </Link>
                  </div>
                )}
        
        <div style={{ height: '90px' }}></div>
      </main>
    </div>
  )
}
