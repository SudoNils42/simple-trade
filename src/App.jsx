import { useState, useEffect, useCallback, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { connectWebSockets, fetchClosingPricesFromYahoo, getNYTime, isMarketOpen, setMarketOpen, ASSETS } from './services/api'
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
  const [loadingClosingPrices, setLoadingClosingPrices] = useState(false)
  const wsRef = useRef(null)
  const marketOpenRef = useRef(false)
  const ignoreWebSocketRef = useRef(false)

  useEffect(() => {
    const checkMarketStatus = () => {
      const nyTime = getNYTime()
      const testAsset = { type: 'stock' }
      const wasOpen = marketOpenRef.current
      marketOpenRef.current = isMarketOpen(testAsset, nyTime)
      
      setMarketOpen(marketOpenRef.current)
      
      if (!wasOpen && marketOpenRef.current) {
        console.log('[APP] 🔓 Marché OUVERT - Activation WebSocket temps réel')
        ignoreWebSocketRef.current = false
      } else if (wasOpen && !marketOpenRef.current) {
        console.log('[APP] 🔒 Marché FERMÉ - Chargement NOUVEAUX prix de clôture')
        ignoreWebSocketRef.current = true
        setLoadingClosingPrices(true)
        
        fetchClosingPricesFromYahoo(true).then(closingPrices => {
          if (Object.keys(closingPrices).length > 0) {
            setPrices(prev => ({ ...prev, ...closingPrices }))
          }
          setLoadingClosingPrices(false)
        }).catch(err => {
          console.error('Erreur lors du chargement des prix de clôture:', err)
          setLoadingClosingPrices(false)
        })
      }
      
      return marketOpenRef.current
    }
    
    const initialMarketOpen = checkMarketStatus()
    
    if (!initialMarketOpen) {
      ignoreWebSocketRef.current = true
      setLoadingClosingPrices(true)
      
      fetchClosingPricesFromYahoo(false).then(closingPrices => {
        if (Object.keys(closingPrices).length > 0) {
          setPrices(prev => ({ ...prev, ...closingPrices }))
        }
        setLoadingClosingPrices(false)
      }).catch(err => {
        console.error('Erreur lors du chargement des prix de clôture:', err)
        setLoadingClosingPrices(false)
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
            changePercent: ((price - prevClose) / prevClose) * 100
          }
        }
      })
    })
    
    return () => {
      clearInterval(marketCheckInterval)
      if (wsRef.current) {
        if (wsRef.current.cleanup) {
          wsRef.current.cleanup()
        } else {
          wsRef.current.forEach(ws => ws?.close())
        }
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

  const handleAddCash = useCallback((amount) => {
    const updated = storage.addCash(amount)
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
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home prices={prices} onBuy={handleBuy} loadingClosingPrices={loadingClosingPrices} />} />
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
              onAddCash={handleAddCash}
              onReset={handleReset}
            />
          } 
        />
      </Routes>
      <Nav unseenCount={unseenCount} />
    </HashRouter>
  )
}
