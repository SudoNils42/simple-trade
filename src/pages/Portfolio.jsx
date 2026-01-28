import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAsset, getLogoUrl } from '../services/api'

export function Portfolio({ portfolio, prices, onClearNotifications }) {
  const [expandedPositions, setExpandedPositions] = useState({})

  useEffect(() => {
    if (onClearNotifications) {
      onClearNotifications()
    }
  }, [onClearNotifications])

  const toggleExpanded = (symbol, e) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedPositions(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }))
  }

  const getPositionData = (pos) => {
    if (pos.lots) {
      const totalQty = pos.lots.reduce((sum, lot) => sum + lot.qty, 0)
      const totalCost = pos.lots.reduce((sum, lot) => sum + (lot.qty * lot.price), 0)
      const avgPrice = totalCost / totalQty
      return { qty: totalQty, avg: avgPrice, lots: pos.lots }
    }
    return { qty: pos.qty, avg: pos.avg, lots: null }
  }

  const stats = useMemo(() => {
    let invested = 0
    let current = 0

    portfolio.positions.forEach(pos => {
      const { qty, avg } = getPositionData(pos)
      const price = prices[pos.symbol]?.price || avg
      invested += qty * avg
      current += qty * price
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
      const { qty: qtyA, avg: avgA } = getPositionData(a)
      const { qty: qtyB, avg: avgB } = getPositionData(b)
      const priceA = prices[a.symbol]?.price || avgA
      const priceB = prices[b.symbol]?.price || avgB
      const pnlA = (priceA - avgA) * qtyA
      const pnlB = (priceB - avgB) * qtyB
      return pnlB - pnlA
    })
  }, [portfolio.positions, prices])

  const totalLots = useMemo(() => {
    return portfolio.positions.reduce((sum, pos) => {
      const { lots } = getPositionData(pos)
      return sum + (lots ? lots.length : 1)
    }, 0)
  }, [portfolio.positions])

  return (
    <div className="min-h-screen">
      <header className="pt-14 pb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
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
                      {totalLots <= 1 ? 'Position' : 'Positions'} ({totalLots})
            </h2>
            <div className="divide-y divide-zinc-800">
                      {sortedPositions.map(pos => {
                        const asset = getAsset(pos.symbol)
                        const logoUrl = asset ? getLogoUrl(asset) : null
                        const { qty, avg, lots } = getPositionData(pos)
                        const price = prices[pos.symbol]?.price || avg
                        const value = qty * price
                        const pnl = (price - avg) * qty
                        const pct = ((price - avg) / avg) * 100
                        const up = pnl >= 0

                        return (
                          <div key={pos.symbol}>
                            <Link
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
                                    <button
                                      onClick={(e) => toggleExpanded(pos.symbol, e)}
                                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-[15px]"
                                      style={{
                                        padding: '8px',
                                        margin: '-8px'
                                      }}
                                    >
                                      <svg 
                                        width="12" 
                                        height="12" 
                                        viewBox="0 0 12 12" 
                                        fill="none"
                                        style={{
                                          transform: expandedPositions[pos.symbol] ? 'rotate(90deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.2s ease'
                                        }}
                                      >
                                        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      <span>Details</span>
                                    </button>
                                    <div className={`text-[15px] font-semibold flex-shrink-0 ml-4 ${up ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                                      {up ? '+' : ''}{fmt(pnl)} ({up ? '+' : ''}{pct.toFixed(2)}%)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            {lots && expandedPositions[pos.symbol] && (
                              <>
                                <div style={{ paddingLeft: '62px', paddingRight: '8px' }}>
                                  {lots.map((lot, idx) => {
                                    const lotPnl = (price - lot.price) * lot.qty
                                    const lotUp = lotPnl >= 0
                                    return (
                                      <div 
                                        key={idx} 
                                        className="flex items-center justify-between text-[13px] text-zinc-500"
                                        style={{ paddingTop: '2px', paddingBottom: '2px', borderTop: idx === 0 ? '1px solid #27272a' : 'none' }}
                                      >
                                        <div>
                                          {parseFloat(lot.qty.toFixed(4))} shares × {fmt(lot.price)}
                                        </div>
                                        <div className={lotUp ? 'text-[#30d158]' : 'text-[#ff453a]'}>
                                          {lotUp ? '+' : ''}{fmt(lotPnl)}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div style={{ height: '4px' }}></div>
                              </>
                            )}
                          </div>
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
