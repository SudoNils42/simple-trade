import { useState, useEffect } from 'react'
import { getApiStats, clearApiCache, rotateProxy } from '../services/api'

export function Settings({ portfolio, onAddCash, onReset }) {
  const [apiStats, setApiStats] = useState(null)
  const [amount, setAmount] = useState('')
  const [confirm, setConfirm] = useState(false)

  const handleAdd = () => {
    const val = parseFloat(amount)
    if (val > 0) {
      onAddCash(val)
      setAmount('')
    }
  }

  const handleReset = () => {
    onReset()
    setConfirm(false)
  }

  const fmt = (n) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00'
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const realisedPnL = portfolio.realisedPnL || 0
  const totalCapital = 10000 + (portfolio.totalDeposits || 0)
  const realisedPnLPercent = (realisedPnL / totalCapital) * 100

  useEffect(() => {
    const updateStats = () => {
      setApiStats(getApiStats())
    }
    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClearCache = () => {
    clearApiCache()
    setApiStats(getApiStats())
  }

  const handleRotateProxy = () => {
    rotateProxy()
    setApiStats(getApiStats())
  }

  return (
    <div className="min-h-screen">
      <header className="pt-14 pb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        <h1 className="text-[34px] font-bold tracking-tight mb-4">Settings</h1>
      </header>

      <main style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        <div className="h-6"></div>
        
        <section className="pb-8 border-b border-zinc-800">
          <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Available Balance
          </div>
          <div className="text-[34px] font-bold mb-5">{fmt(portfolio.balance)}</div>
          
          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Add cash"
              className="flex-1 bg-zinc-900 text-white rounded-xl px-4 py-3 text-[17px] focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!amount || parseFloat(amount) <= 0}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold disabled:text-zinc-600 disabled:bg-zinc-900 transition-colors"
            >
              OK
            </button>
          </div>
        </section>

        <div style={{ height: '48px' }}></div>

        <section className="pb-8 border-b border-zinc-800">
          <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-5">
            Statistics
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-zinc-500">Started</span>
              <span className="font-semibold">{formatDate(portfolio.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Positions</span>
              <span className="font-semibold">{portfolio.positions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Trades</span>
              <span className="font-semibold">{portfolio.history.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Realised P&L</span>
              <span className={`font-semibold ${realisedPnL >= 0 ? 'text-green-500' : 'text-[#ff453a]'}`}>
                {fmt(realisedPnL)} ({realisedPnL >= 0 ? '+' : ''}{realisedPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </section>

        <div style={{ height: '48px' }}></div>

        <section className="pb-8 border-b border-zinc-800">
          <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            API Stats
          </div>
          {apiStats && (
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-[15px]">
                <span className="text-zinc-500">CORS Proxy</span>
                <span className="text-white font-medium">{apiStats.currentProxy}</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-zinc-500">Cache Size</span>
                <span className="text-white font-medium">{apiStats.cacheSize} items</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-zinc-500">Requests (last hour)</span>
                <span className="text-white font-medium">{apiStats.requestCount} / 2000</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-zinc-500">Circuit Breaker</span>
                <span className={`font-medium ${apiStats.circuitState === 'closed' ? 'text-green-500' : apiStats.circuitState === 'open' ? 'text-[#ff453a]' : 'text-yellow-500'}`}>
                  {apiStats.circuitState.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-zinc-500">Failed Requests</span>
                <span className="text-white font-medium">{apiStats.failures}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClearCache}
              className="flex-1 text-blue-400 py-3 rounded-xl font-semibold bg-zinc-900"
            >
              Clear Cache
            </button>
            <button
              onClick={handleRotateProxy}
              className="flex-1 text-orange-400 py-3 rounded-xl font-semibold bg-zinc-900"
            >
              Rotate Proxy
            </button>
          </div>
        </section>

        <div style={{ height: '48px' }}></div>

        <section className="pb-8">
          <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Reset
          </div>
          <p className="text-zinc-500 text-[15px] mb-5">
            Erase everything and start fresh with $10,000.
          </p>
          
          {confirm ? (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 text-white py-3 rounded-xl font-semibold bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-[#ff453a] text-white py-3 rounded-xl font-semibold"
              >
                Confirm
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="w-full text-[#ff453a] py-3 rounded-xl font-semibold bg-zinc-900"
            >
              Reset
            </button>
          )}
        </section>
        
        <div style={{ height: '90px' }}></div>
      </main>
    </div>
  )
}
