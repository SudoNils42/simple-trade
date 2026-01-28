import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { connectWebSockets, fetchClosingPricesFromYahoo, getNYTime, isMarketOpen, ASSETS } from './services/api'
import * as storage from './services/storage'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { Asset } from './pages/Asset'
import { Portfolio } from './pages/Portfolio'
import { Settings } from './pages/Settings'

export default function App() {
  const [prices, setPrices] = useState({})
  const [portfolio, setPortfolio] = useState(storage.load)
  const [unseenCount, setUnseenCount] = useState(storage.getUnseenCount)
  const wsRef = useRef(null)
  const marketOpenRef = useRef(false)
  const ignoreWebSocketRef = useRef(false)

  useEffect(() => {
    const checkMarketStatus = () => {
      const nyTime = getNYTime()
      const testAsset = { type: 'stock' }
      const wasOpen = marketOpenRef.current
      marketOpenRef.current = isMarketOpen(testAsset, nyTime)
      
      if (!wasOpen && marketOpenRef.current) {
        ignoreWebSocketRef.current = false
      } else if (wasOpen && !marketOpenRef.current) {
        ignoreWebSocketRef.current = true
      }
      
      return marketOpenRef.current
    }
    
    const initialMarketOpen = checkMarketStatus()
    
    if (!initialMarketOpen) {
      ignoreWebSocketRef.current = true
      
      fetchClosingPricesFromYahoo().then(closingPrices => {
        if (Object.keys(closingPrices).length > 0) {
          setPrices(prev => ({ ...prev, ...closingPrices }))
        }
      })
    }
    
    const marketCheckInterval = setInterval(() => {
      checkMarketStatus()
    }, 60000)
    
    wsRef.current = connectWebSockets((symbol, price, data) => {
      const asset = ASSETS.find(a => a.symbol === symbol)
      
      if (asset && asset.type !== 'crypto' && ignoreWebSocketRef.current) {
        return
      }
      
      setPrices(prev => {
        const prevClose = data.previousClose || prev[symbol]?.prevClose || price
        return {
          ...prev,
          [symbol]: {
            price,
            prevClose,
            change: price - prevClose,
            changePercent: ((price - prevClose) / prevClose) * 100,
            marketClosed: data.marketClosed || false
          }
        }
      })
    })
    
    return () => {
      clearInterval(marketCheckInterval)
      if (wsRef.current) {
        wsRef.current.forEach(ws => ws?.close())
        wsRef.current = null
      }
    }
  }, [])

  const handleBuy = useCallback((symbol, name, qty, price) => {
    const updated = storage.buy(symbol, name, qty, price)
    if (updated) {
      setPortfolio(updated)
      setUnseenCount(prev => prev + 1)
      return true
    }
    return false
  }, [])

  const handleSell = useCallback((symbol, qty, price) => {
    const updated = storage.sell(symbol, qty, price)
    if (updated) setPortfolio(updated)
  }, [])

  const handleSetBalance = useCallback((amount) => {
    const updated = storage.setBalance(amount)
    setPortfolio(updated)
  }, [])

  const handleReset = useCallback(() => {
    const updated = storage.reset()
    setPortfolio(updated)
    setUnseenCount(0)
  }, [])

  const handleClearNotifications = useCallback(() => {
    storage.clearUnseen()
    setUnseenCount(0)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home prices={prices} onBuy={handleBuy} />} />
        <Route 
          path="/asset/:symbol" 
          element={
            <Asset 
              prices={prices} 
              portfolio={portfolio}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <Portfolio 
              portfolio={portfolio} 
              prices={prices}
              onClearNotifications={handleClearNotifications}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              portfolio={portfolio}
              onSetBalance={handleSetBalance}
              onReset={handleReset}
            />
          } 
        />
      </Routes>
      <Nav unseenCount={unseenCount} />
    </BrowserRouter>
  )
}
