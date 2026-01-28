const KEY = 'tradesimple'
const NOTIF_KEY = 'tradesimple_notif'

const initial = {
  balance: 10000,
  positions: [],
  history: [],
  createdAt: Date.now(),
  realisedPnL: 0,
  totalDeposits: 0
}

export function load() {
  try {
    const data = localStorage.getItem(KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (!parsed.createdAt) {
        parsed.createdAt = Date.now()
      }
      if (parsed.realisedPnL === undefined) {
        parsed.realisedPnL = 0
      }
      if (parsed.totalDeposits === undefined) {
        parsed.totalDeposits = 0
      }
      return parsed
    }
    return { ...initial, createdAt: Date.now() }
  } catch {
    return { ...initial, createdAt: Date.now() }
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function reset() {
  const data = { ...initial, createdAt: Date.now() }
  save(data)
  clearUnseen()
  return data
}

export function addCash(amount) {
  const data = load()
  data.balance += amount
  data.totalDeposits += amount
  save(data)
  return data
}

export function buy(symbol, name, qty, price) {
  const data = load()
  const cost = qty * price
  
  if (cost > data.balance) return null
  
  data.balance -= cost
  
  const idx = data.positions.findIndex(p => p.symbol === symbol)
  if (idx >= 0) {
    const pos = data.positions[idx]
    if (!pos.lots) {
      pos.lots = [{ qty: pos.qty, price: pos.avg, date: Date.now() }]
      delete pos.qty
      delete pos.avg
    }
    pos.lots.push({ qty, price, date: Date.now() })
  } else {
    data.positions.push({ 
      symbol, 
      name, 
      lots: [{ qty, price, date: Date.now() }]
    })
  }
  
  data.history.unshift({
    type: 'buy',
    symbol,
    name,
    qty,
    price,
    date: Date.now()
  })
  
  save(data)
  incrementUnseen()
  return data
}

export function sell(symbol, qty, price) {
  const data = load()
  const idx = data.positions.findIndex(p => p.symbol === symbol)
  
  if (idx < 0) return null
  
  const pos = data.positions[idx]
  
  if (!pos.lots) {
    pos.lots = [{ qty: pos.qty, price: pos.avg, date: Date.now() }]
    delete pos.qty
    delete pos.avg
  }
  
  const totalQty = pos.lots.reduce((sum, lot) => sum + lot.qty, 0)
  if (qty > totalQty) qty = totalQty
  
  let remaining = qty
  let totalPnL = 0
  
  while (remaining > 0 && pos.lots.length > 0) {
    const lot = pos.lots[0]
    const sellQty = Math.min(remaining, lot.qty)
    const pnl = (price - lot.price) * sellQty
    totalPnL += pnl
    
    lot.qty = parseFloat((lot.qty - sellQty).toFixed(8))
    remaining = parseFloat((remaining - sellQty).toFixed(8))
    
    if (lot.qty <= 0.00000001) {
      pos.lots.shift()
    }
  }
  
  data.realisedPnL += totalPnL
  data.balance += qty * price
  
  if (pos.lots.length === 0) {
    data.positions.splice(idx, 1)
  }
  
  data.history.unshift({
    type: 'sell',
    symbol,
    name: pos.name,
    qty,
    price,
    date: Date.now()
  })
  
  save(data)
  return data
}

export function getUnseenCount() {
  try {
    const count = localStorage.getItem(NOTIF_KEY)
    return count ? parseInt(count, 10) : 0
  } catch {
    return 0
  }
}

export function incrementUnseen() {
  const current = getUnseenCount()
  localStorage.setItem(NOTIF_KEY, String(current + 1))
}

export function clearUnseen() {
  localStorage.setItem(NOTIF_KEY, '0')
}
