import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAsset, getLogoUrl, fetchHistoricalData } from '../services/api'
import { Chart } from '../components/Chart'

export function Asset({ prices, portfolio, onBuy, onSell }) {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [chartData, setChartData] = useState([])
  const [qty, setQty] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [showCustomPrice, setShowCustomPrice] = useState(false)
  const [mode, setMode] = useState('buy')
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoadingChart, setIsLoadingChart] = useState(false)

  const asset = getAsset(symbol)
  const logoUrl = asset ? getLogoUrl(asset) : null
  const priceData = prices[symbol]
  const position = portfolio.positions.find(p => p.symbol === symbol)

  const getPositionData = (pos) => {
    if (!pos) return null
    if (pos.lots) {
      const totalQty = pos.lots.reduce((sum, lot) => sum + lot.qty, 0)
      const totalCost = pos.lots.reduce((sum, lot) => sum + (lot.qty * lot.price), 0)
      const avgPrice = totalCost / totalQty
      return { qty: totalQty, avg: avgPrice, lots: pos.lots }
    }
    return { qty: pos.qty, avg: pos.avg, lots: null }
  }

  const posData = getPositionData(position)

  const price = priceData?.price || 0
  
  const change = (() => {
    if (timeRange === '24h') {
      return priceData?.changePercent || 0
    }
    
    if (chartData.length > 0 && price > 0) {
      const firstPrice = chartData[0].value
      if (firstPrice && firstPrice > 0) {
        return ((price - firstPrice) / firstPrice) * 100
      }
    }
    
    return priceData?.changePercent || 0
  })()
  
  const isUp = change >= 0

  useEffect(() => {
    if (!asset) return
    
    setIsLoadingChart(true)
    fetchHistoricalData(symbol, timeRange).then(data => {
      setChartData(data)
      setIsLoadingChart(false)
    }).catch(() => {
      setIsLoadingChart(false)
    })
  }, [symbol, timeRange, asset])

  useEffect(() => {
    setCustomPrice('')
    setShowCustomPrice(false)
  }, [mode])

  if (!asset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <p className="text-zinc-500 mb-4">Asset not found</p>
        <button onClick={() => navigate('/')} className="text-blue-500">Back</button>
      </div>
    )
  }

  const buyPrice = mode === 'buy' && customPrice ? (parseFloat(customPrice) || price) : price
  const shares = parseFloat(qty) || 0
  const total = shares * buyPrice
  const canBuy = shares > 0 && total <= portfolio.balance
  const canSell = shares > 0 && position && posData && shares <= posData.qty

  const maxShares = mode === 'buy' ? (buyPrice > 0 ? portfolio.balance / buyPrice : 0) : (posData?.qty || 0)

  const handlePercentage = (percent) => {
    const amount = (maxShares * percent).toFixed(4)
    setQty(amount)
  }

  const handleTrade = () => {
    if (mode === 'buy' && canBuy) {
      onBuy(symbol, asset.name, shares, buyPrice)
      setQty('')
      setCustomPrice('')
      setShowCustomPrice(false)
    } else if (mode === 'sell' && canSell) {
      onSell(symbol, shares, price)
      setQty('')
    }
  }

  const fmt = (n) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00'

  return (
    <div className="min-h-screen bg-black">
      <header className="pb-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: 'calc(env(safe-area-inset-top) + 56px)' }}>
        <div className="flex items-start justify-between" style={{ marginTop: '4px' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden p-2.5 flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={asset.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `<span class="text-lg font-bold text-zinc-300">${asset.symbol.slice(0, 2).toUpperCase()}</span>`
                }}
              />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-white leading-tight">{asset.name}</h1>
              <p className="text-zinc-500 text-[17px]">{asset.display || asset.symbol}</p>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-[28px] font-bold tracking-tight text-white leading-tight">{fmt(price)}</div>
            <div className={`text-[17px] font-semibold ${isUp ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
              {isUp ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6" style={{ marginTop: '48px', paddingLeft: '8px', paddingRight: '8px' }}>
        <div className="h-48">
          {isLoadingChart ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
            </div>
          ) : chartData.length >= 2 ? (
            <Chart data={chartData} color={isUp ? '#30d158' : '#ff453a'} currentPrice={price} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              No data available for this period
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-6">
          {['all', '1y', '1m', '7d', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0px 4px',
                borderRadius: '3px',
                minWidth: '28px',
                lineHeight: '1.2'
              }}
              className={`text-[15px] font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {range === 'all' ? 'All' : range === '1y' ? '1Y' : range === '1m' ? '1M' : range === '7d' ? '7D' : '24H'}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-8" style={{ marginTop: '48px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setMode('buy')}
              className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                mode === 'buy' ? 'bg-[#30d158] text-black' : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMode('sell')}
              className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                mode === 'sell' ? 'bg-[#ff453a] text-white' : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              Sell
            </button>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div style={{ width: '100%', background: '#18181b', borderRadius: '12px', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '16px', paddingRight: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', width: '100%' }}
              />
              <span style={{ position: 'absolute', right: '16px', color: '#71717a', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>shares</span>
            </div>
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max={maxShares}
                step="0.0001"
                value={qty || 0}
                onChange={(e) => setQty(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${mode === 'buy' ? '#30d158' : '#ff453a'} 0%, ${mode === 'buy' ? '#30d158' : '#ff453a'} ${maxShares > 0 ? ((qty || 0) / maxShares) * 100 : 0}%, #27272a ${maxShares > 0 ? ((qty || 0) / maxShares) * 100 : 0}%, #27272a 100%)`,
                  touchAction: 'pan-y'
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-600">
              <button type="button" onClick={() => handlePercentage(0)} className="hover:text-zinc-400 transition-colors">0%</button>
              <button type="button" onClick={() => handlePercentage(0.25)} className="hover:text-zinc-400 transition-colors">25%</button>
              <button type="button" onClick={() => handlePercentage(0.5)} className="hover:text-zinc-400 transition-colors">50%</button>
              <button type="button" onClick={() => handlePercentage(0.75)} className="hover:text-zinc-400 transition-colors">75%</button>
              <button type="button" onClick={() => handlePercentage(1)} className="hover:text-zinc-400 transition-colors">100%</button>
            </div>
          </div>

          <div className="flex justify-between text-[15px] mb-2">
            <span className="text-zinc-500">{mode === 'buy' && customPrice ? 'Custom Price' : 'Price'}</span>
            {mode === 'buy' ? (
              <div className="flex items-center justify-end" style={{ minWidth: '120px' }}>
                {showCustomPrice ? (
                  <>
                    {customPrice && (
                      <button
                        onClick={() => {
                          setCustomPrice('')
                          setShowCustomPrice(false)
                        }}
                        className="text-zinc-500 hover:text-zinc-300 text-[11px]"
                        style={{ marginRight: '8px' }}
                      >
                        Reset
                      </button>
                    )}
                    <span className="text-zinc-400 font-semibold">$</span>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder={price.toFixed(2)}
                      className="font-semibold text-zinc-400"
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        width: `${Math.max(3, (customPrice || price.toFixed(2)).toString().length)}ch`,
                        textAlign: 'left',
                        padding: 0,
                        margin: 0
                      }}
                      autoFocus
                    />
                  </>
                ) : (
                  <button
                    onClick={() => setShowCustomPrice(true)}
                    className="font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    {fmt(buyPrice)}
                  </button>
                )}
              </div>
            ) : (
              <span className="font-semibold text-white">{fmt(price)}</span>
            )}
          </div>

          <div className="flex justify-between text-[15px] mb-2">
            <span className="text-zinc-500">Total</span>
            <span className="font-semibold text-white">{fmt(total)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '20px' }}>
            <span className="text-zinc-500">
              {mode === 'buy' ? 'Available' : 'Owned'}
            </span>
            <span className="font-medium text-white">
              {mode === 'buy' ? fmt(portfolio.balance) : (posData?.qty.toFixed(4) || '0')}
            </span>
          </div>

          <button
            onClick={handleTrade}
            disabled={mode === 'buy' ? !canBuy : !canSell}
            className={`w-full py-4 rounded-xl text-[17px] font-bold transition-all ${
              (mode === 'buy' ? canBuy : canSell)
                ? mode === 'buy'
                  ? 'bg-[#30d158] text-black'
                  : 'bg-[#ff453a] text-white'
                : 'bg-zinc-700 text-zinc-400'
            }`}
          >
            {mode === 'buy' ? 'Buy' : 'Sell'}
          </button>
      </div>

      {position && posData && (
        <div className="pb-8" style={{ marginTop: '48px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5">
            {posData.lots && posData.lots.length > 1 ? 'Positions' : 'Position'} ({posData.lots ? posData.lots.length : 1})
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-zinc-500 text-[15px]">
                Shares: {parseFloat(posData.qty.toFixed(4))}  Avg price: {fmt(posData.avg)}
              </div>
              {(() => {
                const pnl = (price - posData.avg) * posData.qty
                const pct = ((price - posData.avg) / posData.avg) * 100
                const up = pnl >= 0
                return (
                  <div className={`text-[15px] font-semibold flex-shrink-0 ml-4 ${up ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                    {up ? '+' : ''}{fmt(pnl)} ({up ? '+' : ''}{pct.toFixed(2)}%)
                  </div>
                )
              })()}
            </div>
          </div>
          {posData.lots && posData.lots.length > 1 && (
            <div style={{ paddingLeft: '0px', paddingTop: '4px' }}>
              {posData.lots.map((lot, idx) => {
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
          )}
        </div>
      )}
      
      <div style={{ height: '120px' }}></div>
    </div>
  )
}
